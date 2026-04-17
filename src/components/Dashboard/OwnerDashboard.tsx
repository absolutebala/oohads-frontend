import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  TextField,
  Alert,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import CampaignIcon from '@mui/icons-material/Campaign';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { firebaseReady } from '../../config/firebase';
import { useAuthContext } from '../../context/AuthContext';
import {
  getOwnerById,
  updateOwnerProfile,
  getAllCampaigns,
  updateCampaign,
  OwnerProfile,
  Campaign,
  CampaignApproval,
} from '../../services/firebase/firestore';

const BRAND = '#E8521A';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_OWNER: OwnerProfile = {
  id: 'owner-mock-1',
  userId: 'user-mock-1',
  name: 'Ravi Kumar',
  phone: '+91 98765 43210',
  vehicleType: 'auto',
  registrationNumber: 'TN01AB1234',
  operatingAreas: ['T. Nagar', 'Velachery', 'Anna Nagar'],
  vehiclePhotoUrl: '',
  rcDocumentUrl: '',
  insuranceDocumentUrl: '',
  monthlyRate: 3200,
  upiId: 'ravi.kumar@upi',
  verificationStatus: 'verified',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-03-01T08:00:00Z',
};

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    advertiserId: 'adv-1',
    campaignName: 'Diwali Sale 2024',
    startDate: '2024-10-15',
    endDate: '2024-11-15',
    durationDays: 31,
    objective: 'Brand Awareness',
    status: 'active',
    selectedVehicleIds: ['owner-mock-1'],
    artworkUrl: '',
    totalCost: 9920,
    approvals: [{ ownerId: 'owner-mock-1', status: 'approved', respondedAt: '2024-10-10T09:00:00Z' }],
    createdAt: '2024-10-01T10:00:00Z',
    updatedAt: '2024-10-10T09:00:00Z',
  },
  {
    id: 'c2',
    advertiserId: 'adv-2',
    campaignName: 'App Launch Chennai',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    durationDays: 30,
    objective: 'App Install',
    status: 'approved_pending_payment',
    selectedVehicleIds: ['owner-mock-1'],
    artworkUrl: '',
    totalCost: 3200,
    approvals: [{ ownerId: 'owner-mock-1', status: 'pending' }],
    createdAt: '2024-11-20T10:00:00Z',
    updatedAt: '2024-11-20T10:00:00Z',
  },
  {
    id: 'c3',
    advertiserId: 'adv-3',
    campaignName: 'Store Opening Drive',
    startDate: '2023-12-01',
    endDate: '2023-12-31',
    durationDays: 30,
    objective: 'Store Traffic',
    status: 'completed',
    selectedVehicleIds: ['owner-mock-1'],
    artworkUrl: '',
    totalCost: 3200,
    approvals: [{ ownerId: 'owner-mock-1', status: 'approved', respondedAt: '2023-11-25T11:00:00Z' }],
    createdAt: '2023-11-15T10:00:00Z',
    updatedAt: '2023-12-31T23:59:00Z',
  },
];

const MOCK_EARNINGS = [
  { month: 'October 2024', campaign: 'Diwali Sale 2024', amount: 3200, status: 'paid' },
  { month: 'November 2024', campaign: 'Diwali Sale 2024', amount: 3200, status: 'paid' },
  { month: 'December 2023', campaign: 'Store Opening Drive', amount: 3200, status: 'paid' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function verificationStatusLabel(status: OwnerProfile['verificationStatus']): string {
  if (status === 'verified') return 'Verified';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
}

function verificationStatusSub(status: OwnerProfile['verificationStatus']): string {
  if (status === 'verified') return 'Your vehicle is approved';
  return 'Awaiting admin review';
}

const approvalStatusConfig: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: '#FAEEDA', color: '#633806', label: '🟡 Pending' },
  approved: { bg: '#EAF3DE', color: '#27500A', label: '🟢 Approved' },
  rejected: { bg: '#FDECEA', color: '#B83D0F', label: '🔴 Rejected' },
};

const verificationConfig: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: '#FAEEDA', color: '#633806', label: '⏳ Pending Verification' },
  verified: { bg: '#EAF3DE', color: '#27500A', label: '✅ Verified' },
  rejected: { bg: '#FDECEA', color: '#B83D0F', label: '❌ Verification Rejected' },
};

