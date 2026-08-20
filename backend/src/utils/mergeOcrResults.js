const { parseMedicineFromOcr } = require("./parseMedicine");

/**
 * Merge OCR text from multiple images — first non-null field wins.
 */
function mergeParsedMedicineFields(parsedList) {
  const merged = {
    medicine_name: null,
    expiry_date: null,
    manufacturing_date: null,
    batch_number: null,
    quantity: null,
  };

  for (const parsed of parsedList) {
    if (!parsed) continue;
    if (!merged.medicine_name && parsed.medicine_name) {
      merged.medicine_name = parsed.medicine_name;
    }
    if (!merged.expiry_date && parsed.expiry_date) {
      merged.expiry_date = parsed.expiry_date;
    }
    if (!merged.manufacturing_date && parsed.manufacturing_date) {
      merged.manufacturing_date = parsed.manufacturing_date;
    }
    if (!merged.batch_number && parsed.batch_number) {
      merged.batch_number = parsed.batch_number;
    }
    if (!merged.quantity && parsed.quantity > 0) {
      merged.quantity = parsed.quantity;
    }
  }

  return merged;
}

function mergeOcrTexts(texts) {
  const parsedList = texts
    .filter(Boolean)
    .map((text) => parseMedicineFromOcr(text));
  return mergeParsedMedicineFields(parsedList);
}

function mergeOcrSuggestions(suggestionList) {
  const parsedList = suggestionList
    .map((s) => s?.suggestions)
    .filter(Boolean)
    .map((s) => ({
      medicine_name: s.medicine_name,
      expiry_date: s.expiry_date,
      manufacturing_date: s.manufacturing_date,
      batch_number: s.batch_number,
      quantity: s.quantity,
    }));
  return mergeParsedMedicineFields(parsedList);
}

module.exports = {
  mergeOcrTexts,
  mergeOcrSuggestions,
  mergeParsedMedicineFields,
};
