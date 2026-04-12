import { useState, useEffect, useCallback } from 'react';
import { dashboardService, AdvertiserDashboard, OwnerDashboard, CampaignAnalytics, KmStats } from '../services/api/services/dashboardService';
import { listenToOwnerKmTracking, KmTrackingEntry } from '../services/firebase/realtime';
import { useAuthContext } from '../context/AuthContext';

// ── useDashboardData ──────────────────────────────────────────────────────────

export function useDashboardData() {
  const { userProfile } = useAuthContext();
  const [advertiserData, setAdvertiserData] = useState<AdvertiserDashboard | null>(null);
  const [ownerData, setOwnerData] = useState<OwnerDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);
    setError(null);

    try {
      if (userProfile.role === 'advertiser') {
        const data = await dashboardService.getAdvertiserDashboard(userProfile.id);
        setAdvertiserData(data);
      } else if (userProfile.role === 'owner') {
        const data = await dashboardService.getOwnerDashboard(userProfile.id);
        setOwnerData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { advertiserData, ownerData, loading, error, refetch: fetchData };
}

// ── useKmTracking ─────────────────────────────────────────────────────────────

export function useKmTracking(campaignId: string | undefined, ownerId: string | undefined) {
  const [kmEntry, setKmEntry] = useState<KmTrackingEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId || !ownerId) return;
    setLoading(true);

    const unsubscribe = listenToOwnerKmTracking(
      campaignId,
      ownerId,
      (entry) => {
        setKmEntry(entry);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [campaignId, ownerId]);

  return { kmEntry, loading, error };
}

// ── useAnalytics ──────────────────────────────────────────────────────────────

export function useAnalytics(campaignId: string | undefined) {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!campaignId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getCampaignAnalytics(campaignId);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
}

// ── useKmStats ────────────────────────────────────────────────────────────────

export function useKmStats(campaignId: string | undefined) {
  const [kmStats, setKmStats] = useState<KmStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    dashboardService
      .getKmStats(campaignId)
      .then((data) => {
        if (!cancelled) setKmStats(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load km stats.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  return { kmStats, loading, error };
}
