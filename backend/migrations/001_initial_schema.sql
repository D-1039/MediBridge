-- MediBridge initial schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('donor', 'receiver', 'pharmacist', 'admin');
CREATE TYPE medicine_status AS ENUM (
  'pending_ocr',
  'manual_review',
  'pending_pharmacist',
  'approved',
  'rejected',
  'distributed'
);
CREATE TYPE donation_request_status AS ENUM (
  'pending',
  'approved',
  'completed',
  'rejected'
);
CREATE TYPE audit_action AS ENUM (
  'upload',
  'ocr_processed',
  'manual_review',
  'pharmacist_approved',
  'pharmacist_rejected',
  'request_created',
  'distributed'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'donor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medicine_name VARCHAR(255),
  dosage VARCHAR(100),
  batch_number VARCHAR(100),
  batch_number_verified BOOLEAN NOT NULL DEFAULT TRUE,
  expiry_date DATE,
  quantity INTEGER NOT NULL DEFAULT 1,
  image_url TEXT NOT NULL,
  ocr_text TEXT,
  ocr_confidence DECIMAL(5,4),
  safety_score INTEGER CHECK (safety_score >= 0 AND safety_score <= 100),
  pharmacist_notes TEXT,
  status medicine_status NOT NULL DEFAULT 'pending_ocr',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medicines_donor ON medicines(donor_id);
CREATE INDEX idx_medicines_status ON medicines(status);
CREATE INDEX idx_medicines_expiry ON medicines(expiry_date);

CREATE TABLE donation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status donation_request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (medicine_id, receiver_id)
);

CREATE INDEX idx_donation_requests_receiver ON donation_requests(receiver_id);
CREATE INDEX idx_donation_requests_medicine ON donation_requests(medicine_id);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  medicine_id UUID REFERENCES medicines(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_medicine ON audit_logs(medicine_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER medicines_updated_at
  BEFORE UPDATE ON medicines
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER donation_requests_updated_at
  BEFORE UPDATE ON donation_requests
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
