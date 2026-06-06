const { parseMedicineFromOcr } = require("../../src/utils/parseMedicine");

describe("parseMedicineFromOcr", () => {
  it("extracts medicine name, dosage, batch, and expiry", () => {
    const ocr = `
      PARACETAMOL 500mg
      Batch No: BT284719
      Exp: 12/31/2027
      10 Tablets
    `;
    const result = parseMedicineFromOcr(ocr);
    expect(result.medicine_name).toMatch(/PARACETAMOL/i);
    expect(result.dosage).toMatch(/500mg/i);
    expect(result.batch_number).toBeTruthy();
    expect(result.expiry_date).toBeTruthy();
    expect(result.quantity).toBeGreaterThan(0);
  });

  it("handles empty OCR gracefully", () => {
    const result = parseMedicineFromOcr("");
    expect(result.medicine_name).toBeNull();
    expect(result.quantity).toBe(1);
  });
});
