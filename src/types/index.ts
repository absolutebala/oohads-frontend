export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'advertiser' | 'owner' | 'admin';
}

export interface LoginFormData {
  role: 'advertiser' | 'owner';
  authMethod: 'phone' | 'google';
  phone: string;
  otp: string;
  name: string;
  email: string;
}

export interface PersonalDetails {
  name: string;
  phone: string;
  email: string;
}

export interface VehicleDetails {
  type: 'auto' | 'taxi' | '';
  registrationNumber: string;
  operatingAreas: string[];
  photoFile: File | null;
}

export interface DocumentsAndPricing {
  rcFile: File | null;
  insuranceFile: File | null;
  monthlyRate: number;
  upiId: string;
}

export interface OwnerOnboardingData {
  personalDetails: PersonalDetails;
  vehicleDetails: VehicleDetails;
  documentsAndPricing: DocumentsAndPricing;
}

export interface AdminOwner {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'auto' | 'taxi';
  registrationNumber: string;
  area: string;
  monthlyRate: number;
  status: 'pending' | 'active' | 'inactive';
  addedAt: Date;
}

/** Assignment statuses that block a vehicle from being booked by other advertisers */
export type VehicleAssignmentStatus =
  | 'reserved'
  | 'active'
  | 'grace'
  | 'expired_unpaid'
  | 'completed'
  | 'none';

/** Vehicles with assignmentStatus in this set are unavailable for new bookings */
export const UNAVAILABLE_ASSIGNMENT_STATUSES: VehicleAssignmentStatus[] = [
  'reserved',
  'active',
  'grace',
];

export interface Vehicle {
  id: string;
  registrationNumber: string;
  type: 'auto' | 'taxi';
  city: string;
  area: string;
  ownerName: string;
  ownerUpiId?: string;
  monthlyRate: number;
  kmPerDay: number;
  /** Expected km per month as declared by owner during onboarding */
  expectedMonthlyKm?: number;
  status: 'available' | 'booked' | 'inactive';
  vehiclePhotoUrl?: string;
  /** Current campaign assignment status — drives availability filtering */
  assignmentStatus?: VehicleAssignmentStatus;
}

export interface LocationPreference {
  city: string;
  area: string;
  allowNearbyAreas: boolean;
}

export interface CampaignVehicleAssignment {
  id: string;
  campaignId: string;
  vehicleId: string;
  status: VehicleAssignmentStatus;
  startDate: string;
  endDate: string;
  renewalDueDate?: string;
  gracePeriodEndDate?: string;
}

export type PaymentPlan = 'month_on_month' | 'full_period';

export interface CampaignPayment {
  id: string;
  campaignId: string;
  /** owner_rental = payment to vehicle owner; platform_fee = payment to admin */
  type: 'owner_rental' | 'platform_fee';
  amount: number;
  recipientName: string;
  upiId: string;
  status: 'pending' | 'proof_submitted' | 'verified' | 'failed';
  proofUrl?: string;
  utrReference?: string;
  dueDate?: string;
  paidAt?: string;
}

export interface Campaign {
  id: string;
  name: string;
  vehicles: string[];
  status: 'draft' | 'submitted' | 'approved' | 'live' | 'completed';
  startDate: string;
  endDate: string;
  objective: string;
  totalBudget: number;
  estimatedKm: number;
  artworkUrl?: string;
  locationPreference?: LocationPreference;
  needsPrintingHelp?: boolean;
  paymentPlan?: PaymentPlan;
  createdAt: Date;
}

export interface CampaignBookingData {
  selectedVehicles: Vehicle[];
  campaignName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  objective: string;
  artworkFile: File | null;
  locationPreference: LocationPreference;
  needsPrintingHelp: boolean;
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  change?: number;
  unit?: string;
}
