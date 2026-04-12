import { apiClient } from '../config';
import { CAMPAIGN_ENDPOINTS } from '../endpoints';
import { parseApiError } from '../errors';

export interface CreateCampaignData {
  advertiserId: string;
  campaignName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  objective: string;
  selectedVehicleIds: string[];
  artworkUrl: string;
  totalCost: number;
}

export interface Campaign extends CreateCampaignData {
  id: string;
  status: 'draft' | 'pending_payment' | 'active' | 'completed' | 'cancelled';
  approvals: CampaignApproval[];
  createdAt: string;
  updatedAt: string;
}

export interface CampaignApproval {
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected';
  respondedAt?: string;
}

export interface PaymentData {
  amount: number;
  currency: string;
  paymentMethodId?: string;
  upiId?: string;
}

export interface PaymentResult {
  transactionId: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  paidAt: string;
}

export interface KmTrackingData {
  campaignId: string;
  totalKm: number;
  dailyBreakdown: Array<{ date: string; km: number; ownerId: string }>;
  ownerKmSummary: Array<{ ownerId: string; ownerName: string; totalKm: number }>;
}

export const campaignService = {
  /**
   * Create a new campaign.
   */
  async createCampaign(campaignData: CreateCampaignData): Promise<Campaign> {
    try {
      const { data } = await apiClient.post<Campaign>(CAMPAIGN_ENDPOINTS.CREATE, campaignData);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Get campaign details by ID.
   */
  async getCampaign(campaignId: string): Promise<Campaign> {
    try {
      const { data } = await apiClient.get<Campaign>(CAMPAIGN_ENDPOINTS.GET(campaignId));
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Update campaign details.
   */
  async updateCampaign(
    campaignId: string,
    updates: Partial<CreateCampaignData>
  ): Promise<Campaign> {
    try {
      const { data } = await apiClient.put<Campaign>(
        CAMPAIGN_ENDPOINTS.UPDATE(campaignId),
        updates
      );
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Set selected vehicle IDs for a campaign.
   */
  async selectVehicles(campaignId: string, vehicleIds: string[]): Promise<Campaign> {
    try {
      const { data } = await apiClient.put<Campaign>(CAMPAIGN_ENDPOINTS.VEHICLES(campaignId), {
        vehicleIds,
      });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Owner approves a campaign.
   */
  async approveCampaign(campaignId: string, ownerId: string): Promise<Campaign> {
    try {
      const { data } = await apiClient.post<Campaign>(CAMPAIGN_ENDPOINTS.APPROVE(campaignId), {
        ownerId,
      });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Process payment for a campaign.
   */
  async processPayment(campaignId: string, paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const { data } = await apiClient.post<PaymentResult>(
        CAMPAIGN_ENDPOINTS.PAYMENT(campaignId),
        paymentData
      );
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Get km tracking data for a campaign.
   */
  async getKmTracking(campaignId: string): Promise<KmTrackingData> {
    try {
      const { data } = await apiClient.get<KmTrackingData>(
        CAMPAIGN_ENDPOINTS.KM_TRACKING(campaignId)
      );
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * List all campaigns with optional filters.
   */
  async listCampaigns(params?: {
    advertiserId?: string;
    status?: Campaign['status'];
    page?: number;
    limit?: number;
  }): Promise<Campaign[]> {
    try {
      const { data } = await apiClient.get<Campaign[]>(CAMPAIGN_ENDPOINTS.LIST, { params });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },
};
