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
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Vehicle } from '../../types';
import { firebaseReady } from '../../config/firebase';
import { getOwnersByStatus, createCampaign } from '../../services/firebase/firestore';
import { uploadCampaignArtwork } from '../../services/firebase/storage';
import { useAuthContext } from '../../context/AuthContext';

const BRAND = '#E8521A';

const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', registrationNumber: 'TN01AB1234', type: 'auto', area: 'T. Nagar', ownerName: 'Rajan Kumar', monthlyRate: 2800, kmPerDay: 80, status: 'available' },
  { id: 'v2', registrationNumber: 'TN01CD5678', type: 'taxi', area: 'Velachery', ownerName: 'Priya Selvam', monthlyRate: 3200, kmPerDay: 120, status: 'available' },
  { id: 'v3', registrationNumber: 'TN01EF9012', type: 'auto', area: 'Anna Nagar', ownerName: 'Murugan P', monthlyRate: 2500, kmPerDay: 75, status: 'available' },
  { id: 'v4', registrationNumber: 'TN01GH3456', type: 'taxi', area: 'Adyar', ownerName: 'Sundar Raj', monthlyRate: 3500, kmPerDay: 140, status: 'available' },
  { id: 'v5', registrationNumber: 'TN01IJ7890', type: 'auto', area: 'T. Nagar', ownerName: 'Kavitha M', monthlyRate: 2600, kmPerDay: 70, status: 'available' },
  { id: 'v6', registrationNumber: 'TN01KL2345', type: 'taxi', area: 'Porur', ownerName: 'Babu S', monthlyRate: 3000, kmPerDay: 110, status: 'available' },
];
const AREAS = ['All Areas', 'T. Nagar', 'Velachery', 'Anna Nagar', 'Adyar', 'Porur', 'Mylapore'];
const OBJECTIVES = ['Brand Awareness', 'Product Launch', 'Event Promotion', 'App Install', 'Store Traffic'];

