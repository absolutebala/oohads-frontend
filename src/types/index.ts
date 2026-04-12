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

export interface Vehicle {
  id: string;
  registrationNumber: string;
  type: 'auto' | 'taxi';
  area: string;
  ownerName: string;
  monthlyRate: number;
  kmPerDay: number;
  status: 'available' | 'booked' | 'inactive';
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
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  change?: number;
  unit?: string;
}
