/**
 * Domain model mappers – transform DB rows for API responses.
 */

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapMedicine(row) {
  if (!row) return null;
  return {
    id: row.id,
    donor_id: row.donor_id,
    donor_name: row.donor_name,
    medicine_name: row.medicine_name,
    dosage: row.dosage,
    batch_number: row.batch_number,
    expiry_date: row.expiry_date,
    quantity: row.quantity,
    image_url: row.image_url,
    ocr_text: row.ocr_text,
    ocr_confidence: row.ocr_confidence != null ? parseFloat(row.ocr_confidence) : null,
    safety_score: row.safety_score,
    pharmacist_notes: row.pharmacist_notes,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapRequest(row) {
  if (!row) return null;
  return {
    id: row.id,
    medicine_id: row.medicine_id,
    receiver_id: row.receiver_id,
    status: row.status,
    medicine_name: row.medicine_name,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

module.exports = { mapUser, mapMedicine, mapRequest };
