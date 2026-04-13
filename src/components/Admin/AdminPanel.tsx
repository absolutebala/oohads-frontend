import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CampaignIcon from '@mui/icons-material/Campaign';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import MessageIcon from '@mui/icons-material/Message';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import { firebaseReady } from '../../config/firebase';
import {
  getAllOwners,
  getAllCampaigns,
  createOwnerProfile,
  updateOwnerProfile,
  updateCampaign,
  OwnerProfile,
  Campaign as FirestoreCampaign,
} from '../../services/firebase/firestore';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Title, ChartTooltip, Legend, Filler, ArcElement,
);

const BRAND = '#E8521A';
const AREAS = ['Anna Nagar', 'T. Nagar', 'Velachery', 'Tambaram', 'Chromepet', 'Porur', 'Adyar', 'Mylapore'];
const PHONE_REGEX = /^\d{10}$/;

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminView = 'overview' | 'owners' | 'campaigns' | 'analytics';

interface OwnerEntry {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'auto' | 'taxi';
  registrationNumber: string;
  area: string;
  monthlyRate: number;
  status: 'pending' | 'active' | 'inactive';
  addedAt: string;
}

interface CampaignEntry {
  id: string;
  name: string;
  advertiser: string;
  status: 'submitted' | 'reviewing' | 'approved' | 'live' | 'completed' | 'rejected';
  vehicles: number;
  budget: number;
  startDate: string;
  endDate: string;
  kmCovered: number;
  objective: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_OWNERS: OwnerEntry[] = [
  { id: '1', name: 'Rajan Kumar',   phone: '9876543210', vehicleType: 'auto', registrationNumber: 'TN01AB1234', area: 'T. Nagar',   monthlyRate: 2800, status: 'active',   addedAt: '2024-01-10' },
  { id: '2', name: 'Priya Selvam',  phone: '9876543211', vehicleType: 'taxi', registrationNumber: 'TN01CD5678', area: 'Velachery',  monthlyRate: 3200, status: 'active',   addedAt: '2024-01-12' },
  { id: '3', name: 'Murugan P',     phone: '9876543212', vehicleType: 'auto', registrationNumber: 'TN01EF9012', area: 'Anna Nagar', monthlyRate: 2500, status: 'pending',  addedAt: '2024-01-15' },
  { id: '4', name: 'Sundar Raj',    phone: '9876543213', vehicleType: 'taxi', registrationNumber: 'TN01GH3456', area: 'Adyar',      monthlyRate: 3500, status: 'active',   addedAt: '2024-01-18' },
  { id: '5', name: 'Kavitha M',     phone: '9876543214', vehicleType: 'auto', registrationNumber: 'TN01IJ7890', area: 'T. Nagar',   monthlyRate: 2600, status: 'inactive', addedAt: '2024-01-20' },
];

const MOCK_CAMPAIGNS: CampaignEntry[] = [
  { id: 'c1', name: 'Diwali Sale 2024',    advertiser: 'Big Bazaar Chennai',  status: 'live',      vehicles: 5, budget: 16000, startDate: '2024-01-01', endDate: '2024-01-31', kmCovered: 12450, objective: 'Brand Awareness' },
  { id: 'c2', name: 'App Launch Chennai',  advertiser: 'Swiggy India',        status: 'approved',  vehicles: 3, budget:  9600, startDate: '2024-01-15', endDate: '2024-02-14', kmCovered:  4200, objective: 'App Install' },
  { id: 'c3', name: 'Store Opening Drive', advertiser: 'Reliance Fresh',      status: 'completed', vehicles: 8, budget: 24000, startDate: '2023-12-01', endDate: '2023-12-31', kmCovered: 28800, objective: 'Store Traffic' },
  { id: 'c4', name: 'New Year Offer',      advertiser: 'Café Coffee Day',     status: 'reviewing', vehicles: 2, budget:  6000, startDate: '2024-01-25', endDate: '2024-02-25', kmCovered:     0, objective: 'Footfall' },
  { id: 'c5', name: 'Product Awareness',   advertiser: 'Asian Paints',        status: 'submitted', vehicles: 0, budget: 12000, startDate: '2024-02-01', endDate: '2024-03-01', kmCovered:     0, objective: 'Brand Awareness' },
];

// ─── Firestore ↔ Admin-entry converters ──────────────────────────────────────

function ownerProfileToEntry(o: OwnerProfile): OwnerEntry {
  const statusMap: Record<string, OwnerEntry['status']> = {
    verified: 'active',
    pending: 'pending',
    rejected: 'inactive',
  };
  return {
    id: o.id,
    name: o.name,
    phone: o.phone,
    vehicleType: o.vehicleType,
    registrationNumber: o.registrationNumber,
    area: o.operatingAreas[0] ?? '',
    monthlyRate: o.monthlyRate,
    status: statusMap[o.verificationStatus] ?? 'pending',
    addedAt: o.createdAt ? o.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

function firestoreToCampaignEntry(c: FirestoreCampaign): CampaignEntry {
  const statusMap: Record<string, CampaignEntry['status']> = {
    draft: 'submitted',
    pending_payment: 'reviewing',
    active: 'live',
    completed: 'completed',
    cancelled: 'rejected',
  };
  return {
    id: c.id,
    name: c.campaignName,
    advertiser: c.advertiserId,
    status: statusMap[c.status] ?? 'submitted',
    vehicles: c.selectedVehicleIds.length,
    budget: c.totalCost,
    startDate: c.startDate,
    endDate: c.endDate,
    kmCovered: 0,
    objective: c.objective,
  };
}

function adminStatusToFirestore(status: CampaignEntry['status']): FirestoreCampaign['status'] {
  const map: Record<string, FirestoreCampaign['status']> = {
    submitted: 'draft',
    reviewing: 'pending_payment',
    approved: 'active',
    live: 'active',
    completed: 'completed',
    rejected: 'cancelled',
  };
  return map[status] ?? 'draft';
}

// ─── Status Config ────────────────────────────────────────────────────────────

const ownerStatusConfig: Record<string, { bg: string; color: string }> = {
  active:   { bg: '#EAF3DE', color: '#27500A' },
  pending:  { bg: '#FAEEDA', color: '#633806' },
  inactive: { bg: 'rgba(26,21,16,0.06)', color: '#6B5E54' },
};

const campaignStatusConfig: Record<string, { bg: string; color: string; label: string }> = {
  submitted: { bg: '#FAEEDA', color: '#633806', label: '🟡 Submitted' },
  reviewing: { bg: '#FDF0EB', color: '#B83D0F', label: '🔍 Reviewing' },
  approved:  { bg: '#EAF3DE', color: '#27500A', label: '✅ Approved' },
  live:      { bg: '#D8F0C0', color: '#1A4D00', label: '🟢 Live' },
  completed: { bg: 'rgba(26,21,16,0.06)', color: '#6B5E54', label: '⚪ Completed' },
  rejected:  { bg: '#FDECEA', color: '#8B0000', label: '🔴 Rejected' },
};

// ─── Chart Data ───────────────────────────────────────────────────────────────

const weeklyKmData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{
    label: 'Total Km',
    data: [418, 452, 389, 476, 512, 398, 478],
    fill: true,
    borderColor: BRAND,
    backgroundColor: 'rgba(232,82,26,0.1)',
    tension: 0.4,
    pointBackgroundColor: BRAND,
    pointRadius: 4,
  }],
};

const revenueBarData = {
  labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
  datasets: [{
    label: 'Revenue (₹)',
    data: [42000, 56000, 71000, 68000, 83000, 91000],
    backgroundColor: BRAND,
    borderRadius: 6,
  }],
};

const fleetDonutData = {
  labels: ['Auto Rickshaw', 'Taxi / Cab'],
  datasets: [{
    data: [62, 38],
    backgroundColor: [BRAND, '#1A1510'],
    borderWidth: 0,
  }],
};

const chartOpts = {
  responsive: true,
  plugins: { legend: { display: false }, tooltip: { mode: 'index' as const, intersect: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(26,21,16,0.05)' }, beginAtZero: true },
  },
};

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({
  label, value, sub, icon, color = BRAND,
}: { label: string; value: string; sub?: string; icon: React.ReactNode; color?: string }) {
  return (
    <Card sx={{ p: 2.5, border: '1px solid rgba(26,21,16,0.08)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54', fontWeight: 500 }}>{label}</Typography>
        <Box sx={{ color, background: `${color}18`, borderRadius: 1.5, p: 0.75, display: 'flex' }}>{icon}</Box>
      </Box>
      <Typography sx={{ fontSize: '1.7rem', fontWeight: 800, color: '#1A1510', lineHeight: 1 }}>{value}</Typography>
      {sub && <Typography sx={{ fontSize: '0.72rem', color: '#6B5E54', mt: 0.75 }}>{sub}</Typography>}
    </Card>
  );
}

// ─── Owner Form ───────────────────────────────────────────────────────────────

interface OwnerFormData {
  name: string; phone: string;
  vehicleType: 'auto' | 'taxi' | '';
  registrationNumber: string; area: string;
  monthlyRate: string; priceOverride: string;
}

const emptyOwnerForm: OwnerFormData = {
  name: '', phone: '', vehicleType: '', registrationNumber: '', area: '', monthlyRate: '', priceOverride: '',
};

// ─── Views ────────────────────────────────────────────────────────────────────

function OverviewView({ owners, campaigns }: { owners: OwnerEntry[]; campaigns: CampaignEntry[] }) {
  const liveCount = campaigns.filter((c) => c.status === 'live').length;
  const activeOwners = owners.filter((o) => o.status === 'active').length;
  const totalKm = campaigns.reduce((s, c) => s + c.kmCovered, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.budget, 0);

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2, mb: 3 }}>
        <MetricCard label="Live Campaigns"    value={String(liveCount)}    sub="+2 this month"                icon={<CampaignIcon      fontSize="small" />} />
        <MetricCard label="Active Owners"     value={String(activeOwners)} sub={`${owners.length} total registered`} icon={<PeopleIcon        fontSize="small" />} color="#27500A" />
        <MetricCard label="Total Km Covered"  value={`${(totalKm / 1000).toFixed(1)}K`} sub="All campaigns combined" icon={<SpeedIcon         fontSize="small" />} />
        <MetricCard label="Gross Revenue"     value={`₹${(totalRevenue / 1000).toFixed(0)}K`} sub="All-time bookings"  icon={<TrendingUpIcon    fontSize="small" />} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2.5, mb: 2.5 }}>
        <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>Weekly Km Tracking</Typography>
            <Chip label="Last 7 days" size="small" sx={{ background: '#FDF0EB', color: BRAND, fontWeight: 600 }} />
          </Box>
          <Line data={weeklyKmData} options={chartOpts} />
        </Card>
        <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700, mb: 2, alignSelf: 'flex-start' }}>Fleet Mix</Typography>
          <Box sx={{ maxWidth: 180, width: '100%' }}>
            <Doughnut data={fleetDonutData} options={{ responsive: true, plugins: { legend: { display: true, position: 'bottom' } } }} />
          </Box>
        </Card>
      </Box>

      <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
        <Typography sx={{ fontWeight: 700, mb: 2 }}>Monthly Revenue Trend</Typography>
        <Bar data={revenueBarData} options={chartOpts} />
      </Card>
    </Box>
  );
}

