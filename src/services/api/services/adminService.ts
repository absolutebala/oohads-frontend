import { apiClient } from '../config';
import { ADMIN_ENDPOINTS } from '../endpoints';
import { parseApiError } from '../errors';
import { OwnerProfile, OwnerRegistrationData } from './ownerService';
import { Campaign } from './campaignService';

export interface PlatformAnalytics {
  totalOwners: number;
  verifiedOwners: number;
  pendingOwners: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalRevenue: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  topAreas: Array<{ area: string; ownerCount: number; campaignCount: number }>;
}

export interface NotificationPayload {
  message: string;
  title?: string;
  recipientIds: string[];
  channel: 'sms' | 'push' | 'both';
}

export interface NotificationResult {
  sent: number;
  failed: number;
  messageId: string;
}

export const adminService = {
  /**
   * Batch-add multiple owners.
   */
  async addOwnerInBatch(ownersData: OwnerRegistrationData[]): Promise<OwnerProfile[]> {
    try {
      const { data } = await apiClient.post<OwnerProfile[]>(
        ADMIN_ENDPOINTS.BATCH_ADD_OWNERS,
        { owners: ownersData }
      );
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Override the monthly rate for a specific owner.
   */
  async overridePricing(ownerId: string, newMonthlyRate: number): Promise<OwnerProfile> {
    try {
      const { data } = await apiClient.put<OwnerProfile>(
        ADMIN_ENDPOINTS.PRICE_OVERRIDE(ownerId),
        { monthlyRate: newMonthlyRate }
      );
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Fetch platform-wide analytics.
   */
  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    try {
      const { data } = await apiClient.get<PlatformAnalytics>(ADMIN_ENDPOINTS.ANALYTICS);
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Send SMS or push notifications to specified recipients.
   */
  async sendNotifications(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const { data } = await apiClient.post<NotificationResult>(
        ADMIN_ENDPOINTS.SEND_NOTIFICATION,
        payload
      );
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * List all owners (admin view with full details).
   */
  async listAllOwners(params?: {
    status?: 'pending' | 'verified' | 'rejected';
    page?: number;
    limit?: number;
  }): Promise<OwnerProfile[]> {
    try {
      const { data } = await apiClient.get<OwnerProfile[]>(ADMIN_ENDPOINTS.LIST_OWNERS, {
        params,
      });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * List all campaigns (admin view).
   */
  async listAllCampaigns(params?: {
    status?: Campaign['status'];
    page?: number;
    limit?: number;
  }): Promise<Campaign[]> {
    try {
      const { data } = await apiClient.get<Campaign[]>(ADMIN_ENDPOINTS.LIST_CAMPAIGNS, {
        params,
      });
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },
};
