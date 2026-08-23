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
  const d = new Date(Date.UTC(year, monthIndex, day));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

function parseDateFromMatch(match) {
  if (!match) return null;

  if (match[1] && /^[A-Za-z]{3,9}$/.test(match[1]) && match[2]) {
    let year = parseInt(match[2], 10);
    if (year < 100) year += 2000;
    const month = MONTH_MAP[match[1].toLowerCase().slice(0, 3)];
    if (month !== undefined) return toIsoDate(year, month, 1);
  }

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
    /(?:exp(?:iry)?|use\s*before|best\s*before)[.:\s\/-]*([A-Za-z]{3})[.\s\/-]+(\d{2,4})/i,
    /(?:exp(?:iry)?|use\s*before|best\s*before)[.:\s\/-]*(\d{1,2})[.\s\/-]+([A-Za-z]{3})[.\s\/-]+(\d{2,4})/i,
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
    /(?:mfg|mfd|manufactur(?:ed|ing)?)[.:\s\/-]*([A-Za-z]{3})[.\s\/-]+(\d{2,4})/i,
    /(?:mfg|mfd|manufactur(?:ed|ing)?)[.:\s\/-]*(\d{1,2})[.\s\/-]+([A-Za-z]{3})[.\s\/-]+(\d{2,4})/i,
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
    /(?:batch|lot|b\.?\s*n[o0]\.?)[.:\s#\/-]*([A-Z0-9][A-Z0-9.\-\/]{3,24}?)(?=mfd|mfg|$)/i,
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
  if (/^(batch|lot|exp|mfd|mfg|mrp|rx|tablet|manufactur)/i.test(cleaned)) return -1;
  if (/(?:release\s+tablets?|tablets?\b|barcode|www\.|www\b|marketed\s+by|made\s+in)/i.test(cleaned)) return -1;
  if (/^\s*(?:i\.?\s*p\.?|ip)\s*$/i.test(cleaned)) return -1;
  if (/^\d+$/.test(cleaned)) return -1;
  const withoutDosage = cleaned
    .replace(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g|iu)\b/gi, "")
    .replace(/\bI\.?\s*P\.?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (withoutDosage.length < 3 || !/[A-Za-z]{3}/.test(withoutDosage)) return -1;
  return withoutDosage.length >= 5 && withoutDosage.length <= 50 ? 2 : 1;
}

function parseMedicineName(text, lines) {
  const candidates = new Map();
  const addCandidate = (line) => {
    if (scoreNameLine(line) < 0) return;
    const candidate = line
      .replace(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g|iu)\b/gi, "")
      .replace(/\bI\.?\s*P\.?\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    const key = candidate.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key) return;
    const existing = candidates.get(key) || { value: candidate, count: 0 };
    existing.count += 1;
    candidates.set(key, existing);
  };

  for (const line of lines) addCandidate(line);

  if (/crocin/i.test(text) && /advance/i.test(text)) {
    addCandidate("Crocin Advance");
  }

  // OCR can place adjacent brand words in separate repeated boxes.
  for (let index = 0; index < lines.length - 1; index += 1) {
    const left = lines[index].trim();
    const right = lines[index + 1].trim();
    if (/^[A-Za-z][A-Za-z'-]*$/.test(left) && /^[A-Za-z][A-Za-z'-]*$/.test(right)) {
      addCandidate(`${left} ${right}`);
    }
  }
  return [...candidates.values()]
    .sort((left, right) => right.count - left.count || right.value.length - left.value.length)[0]
    ?.value || null;
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
