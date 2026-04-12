import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';

const BRAND = '#E8521A';
const AREAS = [
  'Anna Nagar', 'T. Nagar', 'Velachery', 'Tambaram', 'Chromepet',
  'Porur', 'Adyar', 'Mylapore', 'Perambur', 'Ambattur',
];

interface PersonalDetails {
  name: string;
  phone: string;
  email: string;
}

interface VehicleDetails {
  type: 'auto' | 'taxi' | '';
  registrationNumber: string;
  operatingAreas: string[];
  photoFileName: string;
}

interface DocsAndPricing {
  rcFileName: string;
  insuranceFileName: string;
  monthlyRate: string;
  upiId: string;
}

export default function OwnerOnboarding() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [personal, setPersonal] = useState<PersonalDetails>({ name: '', phone: '', email: '' });
  const [vehicle, setVehicle] = useState<VehicleDetails>({
    type: '',
    registrationNumber: '',
    operatingAreas: [],
    photoFileName: '',
  });
  const [docs, setDocs] = useState<DocsAndPricing>({
    rcFileName: '',
    insuranceFileName: '',
    monthlyRate: '',
    upiId: '',
  });

  const steps = ['Personal Details', 'Vehicle Details', 'Documents & Pricing', 'Review & Submit'];
  const progress = ((step) / (steps.length - 1)) * 100;

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonal((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDocs((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileSimulate = (field: keyof DocsAndPricing | 'photoFileName') => {
    const fakeFileName = `file_${Date.now()}.pdf`;
    if (field === 'photoFileName') {
      setVehicle((prev) => ({ ...prev, photoFileName: `vehicle_photo_${Date.now()}.jpg` }));
    } else {
      setDocs((prev) => ({ ...prev, [field]: fakeFileName }));
    }
  };

  const validateStep = () => {
    if (step === 0) {
      if (!personal.name.trim()) return 'Name is required';
      if (!/^\d{10}$/.test(personal.phone)) return 'Valid 10-digit phone is required';
    }
    if (step === 1) {
      if (!vehicle.type) return 'Please select vehicle type';
      if (!vehicle.registrationNumber.trim()) return 'Registration number is required';
      if (vehicle.operatingAreas.length === 0) return 'Select at least one area';
    }
    if (step === 2) {
      if (!docs.upiId.trim()) return 'UPI ID is required';
      if (!docs.monthlyRate || isNaN(Number(docs.monthlyRate))) return 'Monthly rate is required';
    }
    return '';
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, background: '#F5F2EF' }}>
        <Card sx={{ maxWidth: 480, width: '100%', p: 5, textAlign: 'center', border: '1px solid rgba(26,21,16,0.08)' }}>
          <CheckCircleIcon sx={{ fontSize: 72, color: '#27500A', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Registration Submitted!</Typography>
          <Typography sx={{ color: '#6B5E54', mb: 1 }}>
            Thank you, <strong>{personal.name}</strong>! Your vehicle registration is under review.
          </Typography>
          <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem', mb: 3 }}>
            We'll contact you at +91 {personal.phone} within 24–48 hours.
          </Typography>
          <Box sx={{ background: '#EAF3DE', borderRadius: 2, p: 2, mb: 3 }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#27500A', fontWeight: 600 }}>
              📋 Submitted details
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#27500A', mt: 0.5 }}>
              Vehicle: {vehicle.type?.toUpperCase()} · {vehicle.registrationNumber}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#27500A' }}>
              Monthly rate: ₹{docs.monthlyRate}
            </Typography>
          </Box>
          <Button variant="contained" href="/" fullWidth>Back to Home</Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', background: '#F5F2EF', p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 680, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Vehicle Owner Registration</Typography>
          <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem' }}>
            Step {step + 1} of {steps.length}: {steps[step]}
          </Typography>
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            {steps.map((label, i) => (
              <Typography
                key={i}
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: i <= step ? 600 : 400,
                  color: i <= step ? BRAND : '#6B5E54',
                  display: { xs: i === step ? 'block' : 'none', sm: 'block' },
                }}
              >
                {label}
              </Typography>
            ))}
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card sx={{ p: { xs: 2.5, md: 4 }, border: '1px solid rgba(26,21,16,0.08)' }}>
          {/* Step 0: Personal Details */}
          {step === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Personal Details</Typography>
              <TextField
                fullWidth name="name" label="Full Name *" placeholder="Your full name"
                value={personal.name} onChange={handlePersonalChange} size="small"
              />
              <TextField
                fullWidth name="phone" label="Phone Number *" placeholder="10-digit mobile"
                value={personal.phone} onChange={handlePersonalChange} size="small"
                inputProps={{ maxLength: 10 }}
              />
              <TextField
                fullWidth name="email" type="email" label="Email Address" placeholder="your@example.com"
                value={personal.email} onChange={handlePersonalChange} size="small"
              />
            </Box>
          )}

          {/* Step 1: Vehicle Details */}
          {step === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Vehicle Details</Typography>

              {/* Vehicle Type */}
              <Box>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B5E54', mb: 1 }}>Vehicle Type *</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  {[
                    { value: 'auto', label: 'Auto Rickshaw', icon: <TwoWheelerIcon /> },
                    { value: 'taxi', label: 'Taxi / Cab', icon: <DirectionsCarIcon /> },
                  ].map((opt) => (
                    <Box
                      key={opt.value}
                      onClick={() => setVehicle((prev) => ({ ...prev, type: opt.value as 'auto' | 'taxi' }))}
                      sx={{
                        border: `2px solid ${vehicle.type === opt.value ? BRAND : 'rgba(26,21,16,0.12)'}`,
                        borderRadius: 2,
                        p: 2,
                        cursor: 'pointer',
                        background: vehicle.type === opt.value ? '#FDF0EB' : '#FFFFFF',
                        textAlign: 'center',
                        transition: 'all 0.15s',
                        '&:hover': { borderColor: BRAND },
                      }}
                    >
                      <Box sx={{ color: vehicle.type === opt.value ? BRAND : '#6B5E54', mb: 0.5 }}>{opt.icon}</Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{opt.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <TextField
                fullWidth name="registrationNumber" label="Registration Number *" placeholder="e.g. TN 01 AB 1234"
                value={vehicle.registrationNumber} onChange={handleVehicleChange} size="small"
              />

              {/* Operating Areas */}
              <FormControl fullWidth size="small">
                <InputLabel>Operating Areas *</InputLabel>
                <Select
                  multiple
                  value={vehicle.operatingAreas}
                  onChange={(e) => setVehicle((prev) => ({ ...prev, operatingAreas: e.target.value as string[] }))}
                  input={<OutlinedInput label="Operating Areas *" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((v) => <Chip key={v} label={v} size="small" />)}
                    </Box>
                  )}
                >
                  {AREAS.map((area) => <MenuItem key={area} value={area}>{area}</MenuItem>)}
                </Select>
              </FormControl>

              {/* Photo Upload */}
              <Box>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B5E54', mb: 1 }}>Vehicle Photo</Typography>
                <Box
                  onClick={() => handleFileSimulate('photoFileName')}
                  sx={{
                    border: '2px dashed rgba(26,21,16,0.2)',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { borderColor: BRAND, background: '#FDF0EB' },
                  }}
                >
                  <CloudUploadIcon sx={{ color: '#6B5E54', mb: 1 }} />
                  <Typography sx={{ fontSize: '0.8rem', color: vehicle.photoFileName ? '#27500A' : '#6B5E54', fontWeight: vehicle.photoFileName ? 600 : 400 }}>
                    {vehicle.photoFileName || 'Click to upload vehicle photo (JPG/PNG)'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Step 2: Documents & Pricing */}
          {step === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Documents & Pricing</Typography>

              {[
                { field: 'rcFileName' as const, label: 'RC Book (Registration Certificate)', icon: '📄' },
                { field: 'insuranceFileName' as const, label: 'Insurance Document', icon: '🛡️' },
              ].map((doc) => (
                <Box key={doc.field}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B5E54', mb: 1 }}>{doc.icon} {doc.label}</Typography>
                  <Box
                    onClick={() => handleFileSimulate(doc.field)}
                    sx={{
                      border: '2px dashed rgba(26,21,16,0.2)',
                      borderRadius: 2,
                      p: 2.5,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { borderColor: BRAND, background: '#FDF0EB' },
                    }}
                  >
                    <CloudUploadIcon sx={{ color: '#6B5E54', fontSize: 20, mb: 0.5 }} />
                    <Typography sx={{ fontSize: '0.8rem', color: docs[doc.field] ? '#27500A' : '#6B5E54', fontWeight: docs[doc.field] ? 600 : 400 }}>
                      {docs[doc.field] || 'Click to upload PDF/Image'}
                    </Typography>
                  </Box>
                </Box>
              ))}

              <TextField
                fullWidth name="upiId" label="UPI ID *" placeholder="yourname@upi"
                value={docs.upiId} onChange={handleDocsChange} size="small"
                helperText="For receiving monthly payments"
              />

              <TextField
                fullWidth name="monthlyRate" label="Expected Monthly Rate (₹) *" placeholder="e.g. 3000"
                value={docs.monthlyRate} onChange={handleDocsChange} size="small" type="number"
                helperText="Amount you expect per month for advertising space"
              />
            </Box>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Review Your Details</Typography>

              {[
                {
                  title: '👤 Personal Details',
                  items: [
                    { label: 'Name', value: personal.name },
                    { label: 'Phone', value: `+91 ${personal.phone}` },
                    { label: 'Email', value: personal.email || '—' },
                  ],
                },
                {
                  title: '🚗 Vehicle Details',
                  items: [
                    { label: 'Type', value: vehicle.type?.toUpperCase() || '—' },
                    { label: 'Registration', value: vehicle.registrationNumber },
                    { label: 'Areas', value: vehicle.operatingAreas.join(', ') || '—' },
                    { label: 'Photo', value: vehicle.photoFileName || 'Not uploaded' },
                  ],
                },
                {
                  title: '📋 Documents & Pricing',
                  items: [
                    { label: 'RC Book', value: docs.rcFileName || 'Not uploaded' },
                    { label: 'Insurance', value: docs.insuranceFileName || 'Not uploaded' },
                    { label: 'UPI ID', value: docs.upiId },
                    { label: 'Monthly Rate', value: `₹${docs.monthlyRate}` },
                  ],
                },
              ].map((section) => (
                <Box key={section.title} sx={{ mb: 2.5, p: 2.5, background: '#F5F2EF', borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', mb: 1.5, color: '#1A1510' }}>
                    {section.title}
                  </Typography>
                  {section.items.map((item) => (
                    <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54' }}>{item.label}</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#1A1510', textAlign: 'right', maxWidth: '60%' }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ))}

              <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
                By submitting, you agree to AdRide's Terms of Service and Privacy Policy.
              </Alert>
            </Box>
          )}

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
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
              <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={{ minWidth: 120 }}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Submit Registration'}
              </Button>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
