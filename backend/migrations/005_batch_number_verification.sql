-- Preserve OCR uncertainty so unconfirmed batch numbers are visible downstream.
ALTER TABLE medicines
  ADD COLUMN IF NOT EXISTS batch_number_verified BOOLEAN NOT NULL DEFAULT TRUE;

-- These known test records were truncated during manual data entry. The label
-- confirms the full name, but the low-confidence batch still needs confirmation.
UPDATE medicines
SET medicine_name = 'Crocin Advance',
    batch_number_verified = FALSE
WHERE medicine_name = 'Advance'
  AND batch_number = 'EA2510Z';