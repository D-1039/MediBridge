export const dashboardStats = {
  medicinesSaved: 1247,
  pendingVerification: 23,
  activeNgos: 84,
  wasteReduction: 45,
};

export const chartData = [
  { month: "Jan", donations: 120, distributed: 95 },
  { month: "Feb", donations: 180, distributed: 140 },
  { month: "Mar", donations: 220, distributed: 190 },
  { month: "Apr", donations: 280, distributed: 240 },
  { month: "May", donations: 340, distributed: 310 },
  { month: "Jun", donations: 420, distributed: 380 },
];

export const wasteData = [
  { name: "Reduced", value: 45, fill: "#10b981" },
  { name: "Remaining", value: 55, fill: "#e2e8f0" },
];

export const recentDonations = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    donor: "John Smith",
    quantity: 50,
    status: "verified",
    date: "2026-05-28",
  },
  {
    id: "2",
    name: "Amoxicillin 250mg",
    donor: "City Pharmacy",
    quantity: 30,
    status: "pending",
    date: "2026-05-27",
  },
  {
    id: "3",
    name: "Metformin 850mg",
    donor: "Sarah Johnson",
    quantity: 100,
    status: "verified",
    date: "2026-05-26",
  },
  {
    id: "4",
    name: "Ibuprofen 400mg",
    donor: "Health Clinic",
    quantity: 75,
    status: "distributed",
    date: "2026-05-25",
  },
  {
    id: "5",
    name: "Vitamin D3",
    donor: "Wellness Center",
    quantity: 200,
    status: "pending",
    date: "2026-05-24",
  },
];

export const pendingRequests = [
  {
    id: "1",
    medicine: "Insulin Glargine",
    requester: "Hope NGO",
    urgency: "urgent",
    status: "pending",
    date: "2026-05-29",
  },
  {
    id: "2",
    medicine: "Aspirin 75mg",
    requester: "Rural Health Camp",
    urgency: "normal",
    status: "approved",
    date: "2026-05-28",
  },
  {
    id: "3",
    medicine: "Salbutamol Inhaler",
    requester: "Children's Foundation",
    urgency: "urgent",
    status: "pending",
    date: "2026-05-27",
  },
];

export const verificationMedicines = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    quantity: 50,
    expiryDate: "2027-03-15",
    category: "Pain Relief",
    donor: "John Smith",
    status: "pending",
    image: "/medicines/paracetamol.svg",
    ocrConfidence: 96,
  },
  {
    id: "2",
    name: "Amoxicillin 250mg",
    quantity: 30,
    expiryDate: "2026-11-20",
    category: "Antibiotics",
    donor: "City Pharmacy",
    status: "pending",
    image: "/medicines/amoxicillin.svg",
    ocrConfidence: 92,
  },
  {
    id: "3",
    name: "Metformin 850mg",
    quantity: 100,
    expiryDate: "2027-08-10",
    category: "Diabetes",
    donor: "Sarah Johnson",
    status: "approved",
    image: "/medicines/metformin.svg",
    ocrConfidence: 98,
  },
];

export const medicineRequests = [
  {
    id: "1",
    medicine: "Insulin Glargine",
    urgency: "urgent" as const,
    requester: "Hope NGO",
    patientInfo: "12 diabetic patients",
    status: "pending" as const,
    location: "Mumbai, India",
    date: "2026-05-29",
  },
  {
    id: "2",
    medicine: "Aspirin 75mg",
    urgency: "normal" as const,
    requester: "Rural Health Camp",
    patientInfo: "50 cardiac patients",
    status: "approved" as const,
    location: "Pune, India",
    date: "2026-05-28",
  },
  {
    id: "3",
    medicine: "Salbutamol Inhaler",
    urgency: "urgent" as const,
    requester: "Children's Foundation",
    patientInfo: "8 asthma patients",
    status: "pending" as const,
    location: "Delhi, India",
    date: "2026-05-27",
  },
  {
    id: "4",
    medicine: "Vitamin B12",
    urgency: "normal" as const,
    requester: "Senior Care NGO",
    patientInfo: "30 elderly patients",
    status: "approved" as const,
    location: "Bangalore, India",
    date: "2026-05-26",
  },
  {
    id: "5",
    medicine: "Antihistamine Syrup",
    urgency: "normal" as const,
    requester: "Community Clinic",
    patientInfo: "25 pediatric patients",
    status: "pending" as const,
    location: "Chennai, India",
    date: "2026-05-25",
  },
];

export const medicineCategories = [
  "Pain Relief",
  "Antibiotics",
  "Diabetes",
  "Cardiac",
  "Vitamins",
  "Respiratory",
  "Other",
];

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/login", label: "Login" },
];

export const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/upload", label: "Upload Medicine", icon: "Upload" },
  { href: "/dashboard/requests", label: "Requests", icon: "ClipboardList" },
  {
    href: "/dashboard/verification",
    label: "Verification",
    icon: "ShieldCheck",
  },
];
