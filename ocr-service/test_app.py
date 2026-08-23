import sys
import types
import unittest
from unittest.mock import patch


fake_paddleocr = types.SimpleNamespace(PaddleOCR=lambda **kwargs: object())
REAL_LABEL_WORDS = [
    ("Advance", 0.9655),
    ("Crocin Crocin Crocin Crocin Crocin Crocin Crocin Crocin", 0.9569),
    ("EXP.SEP.2027.MRPFOR20TABS", 0.9358),
    ("B.N0.EA2510ZMFD00T2025", 0.8954),
    ("I.P.500 mg", 0.8682),
]


class MedicalFieldTests(unittest.TestCase):
    def test_crocin_label_fields(self):
        with patch.dict(sys.modules, {"paddleocr": fake_paddleocr}):
            sys.modules.pop("app", None)
            from medical_parser import parse_medical_fields

        result = parse_medical_fields(
            "Crocin Advance Paracetamol I.P. 500 mg "
            "B.No.EA255107 MFD.OCT.2025 EXP.SEP.2027"
        )
        self.assertEqual(result["batchNumber"], "EA255107")
        self.assertEqual(result["manufacturingDate"], "2025-10-01")
        self.assertEqual(result["expiry"], "2027-09-01")
        self.assertEqual(result["dosages"], ["500mg"])

    def test_real_ocr_noise_keeps_dates_and_flags_unreliable_batch(self):
        with patch.dict(sys.modules, {"paddleocr": fake_paddleocr}):
            sys.modules.pop("app", None)
            from app import parse_medical_fields

        result = parse_medical_fields("\n".join(text for text, _ in REAL_LABEL_WORDS))
        self.assertEqual(result["medicineName"], "Crocin Advance")
        self.assertEqual(result["manufacturingDate"], "2025-10-01")
        self.assertEqual(result["expiry"], "2027-09-01")
        self.assertEqual(result["batchNumber"], "EA2510Z")

    def test_batch_confidence_threshold_covers_low_and_high_scores(self):
        with patch.dict(sys.modules, {"paddleocr": fake_paddleocr}):
            sys.modules.pop("app", None)
            from app import get_batch_number_review

        low_score, low_review = get_batch_number_review(
            [{"text": "B.N0.EA2510ZMFD00T2025", "confidence": 0.8954}],
            "EA2510Z",
        )
        high_score, high_review = get_batch_number_review(
            [{"text": "B.No.EA255107", "confidence": 0.98}],
            "EA255107",
        )
        self.assertEqual(low_score, 0.8954)
        self.assertTrue(low_review)
        self.assertEqual(high_score, 0.98)
        self.assertFalse(high_review)


if __name__ == "__main__":
    unittest.main()