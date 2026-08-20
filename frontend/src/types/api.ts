export type UserRole = "donor" | "receiver" | "pharmacist" | "admin";

export interface ApiUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: { msg: string; path: string }[];
}

export interface MedicineImageRecord {
  id?: string;
  medicine_id?: string;
  image_url: string;
  label?: string | null;
  sort_order?: number;
}

export interface MedicineRecord {
  id: string;
  donor_id: string;
  medicine_name: string | null;
  dosage: string | null;
  batch_number: string | null;
  expiry_date: string | null;
  manufacturing_date?: string | null;
  quantity: number;
  image_url: string;
  images?: MedicineImageRecord[];
  available_quantity?: number;
  ocr_text?: string | null;
  ocr_confidence?: number | null;
  safety_score?: number | null;
  status: string;
  created_at: string;
  donor_name?: string;
  donor_email?: string;
}

export interface InventoryMatch {
  medicine_id: string;
  medicine_name: string | null;
  dosage?: string | null;
  batch_number?: string | null;
  expiry_date?: string | null;
  available_quantity: number;
  verification_status: string;
  match_score: number;
  image_url?: string;
  donor_name?: string;
}

export interface OcrSuggestResponse {
  suggestions: {
    medicine_name: string | null;
    expiry_date: string | null;
    manufacturing_date: string | null;
    batch_number: string | null;
    quantity: number | null;
  } | null;
  disclaimer?: string;
  error?: string;
  source?: string;
  images_processed?: number;
}

export interface DashboardAnalytics {
  total_medicines_donated: number;
  total_approved: number;
  total_rejected: number;
  total_distributed: number;
  total_pending_verification: number;
  total_beneficiaries: number;
  estimated_waste_prevented_kg: number;
  strips_saved: number;
  by_status: Record<string, number>;
  medicines_rescued?: number;
  patients_helped?: number;
  cost_saved_inr?: number;
  active_requests?: number;
  verification_success_rate?: number;
  monthly_donation_growth?: { month: string; count: number }[];
  most_donated?: { name: string; donations: number; units?: number }[];
  most_requested?: { name: string; requests: number }[];
}

export interface AdminOverview {
  total_medicines_collected: number;
  total_verified: number;
  total_pending: number;
  total_rejected: number;
  patients_helped: number;
  active_requests: number;
  waste_prevented_kg: number;
  cost_saved_inr: number;
  cost_saved_display?: string;
  medicines_rescued: number;
  verification_success_rate: number;
  by_status: Record<string, number>;
}

export interface RequestAnalytics {
  total_requests: number;
  pending_requests: number;
  assigned_requests: number;
  completed_requests: number;
  rejected_requests?: number;
  by_status: Record<string, number>;
  monthly_volume: { month: string; count: number }[];
  completion_rate: number;
  distribution_trend: { month: string; count: number }[];
}

export interface AdminAnalytics extends AdminOverview {
  monthly_donation_growth: { month: string; count: number }[];
  most_donated: { name: string; donations: number; units?: number }[];
  most_requested: { name: string; requests: number }[];
  expiry_trend: { month: string; count: number }[];
  request_analytics?: RequestAnalytics;
}

export interface ReceiverRequestStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  completed_requests: number;
}

export interface PharmacistStats {
  pending_verifications: number;
  approved_medicines: number;
  rejected_medicines: number;
  todays_reviews: number;
}

export interface SmartMatch {
  medicine_id: string;
  medicine_name: string;
  available_quantity: number;
  distance_km: number;
  match_score: number;
}

export interface RequestStatusHistoryEntry {
  id: string;
  status: string;
  notes?: string | null;
  created_at: string;
  changed_by_name?: string;
}

export interface DonationRequestRecord {
  id: string;
  request_code?: string;
  medicine_id: string;
  receiver_id: string;
  status: string;
  requested_quantity?: number;
  assigned_medicine_id?: string | null;
  assigned_quantity?: number | null;
  assigned_at?: string | null;
  assigned_medicine_name?: string | null;
  assigned_medicine_status?: string | null;
  created_at: string;
  updated_at?: string;
  medicine_name?: string;
  receiver_name?: string;
  receiver_email?: string;
  status_history?: RequestStatusHistoryEntry[];
}

export interface DonationRequestWithMatch extends DonationRequestRecord {
  smart_match?: SmartMatch | null;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  description: string | null;
  created_at: string;
  user_name?: string;
}

export interface UploadMedicineResult {
  medicine: MedicineRecord;
  validation?: { issues: string[]; requiresManualReview?: boolean };
  ocrError?: string;
}
