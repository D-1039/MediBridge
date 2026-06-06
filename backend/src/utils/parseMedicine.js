/**
 * Basic field extraction from OCR text (suggestions only).
 */

const MONTH_MAP = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function normalizeText(text) {
  return (text || "").replace(/\r/g, "\n").trim();
}

function toIsoDate(year, monthIndex, day) {
  const d = new Date(year, monthIndex, day);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

function parseDateFromMatch(match) {
  if (!match) return null;

  const monthName = match[2] && /[A-Za-z]{3}/.test(match[2]) ? match[2] : null;
  if (monthName) {
    const day = parseInt(match[1], 10) || 1;
    let year = parseInt(match[3], 10);
    if (year < 100) year += 2000;
    const month = MONTH_MAP[monthName.toLowerCase().slice(0, 3)];
    if (month !== undefined) return toIsoDate(year, month, day);
  }

  if (match[1] && match[2] && match[3] && /\d/.test(match[1])) {
    let d = parseInt(match[1], 10);
    let m = parseInt(match[2], 10);
    let y = parseInt(match[3], 10);
    if (y < 100) y += 2000;
    if (m > 12 && d <= 12) {
      const tmp = d;
      d = m;
      m = tmp;
    }
    if (m >= 1 && m <= 12) return toIsoDate(y, m - 1, d);
  }

  if (match[1] && match[2] && !match[3]) {
    const m = parseInt(match[1], 10);
    let y = parseInt(match[2], 10);
    if (y < 100) y += 2000;
    if (m >= 1 && m <= 12) return toIsoDate(y, m - 1, 1);
  }

  const parsed = new Date(match[1] || match[0]);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  return null;
}

function parseExpiryDate(text) {
  const patterns = [
    /(?:exp(?:iry)?|use\s*before|best\s*before)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /(?:exp(?:iry)?|use\s*before)[:\s]*(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})/i,
    /(?:exp(?:iry)?|use\s*before)[:\s]*([A-Za-z]{3,9})\s+(\d{2,4})/i,
    /(?:exp(?:iry)?)[:\s]*(\d{1,2})[\/\-\.](\d{2,4})\b/i,
    /\bEXP[:\s]*(\d{2}[\/\-\.]\d{2,4})\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const iso = parseDateFromMatch(match);
      if (iso) return iso;
    }
  }
  return null;
}

function parseManufacturingDate(text) {
  const patterns = [
    /(?:mfg|mfd|manufactur(?:ed|ing)?)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /(?:mfg|mfd)[:\s]*(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})/i,
    /(?:mfg|mfd)[:\s]*([A-Za-z]{3,9})\s+(\d{2,4})/i,
    /\bMFG[:\s]*(\d{2}[\/\-\.]\d{2})\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const iso = parseDateFromMatch(match);
      if (iso) return iso;
    }
  }
  return null;
}

function parseBatchNumber(text) {
  const patterns = [
    /(?:batch|lot|b\.?\s*no\.?)[:\s#]*([A-Z0-9][A-Z0-9\-\/]{3,24})/i,
    /\b(EA\d{4,12})\b/i,
    /\b([A-Z]{2,5}\d{4,14})\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim().toUpperCase();
  }
  return null;
}

function parseDosage(text) {
  const match = text.match(/\b(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|%))\b/i);
  return match ? match[1].trim() : null;
}

function scoreNameLine(line) {
  const cleaned = line.replace(/\s+/g, " ").trim();
  if (cleaned.length < 3 || cleaned.length > 90) return -1;
  if (/^(batch|lot|exp|mfg|mrp|rx|tablet)/i.test(cleaned)) return -1;
  if (/^\d+$/.test(cleaned)) return -1;
  let score = 0;
  if (/\d+\s*mg|mcg|ml/i.test(cleaned)) score += 4;
  if (cleaned.length >= 5 && cleaned.length <= 50) score += 2;
  return score;
}

function parseMedicineName(text, lines) {
  let best = null;
  let bestScore = 0;
  for (const line of lines) {
    const score = scoreNameLine(line);
    if (score > bestScore) {
      bestScore = score;
      best = line.replace(/\s+/g, " ").trim();
    }
  }
  return best;
}

function parseQuantity(text) {
  const match = text.match(/(?:qty|tablets?)[:\s]*(\d{1,4})/i);
  if (match) return parseInt(match[1], 10);
  return 1;
}

function parseMedicineFromOcr(rawText) {
  const normalized = normalizeText(rawText);
  const lines = normalized
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 1);
  const flatText = lines.join(" ");

  return {
    medicine_name: parseMedicineName(flatText, lines),
    dosage: parseDosage(flatText),
    batch_number: parseBatchNumber(flatText),
    expiry_date: parseExpiryDate(flatText),
    manufacturing_date: parseManufacturingDate(flatText),
    quantity: parseQuantity(flatText),
    raw_lines: lines,
  };
}

module.exports = {
  parseMedicineFromOcr,
  parseExpiryDate,
  parseManufacturingDate,
  parseBatchNumber,
};
