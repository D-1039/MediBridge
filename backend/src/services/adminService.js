const medicineRepository = require("../repositories/medicineRepository");
const requestRepository = require("../repositories/requestRepository");
const auditRepository = require("../repositories/auditRepository");
const { pool } = require("../config/database");
const AVG_STRIP_COST_INR = 25;

const adminService = {
  async getOverview() {
    const statusCounts = await medicineRepository.countByStatus();
    const map = Object.fromEntries(statusCounts.map((r) => [r.status, r.count]));
    const requestStatus = await requestRepository.countByStatus();
    const reqMap = Object.fromEntries(requestStatus.map((r) => [r.status, r.count]));

    const totalCollected =
      (map.pending_ocr || 0) +
      (map.manual_review || 0) +
      (map.pending_pharmacist || 0) +
      (map.approved || 0) +
      (map.rejected || 0) +
      (map.distributed || 0);

    const verified = (map.approved || 0) + (map.distributed || 0);
    const beneficiaries = await requestRepository.countBeneficiaries();
    const activeRequests = reqMap.pending || 0;

    const { rows: wasteRows } = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0)::int AS strips
       FROM medicines WHERE status IN ('approved', 'distributed')`
    );
    const strips = wasteRows[0]?.strips || 0;
    const wasteKg = Math.round(strips * 0.015 * 100) / 100;
    const costSavedInr = Math.round(strips * AVG_STRIP_COST_INR);

    const totalReviewed = (map.approved || 0) + (map.rejected || 0);
    const verificationSuccessRate =
      totalReviewed > 0
        ? Math.round(((map.approved || 0) / totalReviewed) * 100)
        : 0;

    return {
      total_medicines_collected: totalCollected,
      total_verified: verified,
      total_pending: (map.pending_pharmacist || 0) + (map.manual_review || 0) + (map.pending_ocr || 0),
      total_rejected: map.rejected || 0,
      patients_helped: beneficiaries,
      active_requests: activeRequests,
      waste_prevented_kg: wasteKg,
      cost_saved_inr: costSavedInr,
      cost_saved_display: formatInrLakhs(costSavedInr),
      medicines_rescued: verified,
      by_status: map,
      verification_success_rate: verificationSuccessRate,
    };
  },

  async getAnalytics() {
    const overview = await this.getOverview();
    const requestAnalytics = await requestRepository.getRequestAnalytics();
    return {
      ...overview,
      monthly_donation_growth: await medicineRepository.getMonthlyDonations(6),
      most_donated: await medicineRepository.getTopDonatedMedicines(6),
      most_requested: await requestRepository.getTopRequestedMedicines(6),
      expiry_trend: await medicineRepository.getExpiryTrend(6),
      request_analytics: requestAnalytics,
    };
  },

  async listMedicines(filters) {
    return medicineRepository.findAllAdmin(filters);
  },

  async getRecentDonations(limit = 8) {
    return medicineRepository.findAllAdmin({ limit, offset: 0 });
  },

  async getRecentRequests(limit = 8) {
    return requestRepository.findAll({ limit, offset: 0 });
  },

  async getMedicineDetail(id) {
    const medicine = await medicineRepository.findById(id);
    if (!medicine) return null;
    const donor = await pool.query(
      `SELECT full_name, email FROM users WHERE id = $1`,
      [medicine.donor_id]
    );
    const auditTrail = await auditRepository.findByMedicine(id);
    return {
      medicine: {
        ...medicine,
        donor_name: donor.rows[0]?.full_name,
        donor_email: donor.rows[0]?.email,
      },
      auditTrail,
    };
  },
};

function formatInrLakhs(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

module.exports = adminService;
