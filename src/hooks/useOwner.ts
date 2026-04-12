import { useState, useEffect, useCallback } from 'react';
import { ownerService, OwnerProfile, OwnerRegistrationData } from '../services/api/services/ownerService';
import { uploadVehiclePhoto, uploadRcDocument, uploadInsuranceDocument, UploadProgressCallback } from '../services/firebase/storage';
import { createOwnerProfile, updateOwnerProfile } from '../services/firebase/firestore';

// ── useOwnerProfile ───────────────────────────────────────────────────────────

export function useOwnerProfile(ownerId: string | undefined) {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    ownerService
      .getOwnerProfile(ownerId)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load profile.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ownerId]);

  return { profile, loading, error };
}

// ── useUpdateOwnerProfile ─────────────────────────────────────────────────────

export function useUpdateOwnerProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateProfile = useCallback(
    async (ownerId: string, updates: Partial<OwnerRegistrationData>): Promise<OwnerProfile | null> => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
        const updated = await ownerService.updateOwnerDetails(ownerId, updates);
        // Mirror to Firestore
        await updateOwnerProfile(ownerId, updates);
        setSuccess(true);
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateProfile, loading, error, success };
}

// ── useUploadDocument ─────────────────────────────────────────────────────────

export type DocumentType = 'vehiclePhoto' | 'rcDocument' | 'insuranceDocument';

export interface UploadDocumentResult {
  type: DocumentType;
  downloadUrl: string;
  storagePath: string;
}

export function useUploadDocument() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (
      ownerId: string,
      type: DocumentType,
      file: File,
      onProgress?: UploadProgressCallback
    ): Promise<UploadDocumentResult | null> => {
      setLoading(true);
      setProgress(0);
      setError(null);

      const trackProgress: UploadProgressCallback = (p) => {
        setProgress(p);
        onProgress?.(p);
      };

      try {
        let result;
        if (type === 'vehiclePhoto') {
          result = await uploadVehiclePhoto(ownerId, file, trackProgress);
        } else if (type === 'rcDocument') {
          result = await uploadRcDocument(ownerId, file, trackProgress);
        } else {
          result = await uploadInsuranceDocument(ownerId, file, trackProgress);
        }

        // Notify backend about the new URL
        const urlField = `${type}Url` as 'vehiclePhotoUrl' | 'rcDocumentUrl' | 'insuranceDocumentUrl';
        await ownerService.uploadDocuments(ownerId, { [urlField]: result.downloadUrl });

        setProgress(100);
        return { type, ...result };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { upload, progress, loading, error };
}

// ── useRegisterOwner ──────────────────────────────────────────────────────────

export function useRegisterOwner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);

  const register = useCallback(async (data: OwnerRegistrationData): Promise<OwnerProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const created = await ownerService.registerOwner(data);
      // Mirror to Firestore
      await createOwnerProfile({
        ...created,
        vehicleType: created.vehicleType,
      });
      setOwner(created);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { register, owner, loading, error };
}
