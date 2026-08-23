import re
from io import BytesIO
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image
import numpy as np
from paddleocr import PaddleOCR
from medical_parser import parse_medical_fields


app = FastAPI(title="MediBridge PaddleOCR Service")
ocr = PaddleOCR(use_angle_cls=True, lang="en", use_gpu=False, show_log=False)
FIELD_CONFIDENCE_THRESHOLD = 0.90


def get_batch_number_review(words: list[dict[str, Any]], batch_number: str | None) -> tuple[float | None, bool]:
    if not batch_number:
        return None, False
    matching_scores = [
        word["confidence"]
        for word in words
        if re.search(r"(?:batch|lot|b\.?\s*n[o0]?\.?)", word.get("text", ""), re.I)
        or batch_number.lower() in word.get("text", "").lower()
    ]
    confidence = max(matching_scores) if matching_scores else None
    return confidence, confidence is None or confidence < FIELD_CONFIDENCE_THRESHOLD


def _extract_lines(result: Any) -> list[tuple[str, float]]:
    lines: list[tuple[str, float]] = []
    for page in result or []:
        entries = page.get("rec_texts", []) if isinstance(page, dict) else page
        if isinstance(page, dict):
            scores = page.get("rec_scores", [])
            lines.extend(
                (str(value).strip(), float(scores[index]) if index < len(scores) else 0.0)
                for index, value in enumerate(entries)
                if str(value).strip()
            )
            continue
        for entry in entries or []:
            try:
                text, confidence = entry[1]
                if str(text).strip():
                    lines.append((str(text).strip(), float(confidence)))
            except (IndexError, TypeError, ValueError):
                continue
    return lines


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "source": "paddleocr"}


@app.post("/ocr")
async def recognize_image(image: UploadFile = File(...)) -> dict[str, Any]:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported")

    try:
        image_data = await image.read()
        Image.open(BytesIO(image_data)).verify()
        image_object = Image.open(BytesIO(image_data)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image file") from exc

    result = ocr.ocr(np.asarray(image_object), cls=True)
    lines = _extract_lines(result)
    raw_text = "\n".join(text for text, _ in lines).strip()
    if not raw_text:
        raise HTTPException(status_code=422, detail="No text detected on the medicine image")

    metadata = parse_medical_fields(raw_text)
    words = [{"text": text, "confidence": round(confidence, 4)} for text, confidence in lines]
    confidence = sum(item["confidence"] for item in words) / len(words)
    def confidence_for(pattern: str) -> float | None:
        matches = [item["confidence"] for item in words if re.search(pattern, item["text"], re.I)]
        return max(matches) if matches else None

    name_pattern = re.escape(metadata.get("medicineName") or "")
    name_confidence = confidence_for(name_pattern) if name_pattern else None
    if name_confidence is None and metadata.get("medicineName"):
        token_scores = [
            confidence_for(re.escape(token))
            for token in metadata["medicineName"].split()
            if len(token) >= 3
        ]
        token_scores = [score for score in token_scores if score is not None]
        name_confidence = min(token_scores) if token_scores else None

    batch_confidence, batch_needs_review = get_batch_number_review(words, metadata.get("batchNumber"))
    return {
        "rawText": raw_text,
        "ocrConfidence": round(confidence, 4),
        "source": "paddleocr",
        "medicalMetadata": metadata,
        "words": words,
        "batchNumberConfidence": batch_confidence,
        "batchNumberNeedsReview": batch_needs_review,
    }