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

  it("extracts Indian pharma MFD, EXP, B.No., and repeated brand names", () => {
    const ocr = `
      Crocin Advance
      Paracetamol I.P. 500 mg
      B.No.EA255107
      MFD.OCT.2025
      EXP.SEP.2027
      Crocin Advance
      RELEASE TABLETS
      Crocin Advance
    `;
    const result = parseMedicineFromOcr(ocr);

    expect(result.medicine_name).toBe("Crocin Advance");
    expect(result.dosage).toMatch(/500 mg/i);
    expect(result.batch_number).toBe("EA255107");
    expect(result.manufacturing_date).toBe("2025-10-01");
    expect(result.expiry_date).toBe("2027-09-01");
  });

  it("merges adjacent repeated brand fragments from separate OCR boxes", () => {
    const result = parseMedicineFromOcr(`
      Crocin
      Advance
      MFD.OCT.2025
      EXP.SEP.2027
      B.No
      EA255107
      Crocin
      Advance
      Crocin
      Advance
    `);

    expect(result.medicine_name).toBe("Crocin Advance");
    expect(result.manufacturing_date).toBe("2025-10-01");
    expect(result.expiry_date).toBe("2027-09-01");
    expect(result.batch_number).toBe("EA255107");
  });
});
