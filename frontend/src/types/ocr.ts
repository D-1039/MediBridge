export interface MedicineFormValues {
  name: string;
  quantity: string;
  manufacturingDate: string;
  expiryDate: string;
  category: string;
  description: string;
  batchNumber: string;
}

export const emptyMedicineForm: MedicineFormValues = {
  name: "",
  quantity: "",
  manufacturingDate: "",
  expiryDate: "",
  category: "",
  description: "",
  batchNumber: "",
};

export interface OcrSuggestions {
  medicine_name: string | null;
  expiry_date: string | null;
  manufacturing_date: string | null;
  batch_number: string | null;
  quantity: number | null;
}
