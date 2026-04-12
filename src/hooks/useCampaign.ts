import { useState, useEffect, useCallback } from 'react';
import { campaignService, Campaign, CreateCampaignData, PaymentData, PaymentResult } from '../services/api/services/campaignService';
import { createCampaign as createFirestoreCampaign, updateCampaign as updateFirestoreCampaign } from '../services/firebase/firestore';
import { listenToCampaign } from '../services/firebase/realtime';
import { uploadCampaignArtwork, UploadProgressCallback } from '../services/firebase/storage';

// ── useCreateCampaign ─────────────────────────────────────────────────────────

export function useCreateCampaign() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  const createCampaign = useCallback(
    async (data: CreateCampaignData): Promise<Campaign | null> => {
      setLoading(true);
      setError(null);
      try {
        const created = await campaignService.createCampaign(data);
        // Mirror to Firestore for real-time listeners
        await createFirestoreCampaign({
          ...created,
          status: created.status,
        });
        setCampaign(created);
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create campaign.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createCampaign, campaign, loading, error };
}

// ── useCampaignDetails ────────────────────────────────────────────────────────

export function useCampaignDetails(campaignId: string | undefined) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    if (!campaignId) return;
    setLoading(true);

    const unsubscribe = listenToCampaign(
      campaignId,
      (firestoreCampaign) => {
        if (firestoreCampaign) {
          // Map Firestore Campaign type to API Campaign type
          setCampaign(firestoreCampaign as unknown as Campaign);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [campaignId]);

  // Initial fetch from backend
  useEffect(() => {
    if (!campaignId) return;
    campaignService
      .getCampaign(campaignId)
      .then(setCampaign)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load campaign.'));
  }, [campaignId]);

  return { campaign, loading, error };
}

// ── useSelectVehicles ─────────────────────────────────────────────────────────

export function useSelectVehicles() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectVehicles = useCallback(
    async (campaignId: string, vehicleIds: string[]): Promise<Campaign | null> => {
      setLoading(true);
      setError(null);
      try {
        const updated = await campaignService.selectVehicles(campaignId, vehicleIds);
        await updateFirestoreCampaign(campaignId, { selectedVehicleIds: vehicleIds });
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to select vehicles.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { selectVehicles, loading, error };
}

// ── useApproveCampaign ────────────────────────────────────────────────────────

export function useApproveCampaign() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveCampaign = useCallback(
    async (campaignId: string, ownerId: string): Promise<Campaign | null> => {
      setLoading(true);
      setError(null);
      try {
        const updated = await campaignService.approveCampaign(campaignId, ownerId);
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Approval failed.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { approveCampaign, loading, error };
}

// ── useProcessPayment ─────────────────────────────────────────────────────────

export function useProcessPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const processPayment = useCallback(
    async (campaignId: string, paymentData: PaymentData): Promise<PaymentResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await campaignService.processPayment(campaignId, paymentData);
        setResult(res);
        if (res.status === 'success') {
          await updateFirestoreCampaign(campaignId, { status: 'active' });
        }
        return res;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Payment failed.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { processPayment, result, loading, error };
}

// ── useUploadArtwork ──────────────────────────────────────────────────────────

export function useUploadArtwork() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadArtwork = useCallback(
    async (
      campaignId: string,
      file: File,
      onProgress?: UploadProgressCallback
    ): Promise<string | null> => {
      setLoading(true);
      setProgress(0);
      setError(null);

      const trackProgress: UploadProgressCallback = (p) => {
        setProgress(p);
        onProgress?.(p);
      };

      try {
        const { downloadUrl } = await uploadCampaignArtwork(campaignId, file, trackProgress);
        await updateFirestoreCampaign(campaignId, { artworkUrl: downloadUrl });
        setProgress(100);
        return downloadUrl;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Artwork upload failed.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { uploadArtwork, progress, loading, error };
}
