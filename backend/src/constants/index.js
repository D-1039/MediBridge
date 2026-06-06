const USER_ROLES = Object.freeze({
  DONOR: "donor",
  RECEIVER: "receiver",
  PHARMACIST: "pharmacist",
  ADMIN: "admin",
});

const MEDICINE_STATUS = Object.freeze({
  PENDING_OCR: "pending_ocr",
  MANUAL_REVIEW: "manual_review",
  PENDING_PHARMACIST: "pending_pharmacist",
  APPROVED: "approved",
  REJECTED: "rejected",
  DISTRIBUTED: "distributed",
});

const REQUEST_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  COMPLETED: "completed",
  REJECTED: "rejected",
});

const AUDIT_ACTIONS = Object.freeze({
  UPLOAD: "upload",
  OCR_PROCESSED: "ocr_processed",
  USER_CONFIRMED: "user_confirmed",
  MANUAL_REVIEW: "manual_review",
  PHARMACIST_APPROVED: "pharmacist_approved",
  PHARMACIST_REJECTED: "pharmacist_rejected",
  REQUEST_CREATED: "request_created",
  DISTRIBUTED: "distributed",
});

module.exports = {
  USER_ROLES,
  MEDICINE_STATUS,
  REQUEST_STATUS,
  AUDIT_ACTIONS,
};
