import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { firestore } from '../../config/firebase';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'advertiser' | 'owner' | 'admin';
  createdAt: string;
}

export interface OwnerProfile {
  id: string;
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
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  advertiserId: string;
  campaignName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  objective: string;
  status: 'draft' | 'pending_payment' | 'active' | 'completed' | 'cancelled';
  selectedVehicleIds: string[];
  artworkUrl: string;
  totalCost: number;
  approvals: CampaignApproval[];
  createdAt: string;
  updatedAt: string;
}

export interface CampaignApproval {
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected';
  respondedAt?: string;
}

export interface AdminUser {
  id: string;
  userId: string;
  permissions: string[];
  lastLogin: string;
  activityLog: AdminActivityEntry[];
}

export interface AdminActivityEntry {
  action: string;
  timestamp: string;
  details?: string;
}

// ── Collection names ──────────────────────────────────────────────────────────

const COLLECTIONS = {
  USERS: 'users',
  OWNERS: 'owners',
  CAMPAIGNS: 'campaigns',
  ADMIN_USERS: 'adminUsers',
} as const;

// ── Users ─────────────────────────────────────────────────────────────────────

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const ref = doc(firestore, COLLECTIONS.USERS, profile.id);
  await setDoc(ref, {
    ...profile,
    createdAt: Timestamp.fromDate(new Date(profile.createdAt)),
  });
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  const ref = doc(firestore, COLLECTIONS.USERS, userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snapToUserProfile(snap.id, snap.data());
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>
): Promise<void> {
  const ref = doc(firestore, COLLECTIONS.USERS, userId);
  await updateDoc(ref, updates);
}

// ── Owners ────────────────────────────────────────────────────────────────────

export async function createOwnerProfile(profile: OwnerProfile): Promise<void> {
  const ref = doc(firestore, COLLECTIONS.OWNERS, profile.id);
  await setDoc(ref, {
    ...profile,
    createdAt: Timestamp.fromDate(new Date(profile.createdAt)),
    updatedAt: Timestamp.fromDate(new Date(profile.updatedAt)),
  });
}

export async function getOwnerById(ownerId: string): Promise<OwnerProfile | null> {
  const ref = doc(firestore, COLLECTIONS.OWNERS, ownerId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snapToOwnerProfile(snap.id, snap.data());
}

export async function updateOwnerProfile(
  ownerId: string,
  updates: Partial<Omit<OwnerProfile, 'id' | 'createdAt'>>
): Promise<void> {
  const ref = doc(firestore, COLLECTIONS.OWNERS, ownerId);
  await updateDoc(ref, { ...updates, updatedAt: Timestamp.now() });
}

export async function getOwnersByArea(area: string): Promise<OwnerProfile[]> {
  const constraints: QueryConstraint[] = [
    where('operatingAreas', 'array-contains', area),
    where('verificationStatus', '==', 'verified'),
  ];
  return queryOwners(constraints);
}

export async function getOwnersByStatus(
  status: OwnerProfile['verificationStatus']
): Promise<OwnerProfile[]> {
  const constraints: QueryConstraint[] = [where('verificationStatus', '==', status)];
  return queryOwners(constraints);
}

async function queryOwners(constraints: QueryConstraint[]): Promise<OwnerProfile[]> {
  const ref = collection(firestore, COLLECTIONS.OWNERS);
  const q = query(ref, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => snapToOwnerProfile(d.id, d.data()));
}

// ── Campaigns ─────────────────────────────────────────────────────────────────

export async function createCampaign(campaign: Campaign): Promise<void> {
  const ref = doc(firestore, COLLECTIONS.CAMPAIGNS, campaign.id);
  await setDoc(ref, {
    ...campaign,
    createdAt: Timestamp.fromDate(new Date(campaign.createdAt)),
    updatedAt: Timestamp.fromDate(new Date(campaign.updatedAt)),
  });
}

export async function getCampaignById(campaignId: string): Promise<Campaign | null> {
  const ref = doc(firestore, COLLECTIONS.CAMPAIGNS, campaignId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snapToCampaign(snap.id, snap.data());
}

export async function updateCampaign(
  campaignId: string,
  updates: Partial<Omit<Campaign, 'id' | 'createdAt'>>
): Promise<void> {
  const ref = doc(firestore, COLLECTIONS.CAMPAIGNS, campaignId);
  await updateDoc(ref, { ...updates, updatedAt: Timestamp.now() });
}

export async function getCampaignsByAdvertiser(advertiserId: string): Promise<Campaign[]> {
  const ref = collection(firestore, COLLECTIONS.CAMPAIGNS);
  const q = query(
    ref,
    where('advertiserId', '==', advertiserId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => snapToCampaign(d.id, d.data()));
}

export async function getCampaignsByStatus(status: Campaign['status']): Promise<Campaign[]> {
  const ref = collection(firestore, COLLECTIONS.CAMPAIGNS);
  const q = query(ref, where('status', '==', status), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => snapToCampaign(d.id, d.data()));
}

export async function getAllOwners(maxResults = 100): Promise<OwnerProfile[]> {
  const ref = collection(firestore, COLLECTIONS.OWNERS);
  const q = query(ref, orderBy('createdAt', 'desc'), limit(maxResults));
  const snap = await getDocs(q);
  return snap.docs.map((d) => snapToOwnerProfile(d.id, d.data()));
}

export async function getAllCampaigns(maxResults = 100): Promise<Campaign[]> {
  const ref = collection(firestore, COLLECTIONS.CAMPAIGNS);
  const q = query(ref, orderBy('createdAt', 'desc'), limit(maxResults));
  const snap = await getDocs(q);
  return snap.docs.map((d) => snapToCampaign(d.id, d.data()));
}

// ── Admin Users ───────────────────────────────────────────────────────────────

export async function getAdminUser(userId: string): Promise<AdminUser | null> {
  const ref = doc(firestore, COLLECTIONS.ADMIN_USERS, userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    userId: data.userId ?? snap.id,
    permissions: data.permissions ?? [],
    lastLogin: data.lastLogin ?? '',
    activityLog: data.activityLog ?? [],
  };
}

export async function updateAdminLastLogin(userId: string): Promise<void> {
  const ref = doc(firestore, COLLECTIONS.ADMIN_USERS, userId);
  await updateDoc(ref, { lastLogin: Timestamp.now() });
}

export async function addAdminActivityLog(
  userId: string,
  entry: AdminActivityEntry
): Promise<void> {
  const admin = await getAdminUser(userId);
  if (!admin) return;
  const updatedLog = [
    { ...entry, timestamp: new Date().toISOString() },
    ...admin.activityLog,
  ].slice(0, 100); // keep last 100 entries
  const ref = doc(firestore, COLLECTIONS.ADMIN_USERS, userId);
  await updateDoc(ref, { activityLog: updatedLog });
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
