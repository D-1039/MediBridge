const medicineRepository = require("../repositories/medicineRepository");
const auditService = require("./auditService");
const auditRepository = require("../repositories/auditRepository");
const { pool } = require("../config/database");
const { computeSafetyScore } = require("../utils/safetyScore");
const { MEDICINE_STATUS, AUDIT_ACTIONS } = require("../constants");
const { NotFoundError } = require("../utils/errors");

const PENDING_STATUSES = [
  MEDICINE_STATUS.PENDING_PHARMACIST,
  MEDICINE_STATUS.MANUAL_REVIEW,
];

const pharmacistService = {
  async listPending() {
    const manual = await medicineRepository.findByStatus(MEDICINE_STATUS.MANUAL_REVIEW);
    const pending = await medicineRepository.findByStatus(MEDICINE_STATUS.PENDING_PHARMACIST);
    return [...manual, ...pending];
  },

  async getVerificationStats() {
    const statusCounts = await medicineRepository.countByStatus();
    const map = Object.fromEntries(statusCounts.map((r) => [r.status, r.count]));

    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM audit_logs
       WHERE action IN ('pharmacist_approved', 'pharmacist_rejected')
         AND created_at::date = CURRENT_DATE`
    );

    return {
      pending_verifications:
        (map.pending_pharmacist || 0) + (map.manual_review || 0),
      approved_medicines: (map.approved || 0) + (map.distributed || 0),
      rejected_medicines: map.rejected || 0,
      todays_reviews: rows[0]?.count || 0,
    };
  },

  async getMedicineWithAudit(id) {
    const medicine = await this.getMedicine(id);
    const auditTrail = await auditRepository.findByMedicine(id);
    const donor = await pool.query(
      `SELECT full_name, email FROM users WHERE id = $1`,
      [medicine.donor_id]
    );
    return {
      medicine: {
        ...medicine,
        donor_name: donor.rows[0]?.full_name,
        donor_email: donor.rows[0]?.email,
      },
      auditTrail,
    };
  },

  async getMedicine(id) {
    const medicine = await medicineRepository.findById(id);
    if (!medicine) throw new NotFoundError("Medicine not found");
    return medicine;
  },

  async approve(id, pharmacistId, notes, overrides = {}) {
    const medicine = await this.getMedicine(id);

    const safetyScore = computeSafetyScore({
      expiryDate: overrides.expiry_date || medicine.expiry_date,
      batchNumber: overrides.batch_number || medicine.batch_number,
      medicineName: overrides.medicine_name || medicine.medicine_name,
      manufacturingDate:
        overrides.manufacturing_date || medicine.manufacturing_date,
      pharmacistVerified: true,
    });

    const updated = await medicineRepository.update(id, {
      status: MEDICINE_STATUS.APPROVED,
      pharmacist_notes: notes || null,
      medicine_name: overrides.medicine_name ?? medicine.medicine_name,
      dosage: overrides.dosage ?? medicine.dosage,
      batch_number: overrides.batch_number ?? medicine.batch_number,
      expiry_date: overrides.expiry_date ?? medicine.expiry_date,
      quantity: overrides.quantity ?? medicine.quantity,
      safety_score: safetyScore,
    });

    await auditService.log({
      userId: pharmacistId,
      medicineId: id,
      action: AUDIT_ACTIONS.PHARMACIST_APPROVED,
      description: notes || "Pharmacist approved medicine for distribution",
    });

    return updated;
  },

  async reject(id, pharmacistId, notes) {
    await this.getMedicine(id);
    const updated = await medicineRepository.update(id, {
      status: MEDICINE_STATUS.REJECTED,
      pharmacist_notes: notes || null,
    });

    await auditService.log({
      userId: pharmacistId,
      medicineId: id,
      action: AUDIT_ACTIONS.PHARMACIST_REJECTED,
      description: notes || "Pharmacist rejected medicine",
    });

    return updated;
  },

  async sendToManualReview(id, pharmacistId, notes) {
    await this.getMedicine(id);
    const updated = await medicineRepository.update(id, {
      status: MEDICINE_STATUS.MANUAL_REVIEW,
      pharmacist_notes: notes || null,
    });

    await auditService.log({
      userId: pharmacistId,
      medicineId: id,
      action: AUDIT_ACTIONS.MANUAL_REVIEW,
      description: notes || "Sent to manual review by pharmacist",
    });

    return updated;
  },
};

module.exports = pharmacistService;
