-- Add new donation request status values (must be committed before use)

ALTER TYPE donation_request_status ADD VALUE IF NOT EXISTS 'submitted';
ALTER TYPE donation_request_status ADD VALUE IF NOT EXISTS 'under_review';
ALTER TYPE donation_request_status ADD VALUE IF NOT EXISTS 'assigned';
ALTER TYPE donation_request_status ADD VALUE IF NOT EXISTS 'ready_for_collection';
