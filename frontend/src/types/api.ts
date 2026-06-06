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
  ocr_text?: string | null;
  ocr_confidence?: number | null;
  safety_score?: number | null;
  status: string;
  created_at: string;
  donor_name?: string;
  donor_email?: string;
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

export interface AdminAnalytics extends AdminOverview {
  monthly_donation_growth: { month: string; count: number }[];
  most_donated: { name: string; donations: number; units?: number }[];
  most_requested: { name: string; requests: number }[];
  expiry_trend: { month: string; count: number }[];
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

export interface DonationRequestRecord {
  id: string;
  medicine_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  medicine_name?: string;
  receiver_name?: string;
  receiver_email?: string;
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
