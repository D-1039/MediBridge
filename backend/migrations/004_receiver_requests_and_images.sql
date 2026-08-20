-- Receiver requests workflow, status history, assignments, multi-image support

UPDATE donation_requests SET status = 'submitted' WHERE status = 'pending';
UPDATE donation_requests SET status = 'assigned' WHERE status = 'approved';

ALTER TABLE donation_requests
  ADD COLUMN IF NOT EXISTS request_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS requested_quantity INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS assigned_medicine_id UUID REFERENCES medicines(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_quantity INTEGER,
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS search_query TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_donation_requests_code
  ON donation_requests(request_code) WHERE request_code IS NOT NULL;

CREATE SEQUENCE IF NOT EXISTS request_code_seq START 1;

CREATE TABLE IF NOT EXISTS request_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES donation_requests(id) ON DELETE CASCADE,
  status donation_request_status NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_status_history_request
  ON request_status_history(request_id);

CREATE TABLE IF NOT EXISTS medicine_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES donation_requests(id) ON DELETE CASCADE,
  assigned_medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
  assigned_quantity INTEGER NOT NULL DEFAULT 1,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medicine_assignments_request
  ON medicine_assignments(request_id);

CREATE TABLE IF NOT EXISTS medicine_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  label VARCHAR(100),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medicine_images_medicine
  ON medicine_images(medicine_id);

INSERT INTO medicine_images (medicine_id, image_url, label, sort_order)
SELECT m.id, m.image_url, 'front', 0
FROM medicines m
WHERE m.image_url IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM medicine_images mi WHERE mi.medicine_id = m.id
  );

UPDATE donation_requests
SET request_code = 'REQ-' || to_char(created_at, 'YYYY') || '-' || lpad(nextval('request_code_seq')::text, 3, '0')
WHERE request_code IS NULL;

UPDATE donation_requests SET requested_quantity = 1 WHERE requested_quantity IS NULL;

INSERT INTO request_status_history (request_id, status, notes)
SELECT id, status, 'Migrated from existing request'
FROM donation_requests
WHERE NOT EXISTS (
  SELECT 1 FROM request_status_history h WHERE h.request_id = donation_requests.id
);