const STEPS = ['Select Vehicles', 'Campaign Details', 'Upload Artwork', 'Review & Submit', 'Status'];

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
               item.key === 'reviewing' ? 'Admin reviewing your campaign details' :
               item.key === 'approved' ? 'Campaign approved for deployment' : 'Ads now running on vehicles'}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default function CampaignBooking() {
  const { firebaseUser } = useAuthContext();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [areaFilter, setAreaFilter] = useState('All Areas');
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [artworkFileName, setArtworkFileName] = useState('');
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [campaignDetails, setCampaignDetails] = useState<CampaignDetails>({
    campaignName: '',
    startDate: '',
    endDate: '',
    durationDays: 30,
    objective: '',
  });

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
            area: o.operatingAreas[0] ?? '',
            ownerName: o.name,
            monthlyRate: o.monthlyRate,
            kmPerDay: 80, // default
            status: 'available' as const,
          }));
          setAllVehicles(vehicles);
        }
      })
      .catch(() => {
        // Fall back to mock data on error
      })
      .finally(() => setVehiclesLoading(false));
  }, []);

  const filteredVehicles = useMemo(() =>
    areaFilter === 'All Areas' ? allVehicles : allVehicles.filter((v) => v.area === areaFilter),
    [areaFilter, allVehicles]
  );

  const selectedVehicles = allVehicles.filter((v) => selectedVehicleIds.includes(v.id));
  const totalMonthlyCost = selectedVehicles.reduce((sum, v) => sum + v.monthlyRate, 0);
  const estimatedKm = selectedVehicles.reduce((sum, v) => sum + v.kmPerDay * campaignDetails.durationDays, 0);
  const costForDuration = Math.round(totalMonthlyCost * (campaignDetails.durationDays / 30));

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
    if (step === 0 && selectedVehicleIds.length === 0) return 'Select at least one vehicle';
    if (step === 1) {
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
      // Mock fallback
      setTimeout(() => { setLoading(false); setStep(4); }, 1500);
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
        status: 'draft',
        selectedVehicleIds,
        artworkUrl,
        totalCost: costForDuration,
        approvals: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setLoading(false);
      setStep(4);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to submit campaign. Please try again.');
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', background: '#F5F2EF', p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Book a Campaign</Typography>
          {step < 4 && (
            <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem' }}>
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </Typography>
          )}
        </Box>

        {step < 4 && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress variant="determinate" value={(step / (STEPS.length - 2)) * 100} sx={{ height: 6, borderRadius: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              {STEPS.slice(0, 4).map((label, i) => (
                <Typography key={i} sx={{ fontSize: '0.68rem', color: i <= step ? BRAND : '#6B5E54', fontWeight: i === step ? 700 : 400 }}>
                  {label}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: step < 4 ? '1fr 320px' : '1fr' }, gap: 3, alignItems: 'start' }}>
          {/* Main Content */}
          <Box>
            {/* Step 0: Select Vehicles */}
            {step === 0 && (
              <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>Available Vehicles</Typography>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Filter by Area</InputLabel>
                    <Select value={areaFilter} label="Filter by Area" onChange={(e) => setAreaFilter(e.target.value)}>
                      {AREAS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>

                {vehiclesLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={32} sx={{ color: BRAND }} />
                  </Box>
                ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {filteredVehicles.map((vehicle) => {
                    const isSelected = selectedVehicleIds.includes(vehicle.id);
                    return (
                      <Box
                        key={vehicle.id}
                        onClick={() => toggleVehicle(vehicle.id)}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 2, p: 2,
                          border: `2px solid ${isSelected ? BRAND : 'rgba(26,21,16,0.1)'}`,
                          borderRadius: 2, cursor: 'pointer',
                          background: isSelected ? '#FDF0EB' : '#FFFFFF',
                          transition: 'all 0.15s', '&:hover': { borderColor: BRAND },
                        }}
                      >
                        <Checkbox checked={isSelected} sx={{ color: BRAND, '&.Mui-checked': { color: BRAND }, p: 0 }} />
                        <Box sx={{ color: BRAND, flexShrink: 0 }}>
                          <DirectionsCarIcon />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{vehicle.registrationNumber}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#6B5E54' }}>
                            {vehicle.type.toUpperCase()} · {vehicle.ownerName} · {vehicle.area}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontWeight: 700, color: BRAND, fontSize: '0.9rem' }}>₹{vehicle.monthlyRate.toLocaleString()}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: '#6B5E54' }}>/month</Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: '#6B5E54' }}>~{vehicle.kmPerDay} km/day</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
                )}

                {selectedVehicleIds.length > 0 && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {selectedVehicleIds.length} vehicle{selectedVehicleIds.length > 1 ? 's' : ''} selected
                  </Alert>
                )}
              </Card>
            )}

            {/* Step 1: Campaign Details */}
            {step === 1 && (
              <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
                <Typography sx={{ fontWeight: 700, mb: 2 }}>Campaign Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth name="campaignName" label="Campaign Name *" placeholder="e.g. Diwali Sale 2024"
                    value={campaignDetails.campaignName} onChange={handleDetailsChange} size="small"
                  />

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                      fullWidth name="startDate" label="Start Date *" type="date"
                      value={campaignDetails.startDate} onChange={handleDetailsChange} size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      fullWidth name="endDate" label="End Date" type="date"
                      value={campaignDetails.endDate} onChange={handleDetailsChange} size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B5E54' }}>
                        Campaign Duration
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: BRAND }}>
                        {campaignDetails.durationDays} days
                      </Typography>
                    </Box>
                    <Slider
                      value={campaignDetails.durationDays}
                      onChange={(_, value) => setCampaignDetails((prev) => ({ ...prev, durationDays: value as number }))}
                      min={7} max={90} step={1}
                      marks={[{ value: 7, label: '7d' }, { value: 30, label: '30d' }, { value: 60, label: '60d' }, { value: 90, label: '90d' }]}
                      sx={{ color: BRAND, '& .MuiSlider-markLabel': { fontSize: '0.7rem' } }}
                    />
                  </Box>

                  <FormControl fullWidth size="small">
                    <InputLabel>Campaign Objective *</InputLabel>
                    <Select
                      value={campaignDetails.objective}
                      label="Campaign Objective *"
                      onChange={(e) => setCampaignDetails((prev) => ({ ...prev, objective: e.target.value }))}
                    >
                      {OBJECTIVES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
              </Card>
            )}

            {/* Step 2: Artwork Upload */}
            {step === 2 && (
              <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
                <Typography sx={{ fontWeight: 700, mb: 2 }}>Upload Campaign Artwork</Typography>

                {/* Hidden file input */}
                <input
                  ref={artworkInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setArtworkFile(file);
                      setArtworkFileName(file.name);
                    }
                  }}
                />

                <Box
                  onClick={() => artworkInputRef.current?.click()}
                  sx={{
                    border: `3px dashed ${artworkFileName ? BRAND : 'rgba(26,21,16,0.2)'}`,
                    borderRadius: 3,
                    p: 5,
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: artworkFileName ? '#FDF0EB' : '#FAFAFA',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: BRAND, background: '#FDF0EB' },
                    mb: 2,
                  }}
                >
                  {artworkFileName ? (
                    <CheckCircleIcon sx={{ fontSize: 48, color: '#27500A', mb: 1 }} />
                  ) : (
                    <CloudUploadIcon sx={{ fontSize: 48, color: '#6B5E54', mb: 1 }} />
                  )}
                  <Typography sx={{ fontWeight: 600, color: artworkFileName ? '#27500A' : '#1A1510', mb: 0.5 }}>
                    {artworkFileName || 'Click to upload artwork'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54' }}>
                    {artworkFileName ? 'File ready for upload' : 'JPG, PNG, PDF · Max 10MB · Recommended: 1200×400px'}
                  </Typography>
                </Box>

                <Box sx={{ background: '#FDF0EB', borderRadius: 2, p: 2 }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: BRAND, mb: 1 }}>📐 Design Guidelines</Typography>
                  {[
                    'Use high contrast colors visible from 5–10 meters',
                    'Keep text minimal — max 5–7 words',
                    'Include your brand logo prominently',
                    'Avoid white backgrounds (shows dirt quickly)',
                  ].map((tip, i) => (
                    <Typography key={i} sx={{ fontSize: '0.75rem', color: '#6B5E54', mb: 0.5 }}>• {tip}</Typography>
                  ))}
                </Box>
              </Card>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)' }}>
                <Typography sx={{ fontWeight: 700, mb: 2.5 }}>Review Campaign</Typography>

                {[
                  {
                    title: '🚗 Selected Vehicles',
                    items: selectedVehicles.map((v) => ({ label: v.registrationNumber, value: `${v.area} · ₹${v.monthlyRate}/mo` })),
                  },
                  {
                    title: '📋 Campaign Details',
                    items: [
                      { label: 'Name', value: campaignDetails.campaignName },
                      { label: 'Start Date', value: campaignDetails.startDate || '—' },
                      { label: 'Duration', value: `${campaignDetails.durationDays} days` },
                      { label: 'Objective', value: campaignDetails.objective },
                    ],
                  },
                  {
                    title: '🎨 Artwork',
                    items: [{ label: 'File', value: artworkFileName || 'Not uploaded' }],
                  },
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

            {/* Step 4: Status */}
            {step === 4 && (
              <Card sx={{ p: 4, border: '1px solid rgba(26,21,16,0.08)', textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 72, color: '#27500A', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Campaign Submitted!</Typography>
                <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem', mb: 3 }}>
                  <strong>{campaignDetails.campaignName}</strong> is now under review.
                  Our team will approve within 24 hours.
                </Typography>

                <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', mb: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Approval Timeline
                  </Typography>
                  <StatusTimeline status="submitted" />
                </Box>

                <Button variant="contained" href="/dashboard" sx={{ mt: 2 }}>
                  View in Dashboard →
                </Button>
              </Card>
            )}

            {/* Navigation */}
            {step < 4 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => { setError(''); setStep((s) => s - 1); }}
                  disabled={step === 0}
                  sx={{ borderColor: 'rgba(26,21,16,0.2)', color: '#1A1510', minWidth: 100 }}
                >
                  ← Back
                </Button>
                {step < 3 ? (
                  <Button variant="contained" onClick={handleNext} sx={{ minWidth: 100 }}>
                    Next →
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={{ minWidth: 140 }}>
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Submit Campaign'}
                  </Button>
                )}
              </Box>
            )}
          </Box>

          {/* Right Sidebar: Cost Summary */}
          {step < 4 && (
            <Card sx={{ p: 3, border: '1px solid rgba(26,21,16,0.08)', position: 'sticky', top: 16 }}>
              <Typography sx={{ fontWeight: 700, mb: 2, fontSize: '0.9rem' }}>💰 Cost Summary</Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                {[
                  { label: 'Vehicles Selected', value: selectedVehicleIds.length.toString() },
                  { label: 'Duration', value: `${campaignDetails.durationDays} days` },
                  { label: 'Monthly Cost', value: `₹${totalMonthlyCost.toLocaleString()}` },
                  { label: 'Total Est. Cost', value: `₹${costForDuration.toLocaleString()}` },
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
                    ₹{costForDuration.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              {estimatedKm > 0 && (
                <Box sx={{ background: '#FDF0EB', borderRadius: 2, p: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: BRAND, mb: 0.5 }}>
                    📍 Estimated Reach
                  </Typography>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#1A1510' }}>
                    {(estimatedKm / 1000).toFixed(1)}K km
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#6B5E54' }}>
                    over {campaignDetails.durationDays} days across {selectedVehicleIds.length} vehicles
                  </Typography>
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
    </Box>
  );
}
