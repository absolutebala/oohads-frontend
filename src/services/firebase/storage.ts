import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from '../../config/firebase';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UploadResult {
  downloadUrl: string;
  storagePath: string;
}

export type UploadProgressCallback = (progress: number) => void;

// ── Validation ────────────────────────────────────────────────────────────────

const MAX_IMAGE_SIZE_MB = 5;
const MAX_DOCUMENT_SIZE_MB = 10;
const MAX_ARTWORK_SIZE_MB = 20;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

function validateFile(
  file: File,
  allowedTypes: string[],
  maxSizeMb: number
): void {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    );
  }
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > maxSizeMb) {
    throw new Error(`File size exceeds ${maxSizeMb} MB limit.`);
  }
}

// ── Core Upload ───────────────────────────────────────────────────────────────

function uploadFile(
  storagePath: string,
  file: File,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        if (onProgress) {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(progress));
        }
      },
      (error) => reject(new Error(`Upload failed: ${error.message}`)),
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ downloadUrl, storagePath });
        } catch (error: unknown) {
          reject(
            error instanceof Error ? error : new Error('Failed to get download URL')
          );
        }
      }
    );
  });
}

// ── Vehicle Photos ────────────────────────────────────────────────────────────

/**
 * Upload a vehicle photo for an owner.
 */
export async function uploadVehiclePhoto(
  ownerId: string,
  file: File,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB);
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `owners/${ownerId}/vehicle-photo.${ext}`;
  return uploadFile(path, file, onProgress);
}

// ── RC Document ───────────────────────────────────────────────────────────────

/**
 * Upload an RC (Registration Certificate) document.
 */
export async function uploadRcDocument(
  ownerId: string,
  file: File,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE_MB);
  const ext = file.name.split('.').pop() ?? 'pdf';
  const path = `owners/${ownerId}/rc-document.${ext}`;
  return uploadFile(path, file, onProgress);
}

// ── Insurance Document ────────────────────────────────────────────────────────

/**
 * Upload an insurance document.
 */
export async function uploadInsuranceDocument(
  ownerId: string,
  file: File,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE_MB);
  const ext = file.name.split('.').pop() ?? 'pdf';
  const path = `owners/${ownerId}/insurance-document.${ext}`;
  return uploadFile(path, file, onProgress);
}

// ── Campaign Artwork ──────────────────────────────────────────────────────────

/**
 * Upload campaign artwork.
 */
export async function uploadCampaignArtwork(
  campaignId: string,
  file: File,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  validateFile(file, [...ALLOWED_IMAGE_TYPES, 'application/pdf'], MAX_ARTWORK_SIZE_MB);
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `campaigns/${campaignId}/artwork.${ext}`;
  return uploadFile(path, file, onProgress);
}

// ── Generate Download URL ─────────────────────────────────────────────────────

/**
 * Get a download URL for an existing storage path.
 */
export async function getFileDownloadUrl(storagePath: string): Promise<string> {
  const storageRef = ref(storage, storagePath);
  return getDownloadURL(storageRef);
}

// ── Delete File ───────────────────────────────────────────────────────────────

/**
 * Delete a file at the given storage path.
 */
export async function deleteFile(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}
