import { apiClient } from '../config';
import { DASHBOARD_ENDPOINTS } from '../endpoints';
import { parseApiError } from '../errors';

export interface AdvertiserDashboard {
  advertiserId: string;
  activeCampaigns: number;
  totalSpend: number;
  totalKm: number;
  averageKmPerDay: number;
  recentCampaigns: Array<{
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    totalKm: number;
    cost: number;
  }>;
}

export interface OwnerDashboard {
  ownerId: string;
  activeCampaigns: number;
  totalEarnings: number;
  pendingPayout: number;
  totalKmDriven: number;
  recentActivity: Array<{
    date: string;
    kmDriven: number;
    campaignName: string;
    earnings: number;
  }>;
}

export interface CampaignAnalytics {
  campaignId: string;
  totalKm: number;
  averageDailyKm: number;
  vehicleCount: number;
  approvalRate: number;
  estimatedReach: number;
  dailyKmTrend: Array<{ date: string; km: number }>;
  vehicleBreakdown: Array<{
    vehicleId: string;
    registrationNumber: string;
    ownerName: string;
    area: string;
    kmDriven: number;
  }>;
}

export interface KmStats {
  campaignId: string;
  totalKm: number;
  dailyAverage: number;
  weeklyData: Array<{ week: string; km: number }>;
  ownerStats: Array<{ ownerId: string; ownerName: string; km: number; percentage: number }>;
}

export const dashboardService = {
  /**
   * Get advertiser dashboard summary.
   */
  async getAdvertiserDashboard(advertiserId: string): Promise<AdvertiserDashboard> {
    try {
      const { data } = await apiClient.get<AdvertiserDashboard>(
        DASHBOARD_ENDPOINTS.ADVERTISER(advertiserId)
      );
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Get owner dashboard summary.
   */
  async getOwnerDashboard(ownerId: string): Promise<OwnerDashboard> {
    try {
      const { data } = await apiClient.get<OwnerDashboard>(DASHBOARD_ENDPOINTS.OWNER(ownerId));
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Get analytics for a specific campaign.
   */
  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
    try {
      const { data } = await apiClient.get<CampaignAnalytics>(
        DASHBOARD_ENDPOINTS.ANALYTICS(campaignId)
      );
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },

  /**
   * Get km tracking stats for a campaign.
   */
  async getKmStats(campaignId: string): Promise<KmStats> {
    try {
      const { data } = await apiClient.get<KmStats>(DASHBOARD_ENDPOINTS.KM_STATS(campaignId));
      return data;
    } catch (err) {
      throw parseApiError(err);
    }
  },
};