// ── MetricCard ────────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}

function MetricCard({ label, value, sub, icon }: MetricCardProps) {
  return (
    <Card sx={{ p: 2.5, border: '1px solid rgba(26,21,16,0.08)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54', fontWeight: 500 }}>{label}</Typography>
        <Box sx={{ color: BRAND, background: '#FDF0EB', borderRadius: 1.5, p: 0.75, display: 'flex' }}>{icon}</Box>
      </Box>
      <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: '#1A1510', lineHeight: 1 }}>{value}</Typography>
      {sub && (
        <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54', mt: 0.75 }}>{sub}</Typography>
      )}
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function OwnerDashboard() {
  const { firebaseUser, userProfile } = useAuthContext();
  const [tab, setTab] = useState(0);
  const [owner, setOwner] = useState<OwnerProfile | null>(MOCK_OWNER);
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [dataLoading, setDataLoading] = useState(false);

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [editAreas, setEditAreas] = useState('');
  const [editRate, setEditRate] = useState('');
  const [editUpi, setEditUpi] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Approval action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseReady || !firebaseUser?.uid) return;
    setDataLoading(true);

    const ownerId = userProfile?.id ?? firebaseUser.uid;

    Promise.all([getOwnerById(ownerId), getAllCampaigns()])
      .then(([ownerData, allCampaigns]) => {
        if (ownerData) setOwner(ownerData);
        // Filter campaigns where this owner is in selectedVehicleIds or approvals
        const ownerCampaigns = allCampaigns.filter(
          (c) =>
            c.selectedVehicleIds.includes(ownerId) ||
            c.approvals.some((a) => a.ownerId === ownerId)
        );
        setCampaigns(ownerCampaigns);
      })
      .catch(() => {
        // Fall back to mock data on error
      })
      .finally(() => setDataLoading(false));
  }, [firebaseUser?.uid, userProfile?.id]);

  // Campaign approval helpers
  function getOwnerApproval(campaign: Campaign): CampaignApproval | undefined {
    const ownerId = owner?.id ?? MOCK_OWNER.id;
    return campaign.approvals.find((a) => a.ownerId === ownerId);
  }

  async function handleApprovalAction(campaign: Campaign, action: 'approved' | 'rejected') {
    const ownerId = owner?.id ?? MOCK_OWNER.id;
    setActionLoading(campaign.id + action);

    const updatedApprovals: CampaignApproval[] = campaign.approvals.map((a) =>
      a.ownerId === ownerId
        ? { ...a, status: action, respondedAt: new Date().toISOString() }
        : a
    );

    // Optimistically update local state
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaign.id ? { ...c, approvals: updatedApprovals } : c))
    );

    if (firebaseReady) {
      try {
        await updateCampaign(campaign.id, { approvals: updatedApprovals });
      } catch {
        // Revert on error
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaign.id ? campaign : c))
        );
      }
    }
    setActionLoading(null);
  }

  // Profile save
  async function handleProfileSave() {
    if (!owner) return;
    setSaveLoading(true);
    setSaveError('');
    setSaveSuccess(false);

    const areas = editAreas
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const rate = parseFloat(editRate);
    const updates: Partial<OwnerProfile> = {
      operatingAreas: areas.length ? areas : owner.operatingAreas,
      monthlyRate: isNaN(rate) ? owner.monthlyRate : rate,
      upiId: editUpi.trim() || owner.upiId,
    };

    setOwner((prev) => (prev ? { ...prev, ...updates } : prev));

    if (firebaseReady) {
      try {
        await updateOwnerProfile(owner.id, updates);
        setSaveSuccess(true);
      } catch {
        setSaveError('Failed to save changes. Please try again.');
      }
    } else {
      setSaveSuccess(true);
    }

    setSaveLoading(false);
    setEditMode(false);
  }

  // Derived stats
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;
  const totalEarnings = MOCK_EARNINGS.reduce((s, e) => s + e.amount, 0);
  const currentOwner = owner ?? MOCK_OWNER;

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', background: '#F5F2EF', p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Owner Dashboard</Typography>
            <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem' }}>
              Manage your vehicle campaigns and earnings
            </Typography>
          </Box>
          <Chip
            label={verificationConfig[currentOwner.verificationStatus]?.label}
            sx={{
              background: verificationConfig[currentOwner.verificationStatus]?.bg,
              color: verificationConfig[currentOwner.verificationStatus]?.color,
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          />
        </Box>

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              background: '#FFFFFF',
              borderRadius: 2,
              border: '1px solid rgba(26,21,16,0.08)',
              '& .MuiTab-root': { fontWeight: 600, fontSize: '0.8rem', textTransform: 'none', minWidth: 120 },
              '& .Mui-selected': { color: BRAND },
              '& .MuiTabs-indicator': { background: BRAND },
            }}
          >
            <Tab label="Overview" />
            <Tab label="Campaign Requests" />
            <Tab label="Earnings" />
            <Tab label="Profile" />
          </Tabs>
        </Box>

        {/* Tab: Overview */}
        {tab === 0 && (
          <Box>
            {dataLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: BRAND }} />
              </Box>
            ) : (
              <>
                {/* Metric Cards */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                  <MetricCard
                    label="Verification Status"
                    value={verificationStatusLabel(currentOwner.verificationStatus)}
                    sub={verificationStatusSub(currentOwner.verificationStatus)}
                    icon={<VerifiedIcon fontSize="small" />}
                  />
                  <MetricCard
                    label="Active Campaigns"
                    value={String(activeCampaigns)}
                    sub={`${campaigns.length} total campaigns`}
                    icon={<CampaignIcon fontSize="small" />}
                  />
                  <MetricCard
                    label="Total Earnings"
                    value={`₹${totalEarnings.toLocaleString()}`}
                    sub="All-time earnings"
                    icon={<AttachMoneyIcon fontSize="small" />}
                  />
                  <MetricCard
                    label="Monthly Rate"
                    value={`₹${currentOwner.monthlyRate.toLocaleString()}`}
                    sub="Per campaign per month"
                    icon={<DirectionsCarIcon fontSize="small" />}
                  />
                </Box>

                {/* Vehicle Summary */}
                <Card sx={{ p: 3, mb: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>Your Vehicle</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54', mb: 0.5 }}>Vehicle Type</Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {currentOwner.vehicleType === 'auto' ? '🛺 Auto' : '🚕 Taxi'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54', mb: 0.5 }}>Registration No.</Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{currentOwner.registrationNumber || '—'}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54', mb: 0.5 }}>Operating Areas</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {currentOwner.operatingAreas.length > 0
                          ? currentOwner.operatingAreas.map((area) => (
                              <Chip
                                key={area}
                                label={area}
                                size="small"
                                sx={{ background: '#FDF0EB', color: BRAND, fontWeight: 600, fontSize: '0.7rem' }}
                              />
                            ))
                          : <Typography sx={{ fontSize: '0.85rem', color: '#6B5E54' }}>—</Typography>
                        }
                      </Box>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54', mb: 0.5 }}>Owner Name</Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{currentOwner.name}</Typography>
                    </Box>
                  </Box>
                </Card>

                {/* Recent Campaign Activity */}
                <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>Recent Campaign Activity</Typography>
                  {campaigns.length === 0 ? (
                    <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem' }}>No campaigns yet.</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {campaigns.slice(0, 5).map((campaign) => {
                        const approval = getOwnerApproval(campaign);
                        return (
                          <Box
                            key={campaign.id}
                            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
                          >
                            <Box>
                              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{campaign.campaignName}</Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54' }}>
                                {campaign.startDate} → {campaign.endDate} · {campaign.objective}
                              </Typography>
                            </Box>
                            <Chip
                              label={approvalStatusConfig[approval?.status ?? 'pending']?.label}
                              size="small"
                              sx={{
                                background: approvalStatusConfig[approval?.status ?? 'pending']?.bg,
                                color: approvalStatusConfig[approval?.status ?? 'pending']?.color,
                                fontWeight: 600,
                                fontSize: '0.65rem',
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Card>
              </>
            )}
          </Box>
        )}

        {/* Tab: Campaign Requests */}
        {tab === 1 && (
          <Box>
            {dataLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: BRAND }} />
              </Box>
            ) : campaigns.length === 0 ? (
              <Card sx={{ p: 4, border: '1px solid rgba(26,21,16,0.08)', textAlign: 'center' }}>
                <Typography sx={{ color: '#6B5E54' }}>No campaign requests yet.</Typography>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {campaigns.map((campaign) => {
                  const approval = getOwnerApproval(campaign);
                  const isPending = !approval || approval.status === 'pending';
                  const approveLoading = actionLoading === campaign.id + 'approved';
                  const rejectLoading = actionLoading === campaign.id + 'rejected';
                  return (
                    <Card key={campaign.id} sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{campaign.campaignName}</Typography>
                            <Chip
                              label={approvalStatusConfig[approval?.status ?? 'pending']?.label}
                              size="small"
                              sx={{
                                background: approvalStatusConfig[approval?.status ?? 'pending']?.bg,
                                color: approvalStatusConfig[approval?.status ?? 'pending']?.color,
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                          <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54', mb: 0.5 }}>
                            📅 {campaign.startDate} → {campaign.endDate} ({campaign.durationDays} days)
                          </Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54', mb: 0.5 }}>
                            🎯 Objective: {campaign.objective}
                          </Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54' }}>
                            💰 Campaign value: ₹{campaign.totalCost.toLocaleString()}
                          </Typography>
                        </Box>
                        {isPending && (
                          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={approveLoading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <CheckCircleIcon fontSize="small" />}
                              disabled={!!actionLoading}
                              onClick={() => handleApprovalAction(campaign, 'approved')}
                              sx={{
                                background: '#27500A',
                                '&:hover': { background: '#1e3d07' },
                                fontSize: '0.78rem',
                                textTransform: 'none',
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={rejectLoading ? <CircularProgress size={14} sx={{ color: BRAND }} /> : <CancelIcon fontSize="small" />}
                              disabled={!!actionLoading}
                              onClick={() => handleApprovalAction(campaign, 'rejected')}
                              sx={{
                                borderColor: '#B83D0F',
                                color: '#B83D0F',
                                fontSize: '0.78rem',
                                textTransform: 'none',
                                '&:hover': { borderColor: '#B83D0F', background: '#FDECEA' },
                              }}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* Tab: Earnings */}
        {tab === 2 && (
          <Box>
            {/* Summary Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
              <MetricCard
                label="Total Earnings"
                value={`₹${totalEarnings.toLocaleString()}`}
                sub="All-time"
                icon={<AttachMoneyIcon fontSize="small" />}
              />
              <MetricCard
                label="Monthly Rate"
                value={`₹${currentOwner.monthlyRate.toLocaleString()}`}
                sub="Per campaign"
                icon={<DirectionsCarIcon fontSize="small" />}
              />
              <MetricCard
                label="UPI ID"
                value={currentOwner.upiId || '—'}
                sub="Payment method"
                icon={<AccountCircleIcon fontSize="small" />}
              />
            </Box>

            {/* Payment History */}
            <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
              <Typography sx={{ fontWeight: 700, mb: 2 }}>Payment History</Typography>
              {MOCK_EARNINGS.length === 0 ? (
                <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem' }}>No payment history yet.</Typography>
              ) : (
                <Box>
                  {/* Table header */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 2fr 1fr 100px',
                      gap: 1,
                      pb: 1,
                      mb: 1,
                      borderBottom: '1px solid rgba(26,21,16,0.08)',
                    }}
                  >
                    {['Month', 'Campaign', 'Amount', 'Status'].map((h) => (
                      <Typography key={h} sx={{ fontSize: '0.75rem', color: '#6B5E54', fontWeight: 600 }}>
                        {h}
                      </Typography>
                    ))}
                  </Box>
                  {MOCK_EARNINGS.map((e, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr 1fr 100px',
                        gap: 1,
                        py: 1,
                        borderBottom: i < MOCK_EARNINGS.length - 1 ? '1px solid rgba(26,21,16,0.04)' : 'none',
                        alignItems: 'center',
                      }}
                    >
                      <Typography sx={{ fontSize: '0.85rem', color: '#1A1510' }}>{e.month}</Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: '#6B5E54' }}>{e.campaign}</Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1510' }}>₹{e.amount.toLocaleString()}</Typography>
                      <Chip
                        label={e.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                        size="small"
                        sx={{
                          background: e.status === 'paid' ? '#EAF3DE' : '#FAEEDA',
                          color: e.status === 'paid' ? '#27500A' : '#633806',
                          fontWeight: 600,
                          fontSize: '0.65rem',
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          </Box>
        )}

        {/* Tab: Profile */}
        {tab === 3 && (
          <Box>
            {saveSuccess && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSaveSuccess(false)}>
                Profile updated successfully.
              </Alert>
            )}
            {saveError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError('')}>
                {saveError}
              </Alert>
            )}

            <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 700 }}>Owner Profile</Typography>
                {!editMode && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setEditAreas(currentOwner.operatingAreas.join(', '));
                      setEditRate(String(currentOwner.monthlyRate));
                      setEditUpi(currentOwner.upiId);
                      setEditMode(true);
                    }}
                    sx={{ borderColor: 'rgba(26,21,16,0.2)', color: '#1A1510', fontSize: '0.78rem', textTransform: 'none' }}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                {/* Read-only fields */}
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54', mb: 0.5 }}>Full Name</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{currentOwner.name || '—'}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54', mb: 0.5 }}>Phone</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{currentOwner.phone || '—'}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54', mb: 0.5 }}>Vehicle Type</Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {currentOwner.vehicleType === 'auto' ? '🛺 Auto' : '🚕 Taxi'}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54', mb: 0.5 }}>Registration Number</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{currentOwner.registrationNumber || '—'}</Typography>
                </Box>

                {/* Verification Status */}
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54', mb: 0.5 }}>Verification Status</Typography>
                  <Chip
                    label={verificationConfig[currentOwner.verificationStatus]?.label}
                    sx={{
                      background: verificationConfig[currentOwner.verificationStatus]?.bg,
                      color: verificationConfig[currentOwner.verificationStatus]?.color,
                      fontWeight: 700,
                      fontSize: '0.78rem',
                    }}
                  />
                </Box>

                {/* Editable: Operating Areas */}
                <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54', mb: 0.5 }}>Operating Areas</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editAreas}
                      onChange={(e) => setEditAreas(e.target.value)}
                      helperText="Comma-separated list of areas"
                      sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.875rem' } }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {currentOwner.operatingAreas.length > 0
                        ? currentOwner.operatingAreas.map((area) => (
                            <Chip
                              key={area}
                              label={area}
                              size="small"
                              sx={{ background: '#FDF0EB', color: BRAND, fontWeight: 600, fontSize: '0.7rem' }}
                            />
                          ))
                        : <Typography sx={{ fontSize: '0.875rem', color: '#6B5E54' }}>—</Typography>
                      }
                    </Box>
                  )}
                </Box>

                {/* Editable: Monthly Rate */}
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54', mb: 0.5 }}>Monthly Rate (₹)</Typography>
                  {editMode ? (
                    <TextField
                      size="small"
                      type="number"
                      value={editRate}
                      onChange={(e) => setEditRate(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.875rem' } }}
                    />
                  ) : (
                    <Typography sx={{ fontWeight: 600 }}>₹{currentOwner.monthlyRate.toLocaleString()}</Typography>
                  )}
                </Box>

                {/* Editable: UPI ID */}
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54', mb: 0.5 }}>UPI ID</Typography>
                  {editMode ? (
                    <TextField
                      size="small"
                      value={editUpi}
                      onChange={(e) => setEditUpi(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.875rem' } }}
                    />
                  ) : (
                    <Typography sx={{ fontWeight: 600 }}>{currentOwner.upiId || '—'}</Typography>
                  )}
                </Box>
              </Box>

              {editMode && (
                <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleProfileSave}
                    disabled={saveLoading}
                    startIcon={saveLoading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : undefined}
                    sx={{ background: BRAND, '&:hover': { background: '#c94514' }, textTransform: 'none', fontWeight: 600 }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => { setEditMode(false); setSaveError(''); }}
                    sx={{ borderColor: 'rgba(26,21,16,0.2)', color: '#1A1510', textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
}
