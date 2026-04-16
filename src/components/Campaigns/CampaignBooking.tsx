import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  LinearProgress,
  FormControlLabel,
  Switch,
  Divider,
  Radio,
  RadioGroup,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedIcon from '@mui/icons-material/Verified';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Vehicle, UNAVAILABLE_ASSIGNMENT_STATUSES } from '../../types';
import { firebaseReady } from '../../config/firebase';
import { getOwnersByStatus, createCampaign } from '../../services/firebase/firestore';
import { uploadCampaignArtwork } from '../../services/firebase/storage';
import { useAuthContext } from '../../context/AuthContext';

const BRAND = '#E8521A';

/** Admin artwork submission email — loaded from settings in production */
const ADMIN_ARTWORK_EMAIL = 'artwork@oohads.in';

/** Platform fee charged by admin (fixed) */
const PLATFORM_FEE = 100;
/** Printing cost charged when advertiser opts in */
const PRINTING_COST = 500;

const CITIES = ['Chennai', 'Bangalore', 'Hyderabad', 'Coimbatore'];

const CITY_AREAS: Record<string, string[]> = {
  Chennai: ['T. Nagar', 'Velachery', 'Anna Nagar', 'Adyar', 'Porur', 'Mylapore', 'Tambaram', 'Perambur'],
  Bangalore: ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Jayanagar'],
  Hyderabad: ['Banjara Hills', 'Jubilee Hills', 'Madhapur', 'Hitech City', 'Kukatpally'],
  Coimbatore: ['RS Puram', 'Gandhipuram', 'Saibaba Colony', 'Peelamedu'],
};

const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', registrationNumber: 'TN01AB1234', type: 'auto', city: 'Chennai', area: 'T. Nagar', ownerName: 'Rajan Kumar', ownerUpiId: 'rajan@upi', monthlyRate: 2800, kmPerDay: 80, expectedMonthlyKm: 2400, status: 'available', assignmentStatus: 'none', vehiclePhotoUrl: '' },
  { id: 'v2', registrationNumber: 'TN01CD5678', type: 'taxi', city: 'Chennai', area: 'Velachery', ownerName: 'Priya Selvam', ownerUpiId: 'priya@upi', monthlyRate: 3200, kmPerDay: 120, expectedMonthlyKm: 3600, status: 'booked', assignmentStatus: 'active', vehiclePhotoUrl: '' },
  { id: 'v3', registrationNumber: 'TN01EF9012', type: 'auto', city: 'Chennai', area: 'Anna Nagar', ownerName: 'Murugan P', ownerUpiId: 'murugan@upi', monthlyRate: 2500, kmPerDay: 75, expectedMonthlyKm: 2250, status: 'available', assignmentStatus: 'none', vehiclePhotoUrl: '' },
  { id: 'v4', registrationNumber: 'TN01GH3456', type: 'taxi', city: 'Chennai', area: 'Adyar', ownerName: 'Sundar Raj', ownerUpiId: 'sundar@upi', monthlyRate: 3500, kmPerDay: 140, expectedMonthlyKm: 4200, status: 'booked', assignmentStatus: 'reserved', vehiclePhotoUrl: '' },
  { id: 'v5', registrationNumber: 'TN01IJ7890', type: 'auto', city: 'Chennai', area: 'T. Nagar', ownerName: 'Kavitha M', ownerUpiId: 'kavitha@upi', monthlyRate: 2600, kmPerDay: 70, expectedMonthlyKm: 2100, status: 'available', assignmentStatus: 'none', vehiclePhotoUrl: '' },
  { id: 'v6', registrationNumber: 'TN01KL2345', type: 'taxi', city: 'Chennai', area: 'Porur', ownerName: 'Babu S', ownerUpiId: 'babu@upi', monthlyRate: 3000, kmPerDay: 110, expectedMonthlyKm: 3300, status: 'available', assignmentStatus: 'none', vehiclePhotoUrl: '' },
  { id: 'v7', registrationNumber: 'TN01MN6789', type: 'auto', city: 'Chennai', area: 'Mylapore', ownerName: 'Deepa R', ownerUpiId: 'deepa@upi', monthlyRate: 2700, kmPerDay: 78, status: 'available', assignmentStatus: 'none', vehiclePhotoUrl: '' },
];
const OBJECTIVES = ['Brand Awareness', 'Product Launch', 'Event Promotion', 'App Install', 'Store Traffic'];

/** 5 booking steps; status/confirmation is shown at step === STEPS.length */
const STEPS = ['Location', 'Select Vehicles', 'Campaign Details', 'Artwork', 'Review & Submit'];

interface LocationPreference {
  city: string;
  area: string;
  allowNearbyAreas: boolean;
}

interface CampaignDetails {
  campaignName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  objective: string;
}

