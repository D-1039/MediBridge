DROP TRIGGER IF EXISTS donation_requests_updated_at ON donation_requests;
DROP TRIGGER IF EXISTS medicines_updated_at ON medicines;
DROP TRIGGER IF EXISTS users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS donation_requests;
DROP TABLE IF EXISTS medicines;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS audit_action;
DROP TYPE IF EXISTS donation_request_status;
DROP TYPE IF EXISTS medicine_status;
DROP TYPE IF EXISTS user_role;
