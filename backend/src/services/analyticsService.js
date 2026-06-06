const medicineRepository = require("../repositories/medicineRepository");
const requestRepository = require("../repositories/requestRepository");
const { pool } = require("../config/database");

const analyticsService = {
  async getDashboardStats() {
    const statusCounts = await medicineRepository.countByStatus();
    const map = Object.fromEntries(statusCounts.map((r) => [r.status, r.count]));

    const totalDonated =
      (map.pending_ocr || 0) +
      (map.manual_review || 0) +
      (map.pending_pharmacist || 0) +
      (map.approved || 0) +
      (map.rejected || 0) +
      (map.distributed || 0);

    const beneficiaries = await requestRepository.countBeneficiaries();

    const { rows: wasteRows } = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0)::int AS strips_saved
       FROM medicines
       WHERE status IN ('approved', 'distributed')`
    );

    const stripsSaved = wasteRows[0]?.strips_saved || 0;
    const estimatedWastePreventedKg = Math.round(stripsSaved * 0.015 * 100) / 100;
    const medicinesRescued = (map.approved || 0) + (map.distributed || 0);
    const costSavedInr = stripsSaved * 25;

    const totalReviewed = (map.approved || 0) + (map.rejected || 0);
    const verificationSuccessRate =
      totalReviewed > 0
        ? Math.round(((map.approved || 0) / totalReviewed) * 100)
        : 0;

    const activeRequests = await requestRepository.countPending();

    return {
      total_medicines_donated: totalDonated,
      total_approved: map.approved || 0,
      total_rejected: map.rejected || 0,
      total_distributed: map.distributed || 0,
      total_pending_verification:
        (map.pending_pharmacist || 0) + (map.manual_review || 0) + (map.pending_ocr || 0),
      total_beneficiaries: beneficiaries,
      estimated_waste_prevented_kg: estimatedWastePreventedKg,
      strips_saved: stripsSaved,
      by_status: map,
      medicines_rescued: medicinesRescued,
      patients_helped: beneficiaries,
      cost_saved_inr: costSavedInr,
      active_requests: activeRequests,
      verification_success_rate: verificationSuccessRate,
      monthly_donation_growth: await medicineRepository.getMonthlyDonations(6),
      most_donated: await medicineRepository.getTopDonatedMedicines(5),
      most_requested: await requestRepository.getTopRequestedMedicines(5),
    };
  },
};

module.exports = analyticsService;
