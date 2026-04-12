import { apiClient } from '../config';
import { OWNER_ENDPOINTS } from '../endpoints';
import { parseApiError } from '../errors';

export interface OwnerRegistrationData {
  userId: string;
  name: string;
  phone: string;
  vehicleType: 'auto' | 'taxi';
  registrationNumber: string;
  operatingAreas: string[];
  vehiclePhotoUrl: string;
  rcDocumentUrl: string;
  insuranceDocumentUrl: string;
  monthlyRate: number;
  upiId: string;
}

export interface OwnerProfile extends OwnerRegistrationData {
  id: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface OwnerEarnings {
  ownerId: string;
  totalEarnings: number;
  pendingPayout: number;
  lastPayoutDate: string;
  monthlySummary: Array<{ month: string; earnings: number; campaigns: number }>;
}

export interface OwnerListParams {
  area?: string;
  status?: 'pending' | 'verified' | 'rejected';
  page?: number;
  limit?: number;
}

export const ownerService = {
  /**
   * Register a new vehicle owner.
   */
  async registerOwner(ownerData: OwnerRegistrationData): Promise<OwnerProfile> {
    try {
      const { data } = await apiClient.post<OwnerProfile>(OWNER_ENDPOINTS.REGISTER, ownerData);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Get owner profile by ID.
   */
  async getOwnerProfile(ownerId: string): Promise<OwnerProfile> {
    try {
      const { data } = await apiClient.get<OwnerProfile>(OWNER_ENDPOINTS.GET(ownerId));
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Update owner details.
   */
  async updateOwnerDetails(
    ownerId: string,
    updates: Partial<OwnerRegistrationData>
  ): Promise<OwnerProfile> {
    try {
      const { data } = await apiClient.put<OwnerProfile>(OWNER_ENDPOINTS.UPDATE(ownerId), updates);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Upload owner documents by sending already-uploaded Firebase Storage URLs.
   */
  async uploadDocuments(
    ownerId: string,
    urls: { vehiclePhotoUrl?: string; rcDocumentUrl?: string; insuranceDocumentUrl?: string }
  ): Promise<OwnerProfile> {
    try {
      const { data } = await apiClient.post<OwnerProfile>(
        OWNER_ENDPOINTS.UPLOAD_DOCUMENTS(ownerId),
        urls
      );
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Get earnings and stats for an owner.
   */
  async getOwnerEarnings(ownerId: string): Promise<OwnerEarnings> {
    try {
      const { data } = await apiClient.get<OwnerEarnings>(OWNER_ENDPOINTS.EARNINGS(ownerId));
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Get all verified owners in a specific area.
   */
  async getOwnersByArea(area: string): Promise<OwnerProfile[]> {
    try {
      const { data } = await apiClient.get<OwnerProfile[]>(OWNER_ENDPOINTS.BY_AREA(area));
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * List all owners with optional filters (admin use).
   */
  async listOwners(params?: OwnerListParams): Promise<OwnerProfile[]> {
    try {
      const { data } = await apiClient.get<OwnerProfile[]>(OWNER_ENDPOINTS.LIST, { params });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },
};
