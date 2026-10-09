export type Language = 
  | 'en' 
  | 'hi' 
  | 'bn' 
  | 'mr' 
  | 'te' 
  | 'ta' 
  | 'gu' 
  | 'kn' 
  | 'ml' 
  | 'pa' 
  | 'bho' 
  | 'ur';


export type AppMode = 'patient' | 'reception' | 'admin' | 'doctor' | 'login';

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  provider: 'google' | 'apple' | 'phone' | 'email' | 'guest';
  role: 'patient' | 'reception' | 'admin' | 'doctor';
  isGuest?: boolean;
  clinicId?: string;
  clinicName?: string;
  doctorId?: string;
  doctorName?: string;
  token?: string;
  tokenExpiresAt?: number;
}

export type DoctorScreen = 
  | 'cabin' 
  | 'queue' 
  | 'schedule' 
  | 'profile' 
  | 'analytics';

export type PatientScreen = 
  | 'home' 
  | 'doctors' 
  | 'doctor_profile' 
  | 'clinic_profile' 
  | 'booking_step1' 
  | 'booking_step2' 
  | 'book_step1' 
  | 'book_step2' 
  | 'confirmation'
  | 'my_appointments';

export type ReceptionScreen = 
  | 'appointments' 
  | 'qr_scanner' 
  | 'availability';

export type AdminScreen = 
  | 'overview' 
  | 'clinics' 
  | 'doctors' 
  | 'visibility' 
  | 'billing' 
  | 'support';

export interface Clinic {
  id: string;
  name: string;
  nameHindi: string;
  type: 'clinic' | 'hospital';
  category: string;
  categoryHindi: string;
  address: string;
  addressHindi: string;
  landmark: string;
  phone: string;
  whatsappNumber: string;
  consultationFee?: number;
  followUpFee?: number;
  facilities?: string[];
  logoUrl?: string;
  bannerUrl?: string;
  doctorsCount: number;
  bookingsThisMonth: number;
  status: 'active' | 'pending' | 'suspended';
  subscriptionPlan: 'Free Pilot (फ्री पायलट)' | 'Monthly Rent (मासिक किराया)' | 'Quarterly Suvidha' | 'Annual Pro' | 'Enterprise Pan-India';
  amountDue: number;
  dueDate: string;
  paymentStatus: 'paid' | 'overdue' | 'pending';
  isFeatured: boolean;
  priorityNumber: number;
  rating: number;
  reviewsCount: number;
  timings: string;
  timingsHindi: string;
  emergencyAvailable: boolean;
  pincode?: string;
  city?: string;
  state?: string;
  planTier?: string;
  monthlyFee?: number;
  subscriptionStatus?: 'active' | 'pending' | 'suspended';
  email?: string;
  authorizedGmails?: string[];
  doctorPassword?: string;
  lat?: number;
  lng?: number;
  isAppointmentBookingActive?: boolean; // When true/undefined, appointment booking is enabled; when false, only Contact Now is available
}

export interface Doctor {
  id: string;
  name: string;
  nameHindi: string;
  email?: string;
  clinicId: string;
  clinicName: string;
  specialty: string;
  specialtyHindi: string;
  qualification: string;
  experienceYears: number;
  fee: number;
  status: 'active' | 'on_leave' | 'inactive';
  isVipBoosted: boolean;
  priorityNumber: number;
  photoUrl: string;
  about: string;
  aboutHindi: string;
  nextSlot: string;
  availableToday: boolean;
  isAppointmentBookingActive?: boolean; // When true/undefined, appointment booking is enabled; when false, only Contact Now is available
  daysAvailable: string[];
  timeSlots: string[];
  rating: number;
  patientsServed: number;
  address?: string;
  landmark?: string;
  pincode?: string;
  city?: string;
  state?: string;
  contactPhone?: string;
  opdNotice?: string;
  lat?: number;
  lng?: number;
  // Razorpay Route (Multi-Doctor Settlement) Fields
  razorpayAccountId?: string; // Linked account ID on Razorpay Route (e.g. "acc_doc_sharma_route01")
  accountHolderName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
  panNumber?: string;
  upiId?: string;
  payoutSettlementType?: 'razorpay_route' | 'direct_upi' | 'cash_counter';
  platformCommissionPercent?: number; // e.g., 0% for 100% payout to doctor, or custom %
  paymentOnboardingStatus?: 'active' | 'pending_verification' | 'not_configured';
}

export interface Appointment {
  id: string;
  appointmentNumber: string; // Sequential Token, e.g., '1', '2', '3'
  clinicId: string;
  clinicName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorQualification?: string;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  patientPhone: string;
  patientUserId?: string;
  patientEmail?: string;
  date: string;
  timeSlot: string;
  fee: number;
  paymentType: 'clinic_cash_upi' | 'online_prepaid';
  paymentStatus: 'paid' | 'unpaid';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  transferredToAccountId?: string;
  doctorPayoutAmount?: number;
  platformFeeAmount?: number;
  arrivalStatus: 'not_arrived' | 'arrived' | 'scanned';
  scannedAt: string | null;
  bookingSource: 'patient_online' | 'reception_walk_in';
  status: 'confirmed' | 'cancelled' | 'completed';
  consultationStatus?: 'waiting' | 'in_cabin' | 'completed' | 'cancelled';
  clinicalNotes?: string;
  prescriptionRx?: string;
  followUpDate?: string;
  qrCodeData: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  clinicOrPatientName: string;
  phone: string;
  issueSummary: string;
  status: 'open' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  notes?: string;
}
