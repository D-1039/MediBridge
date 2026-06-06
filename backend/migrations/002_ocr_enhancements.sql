-- OCR workflow: user confirmation audit + manufacturing date

ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'user_confirmed';

ALTER TABLE medicines
  ADD COLUMN IF NOT EXISTS manufacturing_date DATE,
  ADD COLUMN IF NOT EXISTS ocr_matched_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS fuzzy_match_confidence DECIMAL(5, 2);
