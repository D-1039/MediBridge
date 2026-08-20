import type { OcrSuggestResponse } from "@/types/api";
import type { MedicineFormValues, OcrSuggestions } from "@/types/ocr";

export function mapSuggestionsToForm(
  suggestions: OcrSuggestions
): Partial<MedicineFormValues> {
  const mapped: Partial<MedicineFormValues> = {};
  if (suggestions.medicine_name) mapped.name = suggestions.medicine_name;
  if (suggestions.expiry_date) mapped.expiryDate = suggestions.expiry_date.slice(0, 10);
  if (suggestions.manufacturing_date) {
    mapped.manufacturingDate = suggestions.manufacturing_date.slice(0, 10);
  }
  if (suggestions.batch_number) mapped.batchNumber = suggestions.batch_number;
  if (suggestions.quantity) mapped.quantity = String(suggestions.quantity);
  return mapped;
}

export function formatDisplayDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
    day: "numeric",
  });
}

export function hasAnySuggestion(
  data: OcrSuggestResponse | { suggestions: OcrSuggestResponse["suggestions"] }
): boolean {
  const s = data.suggestions;
  if (!s) return false;
  return Boolean(
    s.medicine_name ||
      s.expiry_date ||
      s.manufacturing_date ||
      s.batch_number ||
      s.quantity
  );
}
