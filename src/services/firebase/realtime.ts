import {
  doc,
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { UserProfile, OwnerProfile, Campaign } from './firestore';

// ── User Profile Listener ─────────────────────────────────────────────────────

/**
 * Listen to real-time updates of a user profile.
 * Returns an unsubscribe function.
 */
export function listenToUserProfile(
  userId: string,
  onUpdate: (profile: UserProfile | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const ref = doc(firestore, 'users', userId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      const data = snap.data();
      onUpdate(snapToUserProfile(snap.id, data));
    },
    (err) => onError?.(err)
  );
}

// ── Campaign Status Listener ──────────────────────────────────────────────────

/**
 * Listen to real-time updates for a specific campaign.
 * Returns an unsubscribe function.
 */
export function listenToCampaign(
  campaignId: string,
  onUpdate: (campaign: Campaign | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const ref = doc(firestore, 'campaigns', campaignId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      onUpdate(snapToCampaign(snap.id, snap.data()));
    },
    (err) => onError?.(err)
  );
}

// ── Owner Km Tracking Listener ────────────────────────────────────────────────

export interface KmTrackingEntry {
  ownerId: string;
  date: string;
  kmDriven: number;
  lastUpdated: string;
}

/**
 * Listen to real-time km tracking data for a specific owner within a campaign.
 * Returns an unsubscribe function.
 */
export function listenToOwnerKmTracking(
  campaignId: string,
  ownerId: string,
  onUpdate: (entry: KmTrackingEntry | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const ref = doc(firestore, 'campaigns', campaignId, 'kmTracking', ownerId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      const data = snap.data();
      onUpdate({
        ownerId: snap.id,
        date: data.date ?? '',
        kmDriven: data.kmDriven ?? 0,
        lastUpdated:
          data.lastUpdated instanceof Timestamp
            ? data.lastUpdated.toDate().toISOString()
            : (data.lastUpdated ?? ''),
      });
    },
    (err) => onError?.(err)
  );
}

// ── All Campaign Approvals Listener ──────────────────────────────────────────

/**
 * Listen to real-time approval updates for all owners in a campaign.
 * Returns an unsubscribe function.
 */
export function listenToCampaignApprovals(
  campaignId: string,
  onUpdate: (campaign: Campaign | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return listenToCampaign(campaignId, onUpdate, onError);
}

// ── Owner Profile Listener ────────────────────────────────────────────────────

/**
 * Listen to real-time updates of an owner profile.
 * Returns an unsubscribe function.
 */
export function listenToOwnerProfile(
  ownerId: string,
  onUpdate: (profile: OwnerProfile | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const ref = doc(firestore, 'owners', ownerId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      const data = snap.data();
      onUpdate(snapToOwnerProfile(snap.id, data));
    },
    (err) => onError?.(err)
  );
}

// ── Collection Listener ───────────────────────────────────────────────────────

/**
 * Listen to real-time updates of campaigns for an advertiser.
 * Returns an unsubscribe function.
 */
export function listenToAdvertiserCampaigns(
  advertiserId: string,
  onUpdate: (campaigns: Campaign[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const ref = collection(firestore, 'campaigns');
  const q = query(ref, where('advertiserId', '==', advertiserId));
  return onSnapshot(
    q,
    (snap) => {
      const campaigns = snap.docs.map((d) => snapToCampaign(d.id, d.data()));
      onUpdate(campaigns);
    },
    (err) => onError?.(err)
  );
}

// ── Data mappers ──────────────────────────────────────────────────────────────

function snapToUserProfile(id: string, data: DocumentData): UserProfile {
  return {
    id,
    name: data.name ?? '',
    phone: data.phone ?? '',
    email: data.email ?? '',
    role: data.role ?? 'advertiser',
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt ?? ''),
  };
}

function snapToOwnerProfile(id: string, data: DocumentData): OwnerProfile {
  return {
    id,
    userId: data.userId ?? '',
    name: data.name ?? '',
    phone: data.phone ?? '',
    vehicleType: data.vehicleType ?? 'auto',
    registrationNumber: data.registrationNumber ?? '',
    operatingAreas: data.operatingAreas ?? [],
    vehiclePhotoUrl: data.vehiclePhotoUrl ?? '',
    rcDocumentUrl: data.rcDocumentUrl ?? '',
    insuranceDocumentUrl: data.insuranceDocumentUrl ?? '',
    monthlyRate: data.monthlyRate ?? 0,
    upiId: data.upiId ?? '',
    verificationStatus: data.verificationStatus ?? 'pending',
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt ?? ''),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : (data.updatedAt ?? ''),
  };
}

function snapToCampaign(id: string, data: DocumentData): Campaign {
  return {
    id,
    advertiserId: data.advertiserId ?? '',
    campaignName: data.campaignName ?? '',
    startDate: data.startDate ?? '',
    endDate: data.endDate ?? '',
    durationDays: data.durationDays ?? 0,
    objective: data.objective ?? '',
    status: data.status ?? 'draft',
    selectedVehicleIds: data.selectedVehicleIds ?? [],
    artworkUrl: data.artworkUrl ?? '',
    totalCost: data.totalCost ?? 0,
    approvals: data.approvals ?? [],
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt ?? ''),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : (data.updatedAt ?? ''),
  };
}