const StatusTimeline = ({ status }: { status: 'submitted' | 'reviewing' | 'approved' | 'live' }) => {
  const timeline = [
    { key: 'submitted', label: 'Submitted', icon: '📤', done: true },
    { key: 'reviewing', label: 'Under Review', icon: '🔍', done: status !== 'submitted' },
    { key: 'approved', label: 'Approved', icon: '✅', done: status === 'approved' || status === 'live' },
    { key: 'live', label: 'Campaign Live', icon: '🚀', done: status === 'live' },
  ];

  return (
    <Box sx={{ position: 'relative', mt: 2 }}>
      {timeline.map((item, i) => (
        <Box key={item.key} sx={{ display: 'flex', alignItems: 'flex-start', mb: 3, position: 'relative' }}>
          {i < timeline.length - 1 && (
            <Box
              sx={{
                position: 'absolute', left: 16, top: 32, width: 2, height: 32,
                background: item.done ? BRAND : 'rgba(26,21,16,0.12)',
              }}
            />
          )}
          <Box
            sx={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: item.done ? BRAND : '#F5F2EF',
              border: `2px solid ${item.done ? BRAND : 'rgba(26,21,16,0.15)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', mr: 2,
            }}
          >
            {item.done ? <VerifiedIcon sx={{ fontSize: 16, color: '#fff' }} /> : <span style={{ fontSize: '0.875rem' }}>{item.icon}</span>}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: item.done ? 700 : 400, fontSize: '0.875rem', color: item.done ? '#1A1510' : '#6B5E54' }}>
              {item.label}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54' }}>
              {item.key === 'submitted' ? 'Campaign submitted for review' :
               item.key === 'reviewing' ? 'Owner or admin reviewing your campaign details' :
               item.key === 'approved' ? 'Campaign approved — payment required to activate' : 'Ads now running on vehicles'}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// ── UPI Payment Card ───────────────────────────────────────────────────────────

interface UpiPaymentCardProps {
  title: string;
  recipientName: string;
  upiId: string;
  amount: number;
  paymentIndex: number;
  proofFile: File | null;
  utr: string;
  onProofChange: (file: File | null) => void;
  onUtrChange: (value: string) => void;
  onSubmit: () => void;
  submitted: boolean;
}

function UpiPaymentCard({
  title, recipientName, upiId, amount, paymentIndex,
  proofFile, utr, onProofChange, onUtrChange, onSubmit, submitted,
}: UpiPaymentCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <Card sx={{ p: 2.5, border: `2px solid ${submitted ? '#27500A' : 'rgba(26,21,16,0.12)'}`, borderRadius: 2, background: submitted ? '#F0FAF0' : '#FFFFFF' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', flex: 1 }}>Payment {paymentIndex}: {title}</Typography>
        {submitted && <CheckCircleIcon sx={{ color: '#27500A', fontSize: 20 }} />}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54' }}>Pay to</Typography>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{recipientName}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54' }}>UPI ID</Typography>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace', background: '#F5F2EF', px: 1, py: 0.3, borderRadius: 1 }}>{upiId}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>Amount</Typography>
        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: BRAND }}>&#8377;{amount.toLocaleString()}</Typography>
      </Box>
      {!submitted && (
        <>
          <Divider sx={{ mb: 2 }} />
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#6B5E54', mb: 1 }}>After payment, upload proof below:</Typography>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,application/pdf" style={{ display: 'none' }} onChange={(e) => onProofChange(e.target.files?.[0] ?? null)} />
          <Box onClick={() => fileInputRef.current?.click()} sx={{ border: `2px dashed ${proofFile ? BRAND : 'rgba(26,21,16,0.2)'}`, borderRadius: 2, p: 2, textAlign: 'center', cursor: 'pointer', background: proofFile ? '#FDF0EB' : '#FAFAFA', mb: 1.5, '&:hover': { borderColor: BRAND } }}>
            <CloudUploadIcon sx={{ fontSize: 28, color: proofFile ? BRAND : '#6B5E54', mb: 0.5 }} />
            <Typography sx={{ fontSize: '0.75rem', color: proofFile ? BRAND : '#6B5E54', fontWeight: proofFile ? 600 : 400 }}>{proofFile ? proofFile.name : 'Upload payment screenshot'}</Typography>
          </Box>
          <TextField fullWidth size="small" label="UTR / Transaction Reference" placeholder="e.g. 123456789012" value={utr} onChange={(e) => onUtrChange(e.target.value)} sx={{ mb: 1.5 }} />
          <Button variant="contained" fullWidth disabled={!proofFile || !utr.trim()} onClick={onSubmit} sx={{ background: BRAND, '&:hover': { background: '#B83D0F' } }}>Submit Payment Proof</Button>
        </>
      )}
      {submitted && <Alert severity="success" sx={{ mt: 1, fontSize: '0.78rem' }}>Payment proof submitted. Awaiting verification.</Alert>}
    </Card>
  );
}

// ── Vehicle list sub-component ─────────────────────────────────────────────────

interface VehicleListProps {
  vehicles: Vehicle[];
  selectedVehicleIds: string[];
  onToggle: (id: string) => void;
  onPhotoClick: (url: string) => void;
}

function VehicleList({ vehicles, selectedVehicleIds, onToggle, onPhotoClick }: VehicleListProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {vehicles.map((vehicle) => {
        const isSelected = selectedVehicleIds.includes(vehicle.id);
        return (
          <Box key={vehicle.id} onClick={() => onToggle(vehicle.id)} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: `2px solid ${isSelected ? BRAND : 'rgba(26,21,16,0.1)'}`, borderRadius: 2, cursor: 'pointer', background: isSelected ? '#FDF0EB' : '#FFFFFF', transition: 'all 0.15s', '&:hover': { borderColor: BRAND } }}>
            <Checkbox checked={isSelected} sx={{ color: BRAND, '&.Mui-checked': { color: BRAND }, p: 0 }} />
            {vehicle.vehiclePhotoUrl ? (
              <Box component="img" src={vehicle.vehiclePhotoUrl} alt="Vehicle" loading="lazy" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onPhotoClick(vehicle.vehiclePhotoUrl!); }} sx={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 1, cursor: 'zoom-in', flexShrink: 0, border: '1px solid rgba(26,21,16,0.1)' }} />
            ) : (
              <Box sx={{ width: 70, height: 70, background: '#F5F2EF', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(26,21,16,0.08)' }}>
                <DirectionsCarIcon sx={{ color: '#C0B4A8', fontSize: 32 }} />
              </Box>
            )}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{vehicle.registrationNumber}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54' }}>{vehicle.type.toUpperCase()} &middot; {vehicle.ownerName} &middot; {vehicle.area}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 700, color: BRAND, fontSize: '0.9rem' }}>&#8377;{vehicle.monthlyRate.toLocaleString()}</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#6B5E54' }}>/month</Typography>
              {vehicle.expectedMonthlyKm !== undefined ? (
                <Typography sx={{ fontSize: '0.7rem', color: '#6B5E54' }}>~{(vehicle.expectedMonthlyKm / 1000).toFixed(1)}K km/mo</Typography>
              ) : (
                <Typography sx={{ fontSize: '0.7rem', color: '#aaa' }}>km: pending</Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default function CampaignBooking() {
  const { firebaseUser } = useAuthContext();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 0: Location preference
  const [locationPref, setLocationPref] = useState<LocationPreference>({ city: '', area: '', allowNearbyAreas: true });

  // Step 1: Vehicle selection
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [photoModal, setPhotoModal] = useState<string | null>(null);

  // Step 2: Campaign details
  const [campaignDetails, setCampaignDetails] = useState<CampaignDetails>({
    campaignName: '',
    startDate: '',
    endDate: '',
    durationDays: 30,
    objective: '',
  });

  // Step 3: Artwork
  const [artworkFileName, setArtworkFileName] = useState('');
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [needsPrintingHelp, setNeedsPrintingHelp] = useState(false);
  const artworkInputRef = useRef<HTMLInputElement>(null);

  // Post-approval: payment plan & UPI proofs
  const [paymentPlan, setPaymentPlan] = useState<'month_on_month' | 'full_period' | ''>('');
  const [showPaymentUI, setShowPaymentUI] = useState(false);
  const [ownerProofFile, setOwnerProofFile] = useState<File | null>(null);
  const [ownerUtr, setOwnerUtr] = useState('');
  const [ownerPaymentSubmitted, setOwnerPaymentSubmitted] = useState(false);
  const [adminProofFile, setAdminProofFile] = useState<File | null>(null);
  const [adminUtr, setAdminUtr] = useState('');
  const [adminPaymentSubmitted, setAdminPaymentSubmitted] = useState(false);

  // Fetch verified owners from Firestore on mount
  useEffect(() => {
    if (!firebaseReady) return;
    setVehiclesLoading(true);
    getOwnersByStatus('verified')
      .then((owners) => {
        if (owners.length > 0) {
          const vehicles: Vehicle[] = owners.map((o) => ({
            id: o.id,
            registrationNumber: o.registrationNumber,
            type: o.vehicleType,
            city: 'Chennai', // default until city is added to owner profile
            area: o.operatingAreas[0] ?? '',
            ownerName: o.name,
            ownerUpiId: o.upiId,
            monthlyRate: o.monthlyRate,
            kmPerDay: 80,
            status: 'available' as const,
            assignmentStatus: 'none' as const,
            vehiclePhotoUrl: o.vehiclePhotoUrl || '',
          }));
          setAllVehicles(vehicles);
        }
      })
      .catch(() => {
        // Fall back to mock data on error
      })
      .finally(() => setVehiclesLoading(false));
  }, []);

  // ── Vehicle filtering ──────────────────────────────────────────────────────

  /** Available vehicles: those whose assignmentStatus does NOT block booking */
  const availableVehicles = useMemo(
    () => allVehicles.filter((v) => !UNAVAILABLE_ASSIGNMENT_STATUSES.includes(v.assignmentStatus ?? 'none')),
    [allVehicles]
  );

  /** Vehicles in the preferred city + preferred area (if area specified) */
  const preferredAreaVehicles = useMemo(() => {
    if (!locationPref.city) return availableVehicles;
    const cityMatch = availableVehicles.filter((v) => v.city === locationPref.city);
    if (!locationPref.area) return cityMatch;
    return cityMatch.filter((v) => v.area === locationPref.area);
  }, [availableVehicles, locationPref.city, locationPref.area]);

  /** Vehicles in the same city but other areas (fallback / nearby) */
  const nearbyAreaVehicles = useMemo(() => {
    if (!locationPref.city || !locationPref.area || !locationPref.allowNearbyAreas) return [];
    return availableVehicles.filter((v) => v.city === locationPref.city && v.area !== locationPref.area);
  }, [availableVehicles, locationPref]);

  const selectedVehicles = allVehicles.filter((v) => selectedVehicleIds.includes(v.id));
  const totalMonthlyCost = selectedVehicles.reduce((sum, v) => sum + v.monthlyRate, 0);
  const costForDuration = Math.round(totalMonthlyCost * (campaignDetails.durationDays / 30));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const estimatedMonthlyKm = useMemo(() => selectedVehicles.reduce((sum, v) => sum + (v.expectedMonthlyKm ?? v.kmPerDay * 30), 0), [selectedVehicleIds, allVehicles]);
  const hasKmEstimate = selectedVehicles.some((v) => v.expectedMonthlyKm !== undefined);

  const adminFee = PLATFORM_FEE + (needsPrintingHelp ? PRINTING_COST : 0);
  const ownerRentalForDuration = costForDuration;

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCampaignDetails((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const toggleVehicle = (id: string) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const validateStep = () => {
    if (step === 0 && !locationPref.city) return 'Please select a city';
    if (step === 1 && selectedVehicleIds.length === 0) return 'Select at least one vehicle';
    if (step === 2) {
      if (!campaignDetails.campaignName.trim()) return 'Campaign name is required';
      if (!campaignDetails.startDate) return 'Start date is required';
      if (!campaignDetails.objective) return 'Please select an objective';
    }
    return '';
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    if (!firebaseReady) {
      setTimeout(() => { setLoading(false); setStep(STEPS.length); }, 1500);
      return;
    }

    try {
      const campaignId = `campaign_${Date.now()}`;
      const advertiserId = firebaseUser?.uid ?? 'anonymous';

      let artworkUrl = '';
      if (artworkFile) {
        const result = await uploadCampaignArtwork(campaignId, artworkFile);
        artworkUrl = result.downloadUrl;
      }

      await createCampaign({
        id: campaignId,
        advertiserId,
        campaignName: campaignDetails.campaignName,
        startDate: campaignDetails.startDate,
        endDate: campaignDetails.endDate,
        durationDays: campaignDetails.durationDays,
        objective: campaignDetails.objective,
        status: 'submitted_for_review',
        selectedVehicleIds,
        artworkUrl,
        totalCost: costForDuration,
        approvals: [],
        locationPreference: locationPref,
        needsPrintingHelp,
        printingCost: needsPrintingHelp ? PRINTING_COST : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setLoading(false);
      setStep(STEPS.length);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to submit campaign. Please try again.');
    }
  };

  const TOTAL_STEPS = STEPS.length;
  const isStatusScreen = step === TOTAL_STEPS;

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', background: '#F5F2EF', p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Book a Campaign</Typography>
          {!isStatusScreen && (
            <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem' }}>
              Step {step + 1} of {TOTAL_STEPS}: {STEPS[step]}
            </Typography>
          )}
        </Box>

        {!isStatusScreen && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress variant="determinate" value={(step / (TOTAL_STEPS - 1)) * 100} sx={{ height: 6, borderRadius: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              {STEPS.map((label, i) => (
                <Typography key={i} sx={{ fontSize: '0.65rem', color: i <= step ? BRAND : '#6B5E54', fontWeight: i === step ? 700 : 400 }}>
                  {label}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: !isStatusScreen ? '1fr 320px' : '1fr' }, gap: 3, alignItems: 'start' }}>
          {/* Main Content */}
          <Box>
            {/* Step 0: Location Preference */}
            {step === 0 && (
              <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocationOnIcon sx={{ color: BRAND }} />
                  <Typography sx={{ fontWeight: 700 }}>Where do you want vehicles?</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.85rem', color: '#6B5E54', mb: 3 }}>
                  Tell us your preferred location so we can show you the most relevant vehicles.
                  This also helps us track demand and expand our fleet in your area.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>City *</InputLabel>
                    <Select value={locationPref.city} label="City *" onChange={(e) => setLocationPref((prev) => ({ ...prev, city: e.target.value, area: '' }))}>
                      {CITIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                  {locationPref.city && (
                    <FormControl fullWidth size="small">
                      <InputLabel>Preferred Area (optional)</InputLabel>
                      <Select value={locationPref.area} label="Preferred Area (optional)" onChange={(e) => setLocationPref((prev) => ({ ...prev, area: e.target.value }))}>
                        <MenuItem value="">Any area in {locationPref.city}</MenuItem>
                        {(CITY_AREAS[locationPref.city] ?? []).map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )}
                  {locationPref.area && (
                    <FormControlLabel
                      control={<Switch checked={locationPref.allowNearbyAreas} onChange={(e) => setLocationPref((prev) => ({ ...prev, allowNearbyAreas: e.target.checked }))} />}
                      label={<Typography sx={{ fontSize: '0.875rem' }}>Also show vehicles from nearby areas in {locationPref.city}</Typography>}
                    />
                  )}
                </Box>
                {locationPref.city && (
                  <Alert severity="info" icon={<InfoOutlinedIcon fontSize="small" />} sx={{ mt: 2, fontSize: '0.8rem' }}>
                    We&apos;ll show you available vehicles in{' '}
                    <strong>{locationPref.area ? `${locationPref.area}, ` : ''}{locationPref.city}</strong>.
                    {' '}If none are available, we&apos;ll suggest alternatives nearby.
                  </Alert>
                )}
              </Card>
            )}

            {/* Step 1: Select Vehicles */}
            {step === 1 && (
              <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>Available Vehicles</Typography>
                    {locationPref.city && (
                      <Typography sx={{ fontSize: '0.78rem', color: '#6B5E54' }}>
                        <LocationOnIcon sx={{ fontSize: 13, verticalAlign: 'middle', mr: 0.3 }} />
                        {locationPref.area ? `${locationPref.area}, ` : ''}{locationPref.city}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {vehiclesLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={32} sx={{ color: BRAND }} />
                  </Box>
                ) : (
                  <>
                    {preferredAreaVehicles.length > 0 ? (
                      <VehicleList vehicles={preferredAreaVehicles} selectedVehicleIds={selectedVehicleIds} onToggle={toggleVehicle} onPhotoClick={(url) => setPhotoModal(url)} />
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4, px: 2, background: '#FDF8F5', borderRadius: 2, border: '1px dashed rgba(232,82,26,0.3)', mb: nearbyAreaVehicles.length > 0 ? 3 : 0 }}>
                        <Typography sx={{ fontSize: '2rem', mb: 1 }}>&#128683;</Typography>
                        <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                          No vehicles available in {locationPref.area || locationPref.city} right now
                        </Typography>
                        <Typography sx={{ fontSize: '0.82rem', color: '#6B5E54', maxWidth: 420, mx: 'auto' }}>
                          All vehicles in this area are currently on active campaigns.
                          {locationPref.allowNearbyAreas && nearbyAreaVehicles.length > 0
                            ? ' Check out vehicles from nearby areas below — they cover similar routes.'
                            : ' You can enable "show nearby areas" to see alternatives, or check back soon.'}
                        </Typography>
                      </Box>
                    )}

                    {nearbyAreaVehicles.length > 0 && preferredAreaVehicles.length === 0 && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, mt: 1 }}>
                          <Chip label="Nearby areas" size="small" sx={{ background: '#FDF0EB', color: BRAND, fontWeight: 700, fontSize: '0.72rem' }} />
                          <Typography sx={{ fontSize: '0.78rem', color: '#6B5E54' }}>Other areas in {locationPref.city}</Typography>
                        </Box>
                        <VehicleList vehicles={nearbyAreaVehicles} selectedVehicleIds={selectedVehicleIds} onToggle={toggleVehicle} onPhotoClick={(url) => setPhotoModal(url)} />
                      </>
                    )}

                    {nearbyAreaVehicles.length > 0 && preferredAreaVehicles.length > 0 && (
                      <>
                        <Box sx={{ my: 2 }}>
                          <Divider><Chip label="Also nearby" size="small" sx={{ background: '#F5F2EF', fontSize: '0.72rem' }} /></Divider>
                        </Box>
                        <VehicleList vehicles={nearbyAreaVehicles} selectedVehicleIds={selectedVehicleIds} onToggle={toggleVehicle} onPhotoClick={(url) => setPhotoModal(url)} />
                      </>
                    )}
                  </>
                )}

                {selectedVehicleIds.length > 0 && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {selectedVehicleIds.length} vehicle{selectedVehicleIds.length > 1 ? 's' : ''} selected
                  </Alert>
                )}
              </Card>
            )}

            {/* Step 2: Campaign Details */}
            {step === 2 && (
              <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
                <Typography sx={{ fontWeight: 700, mb: 2 }}>Campaign Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth name="campaignName" label="Campaign Name *" placeholder="e.g. Diwali Sale 2024" value={campaignDetails.campaignName} onChange={handleDetailsChange} size="small" />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField fullWidth name="startDate" label="Start Date *" type="date" value={campaignDetails.startDate} onChange={handleDetailsChange} size="small" InputLabelProps={{ shrink: true }} />
                    <TextField fullWidth name="endDate" label="End Date" type="date" value={campaignDetails.endDate} onChange={handleDetailsChange} size="small" InputLabelProps={{ shrink: true }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B5E54' }}>Campaign Duration</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: BRAND }}>{campaignDetails.durationDays} days</Typography>
                    </Box>
                    <Slider value={campaignDetails.durationDays} onChange={(_, value) => setCampaignDetails((prev) => ({ ...prev, durationDays: value as number }))} min={7} max={90} step={1} marks={[{ value: 7, label: '7d' }, { value: 30, label: '30d' }, { value: 60, label: '60d' }, { value: 90, label: '90d' }]} sx={{ color: BRAND, '& .MuiSlider-markLabel': { fontSize: '0.7rem' } }} />
                  </Box>
                  <FormControl fullWidth size="small">
                    <InputLabel>Campaign Objective *</InputLabel>
                    <Select value={campaignDetails.objective} label="Campaign Objective *" onChange={(e) => setCampaignDetails((prev) => ({ ...prev, objective: e.target.value }))}>
                      {OBJECTIVES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
              </Card>
            )}

            {/* Step 3: Artwork */}
            {step === 3 && (
              <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Campaign Artwork</Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#6B5E54', mb: 2 }}>
                  Upload your final artwork so the vehicle owner and our team can review it before approval.
                </Typography>

                {/* Printing help option */}
                <Box sx={{ background: needsPrintingHelp ? '#FDF0EB' : '#F5F2EF', border: `1px solid ${needsPrintingHelp ? BRAND : 'rgba(26,21,16,0.1)'}`, borderRadius: 2, p: 2, mb: 2 }}>
                  <FormControlLabel
                    control={<Checkbox checked={needsPrintingHelp} onChange={(e) => setNeedsPrintingHelp(e.target.checked)} sx={{ color: BRAND, '&.Mui-checked': { color: BRAND } }} />}
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          I need help with printing{' '}
                          <Chip label={`+\u20B9${PRINTING_COST}`} size="small" sx={{ background: BRAND, color: '#fff', fontSize: '0.7rem', ml: 0.5 }} />
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54', mt: 0.3 }}>We&apos;ll take care of printing and applying the artwork on the vehicle.</Typography>
                      </Box>
                    }
                  />
                </Box>

                <input ref={artworkInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if (file) { setArtworkFile(file); setArtworkFileName(file.name); } }} />
                <Box onClick={() => artworkInputRef.current?.click()} sx={{ border: `3px dashed ${artworkFileName ? BRAND : 'rgba(26,21,16,0.2)'}`, borderRadius: 3, p: 5, textAlign: 'center', cursor: 'pointer', background: artworkFileName ? '#FDF0EB' : '#FAFAFA', transition: 'all 0.15s', '&:hover': { borderColor: BRAND, background: '#FDF0EB' }, mb: 2 }}>
                  {artworkFileName ? <CheckCircleIcon sx={{ fontSize: 48, color: '#27500A', mb: 1 }} /> : <CloudUploadIcon sx={{ fontSize: 48, color: '#6B5E54', mb: 1 }} />}
                  <Typography sx={{ fontWeight: 600, color: artworkFileName ? '#27500A' : '#1A1510', mb: 0.5 }}>{artworkFileName || 'Click to upload artwork'}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54' }}>{artworkFileName ? 'File ready for upload' : 'JPG, PNG, PDF \u00b7 Max 10MB \u00b7 Recommended: 1200\u00d7400px'}</Typography>
                </Box>

                <Alert severity="info" icon={false} sx={{ mb: 2, fontSize: '0.8rem' }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', mb: 0.3 }}>Prefer to email your artwork?</Typography>
                  Send to <strong><a href={`mailto:${ADMIN_ARTWORK_EMAIL}`} style={{ color: BRAND }}>{ADMIN_ARTWORK_EMAIL}</a></strong> with your campaign name in the subject line.
                </Alert>

                <Box sx={{ background: '#FDF0EB', borderRadius: 2, p: 2 }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: BRAND, mb: 1 }}>Design Guidelines</Typography>
                  {['Use high contrast colors visible from 5\u201310 meters', 'Keep text minimal \u2014 max 5\u20137 words', 'Include your brand logo prominently', 'Avoid white backgrounds (shows dirt quickly)'].map((tip, i) => (
                    <Typography key={i} sx={{ fontSize: '0.75rem', color: '#6B5E54', mb: 0.5 }}>\u2022 {tip}</Typography>
                  ))}
                </Box>
              </Card>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
                <Typography sx={{ fontWeight: 700, mb: 2.5 }}>Review Campaign</Typography>
                {[
                  { title: 'Location Preference', items: [{ label: 'City', value: locationPref.city || '\u2014' }, { label: 'Area', value: locationPref.area || 'Any area' }, { label: 'Nearby areas', value: locationPref.allowNearbyAreas ? 'Allowed' : 'Not allowed' }] },
                  { title: 'Selected Vehicles', items: selectedVehicles.map((v) => ({ label: v.registrationNumber, value: `${v.area} \u00b7 \u20B9${v.monthlyRate}/mo` })) },
                  { title: 'Campaign Details', items: [{ label: 'Name', value: campaignDetails.campaignName }, { label: 'Start Date', value: campaignDetails.startDate || '\u2014' }, { label: 'Duration', value: `${campaignDetails.durationDays} days` }, { label: 'Objective', value: campaignDetails.objective }] },
                  { title: 'Artwork', items: [{ label: 'File', value: artworkFileName || 'Not uploaded (will email)' }, { label: 'Printing help', value: needsPrintingHelp ? `Yes (+\u20B9${PRINTING_COST})` : 'No' }] },
                ].map((section) => (
                  <Box key={section.title} sx={{ mb: 2.5, p: 2.5, background: '#F5F2EF', borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', mb: 1.5 }}>{section.title}</Typography>
                    {section.items.map((item) => (
                      <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54' }}>{item.label}</Typography>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#1A1510', textAlign: 'right', maxWidth: '55%' }}>{item.value}</Typography>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Card>
            )}

            {/* Status screen */}
            {isStatusScreen && (
              <>
                <Card sx={{ p: 4, border: '1px solid rgba(26,21,16,0.08)', textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 72, color: '#27500A', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Campaign Submitted!</Typography>
                  <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem', mb: 1 }}>
                    <strong>{campaignDetails.campaignName}</strong> is now under review. Either the vehicle owner or our admin team will approve it &mdash; whoever reviews first.
                  </Typography>
                  <Typography sx={{ color: '#6B5E54', fontSize: '0.82rem', mb: 3 }}>
                    You&apos;ll receive an email notification when approved. A badge count will appear on your Campaigns menu.
                  </Typography>
                  <Box sx={{ textAlign: 'left', maxWidth: 420, mx: 'auto', mb: 3 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', mb: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      What happens next
                    </Typography>
                    <StatusTimeline status="submitted" />
                  </Box>
                  {!showPaymentUI && <Button variant="contained" href="/dashboard" sx={{ mt: 1 }}>View in Dashboard &rarr;</Button>}
                </Card>

                {/* Payment Plan selection */}
                <Card sx={{ p: 3, mt: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
                  <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Payment Plan</Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: '#6B5E54', mb: 2 }}>
                    Once approved, choose how you&apos;d like to pay. (This section activates after approval.)
                  </Typography>
                  <RadioGroup value={paymentPlan} onChange={(e) => setPaymentPlan(e.target.value as 'month_on_month' | 'full_period')}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                      {[
                        { value: 'month_on_month', label: 'Month-on-Month', desc: 'Pay monthly. Renewal every 30 days. 3-day grace period before vehicle is released.' },
                        { value: 'full_period', label: 'Full Period Upfront', desc: `Pay once for the full ${campaignDetails.durationDays}-day duration. No renewal hassle.` },
                      ].map((option) => (
                        <Box key={option.value} onClick={() => setPaymentPlan(option.value as 'month_on_month' | 'full_period')} sx={{ border: `2px solid ${paymentPlan === option.value ? BRAND : 'rgba(26,21,16,0.12)'}`, borderRadius: 2, p: 2, cursor: 'pointer', background: paymentPlan === option.value ? '#FDF0EB' : '#FFFFFF', transition: 'all 0.15s' }}>
                          <FormControlLabel value={option.value} control={<Radio sx={{ color: BRAND, '&.Mui-checked': { color: BRAND } }} />} label="" sx={{ m: 0 }} />
                          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mt: -1 }}>{option.label}</Typography>
                          <Typography sx={{ fontSize: '0.78rem', color: '#6B5E54', mt: 0.5 }}>{option.desc}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </RadioGroup>
                  {paymentPlan && <Button variant="contained" sx={{ mt: 2 }} onClick={() => setShowPaymentUI(true)} disabled={showPaymentUI}>Proceed to Payment &rarr;</Button>}
                </Card>

                {/* UPI Two-Payment UI */}
                {showPaymentUI && (
                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ fontWeight: 700, mb: 1 }}>Make Your Payments via UPI</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#6B5E54', mb: 2 }}>Two separate payments are required. Complete both to activate your campaign.</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                      <UpiPaymentCard title="Vehicle Owner Rental" recipientName={selectedVehicles[0]?.ownerName ?? 'Vehicle Owner'} upiId={selectedVehicles[0]?.ownerUpiId ?? 'owner@upi'} amount={ownerRentalForDuration} paymentIndex={1} proofFile={ownerProofFile} utr={ownerUtr} onProofChange={setOwnerProofFile} onUtrChange={setOwnerUtr} onSubmit={() => setOwnerPaymentSubmitted(true)} submitted={ownerPaymentSubmitted} />
                      <UpiPaymentCard title="Platform Fee" recipientName="OohAds Admin" upiId="admin@oohads" amount={adminFee} paymentIndex={2} proofFile={adminProofFile} utr={adminUtr} onProofChange={setAdminProofFile} onUtrChange={setAdminUtr} onSubmit={() => setAdminPaymentSubmitted(true)} submitted={adminPaymentSubmitted} />
                    </Box>
                    <Card sx={{ p: 2, mt: 2, background: '#F5F2EF', border: 'none' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', mb: 1 }}>Fee Breakdown</Typography>
                      {[
                        { label: 'Owner rental', value: `\u20B9${ownerRentalForDuration.toLocaleString()}` },
                        { label: 'Platform fee', value: `\u20B9${PLATFORM_FEE}` },
                        ...(needsPrintingHelp ? [{ label: 'Printing cost', value: `\u20B9${PRINTING_COST}` }] : []),
                      ].map((row) => (
                        <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ fontSize: '0.78rem', color: '#6B5E54' }}>{row.label}</Typography>
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>{row.value}</Typography>
                        </Box>
                      ))}
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>Total</Typography>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: BRAND }}>\u20B9{(ownerRentalForDuration + adminFee).toLocaleString()}</Typography>
                      </Box>
                    </Card>
                    {ownerPaymentSubmitted && adminPaymentSubmitted && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        Both payment proofs submitted! Our team will verify and activate your campaign within 24 hours.
                      </Alert>
                    )}
                  </Box>
                )}
              </>
            )}
            {/* Navigation */}
            {!isStatusScreen && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 1 }}>
                <Button variant="outlined" onClick={() => { setError(''); setStep((s) => s - 1); }} disabled={step === 0} sx={{ borderColor: 'rgba(26,21,16,0.2)', color: '#1A1510', minWidth: 100 }}>
                  &larr; Back
                </Button>
                {step < TOTAL_STEPS - 1 ? (
                  <Button variant="contained" onClick={handleNext} sx={{ minWidth: 100 }}>Next &rarr;</Button>
                ) : (
                  <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={{ minWidth: 140 }}>
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Submit Campaign'}
                  </Button>
                )}
              </Box>
            )}
          </Box>

          {/* Right Sidebar: Cost Summary */}
          {!isStatusScreen && (
            <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)', position: 'sticky', top: 16 }}>
              <Typography sx={{ fontWeight: 700, mb: 2, fontSize: '0.9rem' }}>Cost Summary</Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                {[
                  { label: 'Vehicles Selected', value: selectedVehicleIds.length.toString() },
                  { label: 'Duration', value: `${campaignDetails.durationDays} days` },
                  { label: 'Monthly Cost', value: `\u20B9${totalMonthlyCost.toLocaleString()}` },
                  { label: 'Total Est. Cost', value: `\u20B9${costForDuration.toLocaleString()}` },
                  ...(needsPrintingHelp ? [{ label: 'Printing', value: `\u20B9${PRINTING_COST}` }] : []),
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1A1510' }}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ borderTop: '1px solid rgba(26,21,16,0.08)', pt: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>Total Amount</Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: BRAND }}>
                    &#8377;{(costForDuration + (needsPrintingHelp ? PRINTING_COST : 0)).toLocaleString()}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.7rem', color: '#6B5E54' }}>+ &#8377;{PLATFORM_FEE} platform fee (paid after approval)</Typography>
              </Box>

              {selectedVehicles.length > 0 && (
                <Box sx={{ background: '#FDF0EB', borderRadius: 2, p: 2, mb: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: BRAND, mb: 0.5 }}>
                    Estimated Monthly Reach
                  </Typography>
                  {hasKmEstimate ? (
                    <>
                      <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#1A1510' }}>
                        {(estimatedMonthlyKm / 1000).toFixed(1)}K km/month
                      </Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: '#6B5E54' }}>
                        Based on owner-reported monthly km across {selectedVehicleIds.length} vehicle{selectedVehicleIds.length > 1 ? 's' : ''}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#6B5E54' }}>Estimate pending</Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: '#6B5E54' }}>Owner km data not yet available.</Typography>
                    </>
                  )}
                </Box>
              )}

              {selectedVehicles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B5E54', mb: 1 }}>
                    SELECTED VEHICLES
                  </Typography>
                  {selectedVehicles.map((v) => (
                    <Box key={v.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Chip
                        label={`${v.type === 'auto' ? '🛺' : '🚕'} ${v.registrationNumber}`}
                        size="small"
                        sx={{ fontSize: '0.68rem', background: '#F5F2EF' }}
                      />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: BRAND }}>
                        ₹{v.monthlyRate.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          )}
        </Box>
      </Box>

      {/* Vehicle photo modal */}
      {photoModal && (
        <Box
          onClick={() => setPhotoModal(null)}
          sx={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            p: 2,
          }}
        >
          <Box
            sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              onClick={() => setPhotoModal(null)}
              sx={{
                position: 'absolute',
                top: -18,
                right: -18,
                minWidth: 36,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#fff',
                color: '#1A1510',
                zIndex: 1,
                p: 0,
                '&:hover': { background: '#f0f0f0' },
              }}
            >
              <CloseIcon fontSize="small" />
            </Button>
            <Box
              component="img"
              src={photoModal}
              alt="Vehicle photo"
              sx={{
                maxWidth: '100%',
                maxHeight: '85vh',
                borderRadius: 2,
                display: 'block',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