function OwnersView({
  owners, setOwners,
}: { owners: OwnerEntry[]; setOwners: React.Dispatch<React.SetStateAction<OwnerEntry[]>> }) {
  const [form, setForm] = useState<OwnerFormData>(emptyOwnerForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [smsSuccess, setSmsSuccess] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!PHONE_REGEX.test(form.phone)) return 'Valid 10-digit phone is required';
    if (!form.vehicleType) return 'Vehicle type is required';
    if (!form.registrationNumber.trim()) return 'Registration number is required';
    if (!form.area) return 'Area is required';
    if (!form.monthlyRate || isNaN(Number(form.monthlyRate))) return 'Monthly rate is required';
    return '';
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');

    const effectiveRate = form.priceOverride ? Number(form.priceOverride) : Number(form.monthlyRate);

    if (!firebaseReady) {
      // Mock fallback
      setTimeout(() => {
        if (editId) {
          setOwners((prev) =>
            prev.map((o) =>
              o.id === editId
                ? { ...o, name: form.name, phone: form.phone, vehicleType: form.vehicleType as 'auto' | 'taxi', registrationNumber: form.registrationNumber, area: form.area, monthlyRate: effectiveRate }
                : o,
            ),
          );
          setEditId(null);
        } else {
          setOwners((prev) => [{
            id: Date.now().toString(), name: form.name, phone: form.phone,
            vehicleType: form.vehicleType as 'auto' | 'taxi', registrationNumber: form.registrationNumber,
            area: form.area, monthlyRate: effectiveRate, status: 'pending',
            addedAt: new Date().toISOString().split('T')[0],
          }, ...prev]);
        }
        setSmsSuccess(`✅ SMS confirmation sent to +91 ${form.phone}`);
        setForm(emptyOwnerForm);
        setLoading(false);
        setTimeout(() => setSmsSuccess(''), 4000);
      }, 1200);
      return;
    }

    try {
      if (editId) {
        await updateOwnerProfile(editId, {
          name: form.name,
          phone: form.phone,
          vehicleType: form.vehicleType as 'auto' | 'taxi',
          registrationNumber: form.registrationNumber,
          operatingAreas: [form.area],
          monthlyRate: effectiveRate,
          updatedAt: new Date().toISOString(),
        });
        setOwners((prev) =>
          prev.map((o) =>
            o.id === editId
              ? { ...o, name: form.name, phone: form.phone, vehicleType: form.vehicleType as 'auto' | 'taxi', registrationNumber: form.registrationNumber, area: form.area, monthlyRate: effectiveRate }
              : o,
          ),
        );
        setEditId(null);
      } else {
        const ownerId = `owner_admin_${Date.now()}`;
        await createOwnerProfile({
          id: ownerId,
          userId: ownerId,
          name: form.name,
          phone: form.phone,
          vehicleType: form.vehicleType as 'auto' | 'taxi',
          registrationNumber: form.registrationNumber,
          operatingAreas: [form.area],
          vehiclePhotoUrl: '',
          rcDocumentUrl: '',
          insuranceDocumentUrl: '',
          monthlyRate: effectiveRate,
          upiId: '',
          verificationStatus: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setOwners((prev) => [{
          id: ownerId, name: form.name, phone: form.phone,
          vehicleType: form.vehicleType as 'auto' | 'taxi', registrationNumber: form.registrationNumber,
          area: form.area, monthlyRate: effectiveRate, status: 'pending',
          addedAt: new Date().toISOString().split('T')[0],
        }, ...prev]);
      }
      setSmsSuccess(`✅ SMS confirmation sent to +91 ${form.phone}`);
      setForm(emptyOwnerForm);
      setTimeout(() => setSmsSuccess(''), 4000);
    } catch (saveErr) {
      setError(saveErr instanceof Error ? saveErr.message : 'Failed to save owner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (o: OwnerEntry) => {
    setEditId(o.id);
    setForm({ name: o.name, phone: o.phone, vehicleType: o.vehicleType, registrationNumber: o.registrationNumber, area: o.area, monthlyRate: String(o.monthlyRate), priceOverride: '' });
    setError('');
  };

  return (
    <Box>
      {smsSuccess && <Alert icon={<MessageIcon />} severity="success" sx={{ mb: 2 }}>{smsSuccess}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, alignItems: 'start' }}>
        {/* Form */}
        <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <PersonAddIcon sx={{ color: BRAND }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{editId ? 'Edit Owner' : 'Add New Owner'}</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth name="name" label="Owner Name *" placeholder="Full name" value={form.name} onChange={handleChange} size="small" />
            <TextField fullWidth name="phone" label="Phone Number *" placeholder="10-digit mobile" value={form.phone} onChange={handleChange} size="small" inputProps={{ maxLength: 10 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Vehicle Type *</InputLabel>
                <Select name="vehicleType" value={form.vehicleType} label="Vehicle Type *"
                  onChange={(e) => setForm((p) => ({ ...p, vehicleType: e.target.value as 'auto' | 'taxi' | '' }))}>
                  <MenuItem value="auto">🛺 Auto Rickshaw</MenuItem>
                  <MenuItem value="taxi">🚕 Taxi / Cab</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Area *</InputLabel>
                <Select name="area" value={form.area} label="Area *"
                  onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}>
                  {AREAS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <TextField fullWidth name="registrationNumber" label="Registration Number *" placeholder="TN 01 AB 1234" value={form.registrationNumber} onChange={handleChange} size="small" />
            <TextField fullWidth name="monthlyRate" label="Monthly Rate (₹) *" value={form.monthlyRate} onChange={handleChange} size="small" type="number" />
            <Divider><Typography sx={{ fontSize: '0.7rem', color: '#6B5E54', px: 1 }}>Admin Price Override</Typography></Divider>
            <TextField fullWidth name="priceOverride" label="Override Rate (₹)" placeholder="Leave blank to use owner rate" value={form.priceOverride} onChange={handleChange} size="small" type="number" helperText="Set a different rate than owner's requested rate" />
            <Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}>
              {loading ? 'Saving...' : editId ? 'Update Owner' : 'Add Owner & Send SMS'}
            </Button>
            {editId && (
              <Button variant="outlined" fullWidth onClick={() => { setEditId(null); setForm(emptyOwnerForm); }}
                sx={{ borderColor: 'rgba(26,21,16,0.2)', color: '#6B5E54' }}>
                Cancel Edit
              </Button>
            )}
          </Box>
        </Card>

        {/* List */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Registered Owners ({owners.length})</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {(['active', 'pending', 'inactive'] as const).map((s) => (
                <Chip key={s} label={`${owners.filter((o) => o.status === s).length} ${s}`} size="small"
                  sx={{ background: ownerStatusConfig[s].bg, color: ownerStatusConfig[s].color, fontWeight: 600, fontSize: '0.7rem' }} />
              ))}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 520, overflowY: 'auto', pr: 0.5 }}>
            {owners.map((owner) => (
              <Card key={owner.id} sx={{ p: 2, border: `1px solid ${editId === owner.id ? BRAND : 'rgba(26,21,16,0.08)'}`, borderRadius: 2, transition: 'border-color 0.15s' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{owner.name}</Typography>
                      <Chip label={owner.status} size="small"
                        onClick={() => {
                          const newStatus: OwnerEntry['status'] = owner.status === 'active' ? 'inactive' : 'active';
                          const firestoreStatus = newStatus === 'active' ? 'verified' : 'rejected';
                          setOwners((prev) => prev.map((o) => o.id === owner.id ? { ...o, status: newStatus } : o));
                          if (firebaseReady) {
                            updateOwnerProfile(owner.id, { verificationStatus: firestoreStatus, updatedAt: new Date().toISOString() })
                              .catch(() => {
                                // Revert UI state on failure
                                setOwners((prev) => prev.map((o) => o.id === owner.id ? { ...o, status: owner.status } : o));
                              });
                          }
                        }}
                        sx={{ background: ownerStatusConfig[owner.status].bg, color: ownerStatusConfig[owner.status].color, fontWeight: 600, fontSize: '0.65rem', cursor: 'pointer' }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.78rem', color: '#6B5E54' }}>
                      📱 +91 {owner.phone} · {owner.vehicleType === 'auto' ? '🛺' : '🚕'} {owner.vehicleType.toUpperCase()} · {owner.registrationNumber}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#6B5E54', mt: 0.25 }}>
                      📍 {owner.area} · ₹{owner.monthlyRate.toLocaleString()}/mo
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                    <Tooltip title="Send SMS"><IconButton size="small" onClick={() => { setSmsSuccess(`📱 SMS sent to ${owner.name}`); setTimeout(() => setSmsSuccess(''), 3000); }} sx={{ color: '#6B5E54' }}><MessageIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(owner)} sx={{ color: BRAND }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => setOwners((p) => p.filter((o) => o.id !== owner.id))} sx={{ color: '#B83D0F' }}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(26,21,16,0.35)', mt: 0.75 }}>Added: {owner.addedAt}</Typography>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function CampaignsView({ campaigns, setCampaigns }: { campaigns: CampaignEntry[]; setCampaigns: React.Dispatch<React.SetStateAction<CampaignEntry[]>> }) {
  const updateStatus = (id: string, status: CampaignEntry['status']) => {
    const prev = campaigns.find((c) => c.id === id)?.status;
    setCampaigns((list) => list.map((c) => c.id === id ? { ...c, status } : c));
    if (firebaseReady) {
      updateCampaign(id, { status: adminStatusToFirestore(status), updatedAt: new Date().toISOString() })
        .catch(() => {
          // Revert UI state on failure
          if (prev) setCampaigns((list) => list.map((c) => c.id === id ? { ...c, status: prev } : c));
        });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 2, mb: 3 }}>
        {(['submitted', 'reviewing', 'approved', 'live', 'completed'] as const).map((s) => (
          <Card key={s} sx={{ p: 2, textAlign: 'center', border: '1px solid rgba(26,21,16,0.08)' }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: campaignStatusConfig[s].color }}>{campaigns.filter((c) => c.status === s).length}</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#6B5E54', mt: 0.5, textTransform: 'capitalize' }}>{s}</Typography>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {campaigns.map((c) => (
          <Card key={c.id} sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.name}</Typography>
                  <Chip label={campaignStatusConfig[c.status]?.label || c.status} size="small"
                    sx={{ background: campaignStatusConfig[c.status]?.bg, color: campaignStatusConfig[c.status]?.color, fontWeight: 600, fontSize: '0.65rem' }} />
                </Box>
                <Typography sx={{ fontSize: '0.78rem', color: '#6B5E54', mb: 0.25 }}>🏢 {c.advertiser} · 🎯 {c.objective}</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#6B5E54' }}>📅 {c.startDate} → {c.endDate} · 🚗 {c.vehicles} vehicles · 📍 {c.kmCovered.toLocaleString()} km</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A1510' }}>₹{c.budget.toLocaleString()}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {c.status === 'submitted' && (
                    <Button size="small" variant="contained" onClick={() => updateStatus(c.id, 'reviewing')} sx={{ fontSize: '0.72rem', py: 0.5 }}>Start Review</Button>
                  )}
                  {c.status === 'reviewing' && (
                    <>
                      <Button size="small" variant="contained" onClick={() => updateStatus(c.id, 'approved')} sx={{ fontSize: '0.72rem', py: 0.5 }}>Approve</Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => updateStatus(c.id, 'rejected')} sx={{ fontSize: '0.72rem', py: 0.5 }}>Reject</Button>
                    </>
                  )}
                  {c.status === 'approved' && (
                    <Button size="small" variant="contained" onClick={() => updateStatus(c.id, 'live')} sx={{ fontSize: '0.72rem', py: 0.5, background: '#27500A', '&:hover': { background: '#1A3D05' } }}>Go Live</Button>
                  )}
                  {c.status === 'live' && (
                    <Button size="small" variant="outlined" onClick={() => updateStatus(c.id, 'completed')} sx={{ fontSize: '0.72rem', py: 0.5 }}>Mark Complete</Button>
                  )}
                </Box>
              </Box>
            </Box>
            {(c.status === 'live' || c.status === 'approved') && c.kmCovered > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <LinearProgress variant="determinate" value={Math.min((c.kmCovered / 30000) * 100, 100)}
                  sx={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(26,21,16,0.08)', '& .MuiLinearProgress-bar': { backgroundColor: BRAND } }} />
                <Typography sx={{ fontSize: '0.68rem', color: '#6B5E54', mt: 0.5 }}>{c.kmCovered.toLocaleString()} km covered</Typography>
              </Box>
            )}
          </Card>
        ))}
      </Box>
    </Box>
  );
}

function AnalyticsView({ campaigns }: { campaigns: CampaignEntry[] }) {
  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Revenue Trend (6 months)</Typography>
          <Bar data={revenueBarData} options={chartOpts} />
        </Card>
        <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Weekly Km Activity</Typography>
          <Line data={weeklyKmData} options={chartOpts} />
        </Card>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2.5, mb: 3 }}>
        <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)', textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Fleet Mix</Typography>
          <Box sx={{ maxWidth: 160, mx: 'auto' }}>
            <Doughnut data={fleetDonutData} options={{ responsive: true, plugins: { legend: { display: true, position: 'bottom' } } }} />
          </Box>
        </Card>

        <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)', gridColumn: { xs: '1', md: 'span 2' } }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Campaign Performance</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {campaigns.filter((c) => c.kmCovered > 0).map((c) => (
              <Box key={c.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{c.name}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54' }}>{c.kmCovered.toLocaleString()} km</Typography>
                </Box>
                <LinearProgress variant="determinate" value={Math.min((c.kmCovered / 30000) * 100, 100)}
                  sx={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(26,21,16,0.08)', '& .MuiLinearProgress-bar': { backgroundColor: BRAND } }} />
              </Box>
            ))}
          </Box>
        </Card>
      </Box>

      <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
        <Typography sx={{ fontWeight: 700, mb: 2 }}>Campaign Budget Summary</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
          {[
            { label: 'Total Booked', value: `₹${(campaigns.reduce((s, c) => s + c.budget, 0) / 1000).toFixed(0)}K` },
            { label: 'From Live Campaigns', value: `₹${(campaigns.filter((c) => c.status === 'live').reduce((s, c) => s + c.budget, 0) / 1000).toFixed(0)}K` },
            { label: 'Pending Approval', value: String(campaigns.filter((c) => c.status === 'submitted' || c.status === 'reviewing').length) },
            { label: 'Km Covered (All)', value: `${(campaigns.reduce((s, c) => s + c.kmCovered, 0) / 1000).toFixed(1)}K` },
          ].map((item) => (
            <Box key={item.label} sx={{ background: '#F5F2EF', p: 2, borderRadius: 2 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54', mb: 0.5 }}>{item.label}</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#1A1510' }}>{item.value}</Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}

// ─── Sidebar Item ─────────────────────────────────────────────────────────────

function SidebarItem({
  icon, label, active, onClick, badge,
}: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 2, py: 1.25, borderRadius: 2, cursor: 'pointer',
        background: active ? '#FDF0EB' : 'transparent',
        color: active ? BRAND : '#6B5E54',
        transition: 'all 0.15s',
        '&:hover': { background: active ? '#FDF0EB' : 'rgba(26,21,16,0.04)', color: active ? BRAND : '#1A1510' },
        fontWeight: active ? 700 : 400,
        position: 'relative',
      }}
    >
      <Box sx={{ fontSize: 20, display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 'inherit', color: 'inherit' }}>{label}</Typography>
      {badge !== undefined && badge > 0 && (
        <Box sx={{ ml: 'auto', background: BRAND, color: '#fff', borderRadius: 10, fontSize: '0.65rem', fontWeight: 700, px: 0.75, py: 0.2, minWidth: 20, textAlign: 'center' }}>
          {badge}
        </Box>
      )}
    </Box>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [view, setView] = useState<AdminView>('overview');
  const [owners, setOwners] = useState<OwnerEntry[]>(MOCK_OWNERS);
  const [campaigns, setCampaigns] = useState<CampaignEntry[]>(MOCK_CAMPAIGNS);

  // Load real data from Firestore on mount
  useEffect(() => {
    if (!firebaseReady) return;
    Promise.all([getAllOwners(), getAllCampaigns()])
      .then(([firestoreOwners, firestoreCampaigns]) => {
        if (firestoreOwners.length > 0) {
          setOwners(firestoreOwners.map(ownerProfileToEntry));
        }
        if (firestoreCampaigns.length > 0) {
          setCampaigns(firestoreCampaigns.map(firestoreToCampaignEntry));
        }
      })
      .catch(() => {
        // Fall back to mock data on error
      });
  }, []);

  const pendingOwners = owners.filter((o) => o.status === 'pending').length;
  const pendingCampaigns = campaigns.filter((c) => c.status === 'submitted' || c.status === 'reviewing').length;

  const NAV_ITEMS: { id: AdminView; icon: React.ReactNode; label: string; badge?: number }[] = [
    { id: 'overview',   icon: <DashboardIcon fontSize="inherit" />, label: 'Overview' },
    { id: 'owners',     icon: <PeopleIcon    fontSize="inherit" />, label: 'Owners',    badge: pendingOwners },
    { id: 'campaigns',  icon: <CampaignIcon  fontSize="inherit" />, label: 'Campaigns', badge: pendingCampaigns },
    { id: 'analytics',  icon: <BarChartIcon  fontSize="inherit" />, label: 'Analytics' },
  ];

  const viewTitle: Record<AdminView, string> = {
    overview:  'Dashboard Overview',
    owners:    'Owner Management',
    campaigns: 'Campaign Management',
    analytics: 'Analytics & Reports',
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: '#F5F2EF' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: { xs: 0, md: 220 },
          flexShrink: 0,
          background: '#fff',
          borderRight: '1px solid rgba(26,21,16,0.08)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          p: 2,
          pt: 3,
        }}
      >
        {/* Logo */}
        <Box sx={{ px: 2, mb: 3 }}>
          <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: '1.2rem' }}>
            Ad<span style={{ color: BRAND }}>Ride</span>
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: '#6B5E54', mt: 0.25 }}>Admin Console</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={view === item.id}
              onClick={() => setView(item.id)}
              badge={item.badge}
            />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Box sx={{ px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '50%', background: '#FDF0EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: BRAND }}>A</Box>
            <Box>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>Admin</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#6B5E54' }}>admin@adride.in</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 3 } }}>
        {/* Mobile Tab Nav */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, mb: 3, overflowX: 'auto', pb: 1 }}>
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.id}
              size="small"
              variant={view === item.id ? 'contained' : 'outlined'}
              onClick={() => setView(item.id)}
              startIcon={item.icon}
              sx={{
                whiteSpace: 'nowrap', fontSize: '0.75rem',
                ...(view !== item.id && { borderColor: 'rgba(26,21,16,0.2)', color: '#6B5E54' }),
              }}
            >
              {item.label}{item.badge ? ` (${item.badge})` : ''}
            </Button>
          ))}
        </Box>

        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{viewTitle[view]}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
            <Chip icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />} label={`${owners.filter((o) => o.status === 'active').length} active owners`} size="small" sx={{ background: '#EAF3DE', color: '#27500A', fontWeight: 600, fontSize: '0.7rem' }} />
            <Chip icon={<PendingIcon    sx={{ fontSize: '14px !important' }} />} label={`${pendingOwners} pending`} size="small" sx={{ background: '#FAEEDA', color: '#633806', fontWeight: 600, fontSize: '0.7rem' }} />
            <Chip icon={<BlockIcon      sx={{ fontSize: '14px !important' }} />} label={`${owners.filter((o) => o.status === 'inactive').length} inactive`} size="small" sx={{ background: 'rgba(26,21,16,0.06)', color: '#6B5E54', fontWeight: 600, fontSize: '0.7rem' }} />
            <Chip icon={<DirectionsCarIcon sx={{ fontSize: '14px !important' }} />} label={`${campaigns.filter((c) => c.status === 'live').length} live campaigns`} size="small" sx={{ background: '#D8F0C0', color: '#1A4D00', fontWeight: 600, fontSize: '0.7rem' }} />
          </Box>
        </Box>

        {/* View Content */}
        {view === 'overview'  && <OverviewView   owners={owners} campaigns={campaigns} />}
        {view === 'owners'    && <OwnersView     owners={owners} setOwners={setOwners} />}
        {view === 'campaigns' && <CampaignsView  campaigns={campaigns} setCampaigns={setCampaigns} />}
        {view === 'analytics' && <AnalyticsView  campaigns={campaigns} />}
      </Box>
    </Box>
  );
}
