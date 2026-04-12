// ── Auth Endpoints ────────────────────────────────────────────────────────────
export const AUTH_ENDPOINTS = {
  VERIFY_OTP: '/api/auth/verify-otp',
  GOOGLE_CALLBACK: '/api/auth/google-callback',
  LOGOUT: '/api/auth/logout',
  REFRESH_TOKEN: '/api/auth/refresh-token',
} as const;

// ── Owner Endpoints ───────────────────────────────────────────────────────────
export const OWNER_ENDPOINTS = {
  LIST: '/api/owners',
  GET: (id: string) => `/api/owners/${id}`,
  REGISTER: '/api/owners/register',
  UPDATE: (id: string) => `/api/owners/${id}`,
  UPLOAD_DOCUMENTS: (id: string) => `/api/owners/${id}/documents`,
  EARNINGS: (id: string) => `/api/owners/${id}/earnings`,
  BY_AREA: (area: string) => `/api/owners/area/${encodeURIComponent(area)}`,
  VERIFY: (id: string) => `/api/owners/${id}/verify`,
} as const;

// ── Campaign Endpoints ────────────────────────────────────────────────────────
export const CAMPAIGN_ENDPOINTS = {
  LIST: '/api/campaigns',
  GET: (id: string) => `/api/campaigns/${id}`,
  CREATE: '/api/campaigns',
  UPDATE: (id: string) => `/api/campaigns/${id}`,
  VEHICLES: (id: string) => `/api/campaigns/${id}/vehicles`,
  APPROVE: (id: string) => `/api/campaigns/${id}/approve`,
  PAYMENT: (id: string) => `/api/campaigns/${id}/payment`,
  KM_TRACKING: (id: string) => `/api/campaigns/${id}/km-tracking`,
} as const;

// ── Admin Endpoints ───────────────────────────────────────────────────────────
export const ADMIN_ENDPOINTS = {
  LIST_OWNERS: '/api/admin/owners',
  BATCH_ADD_OWNERS: '/api/admin/owners',
  PRICE_OVERRIDE: (id: string) => `/api/admin/owners/${id}/price-override`,
  ANALYTICS: '/api/admin/analytics',
  LIST_CAMPAIGNS: '/api/admin/campaigns',
  SEND_NOTIFICATION: '/api/admin/send-notification',
} as const;

// ── Dashboard Endpoints ───────────────────────────────────────────────────────
export const DASHBOARD_ENDPOINTS = {
  ADVERTISER: (id: string) => `/api/dashboard/advertiser/${id}`,
  OWNER: (id: string) => `/api/dashboard/owner/${id}`,
  ANALYTICS: (id: string) => `/api/dashboard/analytics/${id}`,
  KM_STATS: (id: string) => `/api/dashboard/km-stats/${id}`,
} as const;
