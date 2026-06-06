const {
  computeSafetyScore,
  runSafetyValidation,
} = require("../../src/utils/safetyScore");

describe("safetyScore", () => {
  it("flags expired medicines for manual review", () => {
    const result = runSafetyValidation({
      expiryDate: "2020-01-01",
      batchNumber: "BT123",
      medicineName: "Aspirin",
    });
    expect(result.requiresManualReview).toBe(true);
    expect(result.issues).toContain("expired");
  });

  it("scores higher when pharmacist verified", () => {
    const base = computeSafetyScore({
      expiryDate: "2028-06-01",
      batchNumber: "BT1",
      medicineName: "Metformin",
      manufacturingDate: "2025-01-01",
      pharmacistVerified: false,
    });
    const verified = computeSafetyScore({
      expiryDate: "2028-06-01",
      batchNumber: "BT1",
      medicineName: "Metformin",
      manufacturingDate: "2025-01-01",
      pharmacistVerified: true,
    });
    expect(verified).toBeGreaterThan(base);
    expect(verified).toBeLessThanOrEqual(100);
  });
});
