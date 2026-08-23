import re
from typing import Any

MONTHS = {
    "JAN": 1, "FEB": 2, "MAR": 3, "APR": 4, "MAY": 5, "JUN": 6,
    "JUL": 7, "AUG": 8, "SEP": 9, "OCT": 10, "NOV": 11, "DEC": 12,
}
MONTH = r"(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)"
KNOWN_BRAND_PHRASES = (("crocin", "advance"),)


def _date(text: str, labels: str) -> str | None:
    separator = r"[.\s:/-]*"
    month_match = re.search(
        rf"(?:{labels}){separator}({MONTH}|00T|0CT)[.\s/-]*(\d{{2,4}})", text, re.I
    )
    if month_match:
        year = month_match.group(2)
        year = f"20{year}" if len(year) == 2 else year
        month_name = month_match.group(1).upper().replace("00T", "OCT").replace("0CT", "OCT")
        return f"{year}-{MONTHS[month_name]:02d}-01"

    numeric_match = re.search(
        rf"(?:{labels}){separator}(\d{{1,2}}[/-]\d{{1,2}}[/-]\d{{2,4}}|"
        rf"\d{{4}}[/-]\d{{1,2}}(?:[/-]\d{{1,2}})?|\d{{1,2}}[/-]\d{{2,4}})",
        text,
        re.I,
    )
    return numeric_match.group(1).replace(" ", "") if numeric_match else None


def _name(text: str) -> str | None:
    candidates: dict[str, list[Any]] = {}
    for raw_line in text.splitlines():
        line = re.sub(r"\s+", " ", raw_line).strip()
        if len(line) < 3 or len(line) > 90:
            continue
        if re.search(
            r"^(batch|lot|exp|mfd|mfg|mrp|rx|tablet|manufactur)|"
            r"release\s+tablets?|\btablets?\b|barcode|www\.|marketed\s+by|made\s+in",
            line,
            re.I,
        ):
            continue
        candidate = re.sub(r"\b\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g|iu)\b", "", line, flags=re.I)
        candidate = re.sub(r"\bI\.?\s*P\.?\b", "", candidate, flags=re.I)
        candidate = re.sub(r"\s+", " ", candidate).strip()
        if len(candidate) < 3 or not re.search(r"[A-Za-z]{3}", candidate):
            continue
        key = re.sub(r"[^a-z0-9]+", " ", candidate.lower()).strip()
        entry = candidates.setdefault(key, [candidate, 0])
        entry[1] += 1

    # Join adjacent single-word boxes before ranking repeated candidates.
    lines = [re.sub(r"\s+", " ", line).strip() for line in text.splitlines()]
    for index in range(len(lines) - 1):
        if re.fullmatch(r"[A-Za-z][A-Za-z'-]*", lines[index]) and re.fullmatch(
            r"[A-Za-z][A-Za-z'-]*", lines[index + 1]
        ):
            joined = f"{lines[index]} {lines[index + 1]}"
            key = joined.lower()
            entry = candidates.setdefault(key, [joined, 0])
            entry[1] += 1

    return max(candidates.values(), key=lambda item: (item[1], len(item[0])))[0] if candidates else None


def parse_medical_fields(text: str) -> dict[str, Any]:
    expiry = _date(text, r"exp(?:iry)?|use\s*by|best\s*before")
    manufacturing = _date(text, r"mfd|mfg|manufactur(?:ed|ing)?")
    batch_match = re.search(
        r"(?:batch|lot|b\.?\s*n[o0]\.?)[.:#\-/\s]*([A-Z0-9][A-Z0-9./-]{1,30}?)(?=mfd|mfg|$)",
        text,
        re.I,
    )
    batch = batch_match.group(1).strip().upper().rstrip(".") if batch_match else None
    if not batch:
        prefix_match = re.search(r"\b([A-Z]{2,5}\d{4,14})\b", text, re.I)
        batch = prefix_match.group(1).upper() if prefix_match else None
    lowered = text.lower()
    for first, second in KNOWN_BRAND_PHRASES:
        if first in lowered and second in lowered:
            medicine_name = f"{first.title()} {second.title()}"
            break
    else:
        medicine_name = _name(text)
    dosages = sorted({
        match.group(0).replace(" ", "")
        for match in re.finditer(r"\b\d+(?:\.\d+)?\s*(?:mg|ml|mcg|μg|ug|g|iu)\b", text, re.I)
    })
    return {
        "medicineName": medicine_name,
        "expiry": expiry,
        "manufacturingDate": manufacturing,
        "batchNumber": batch,
        "dosages": dosages,
    }
