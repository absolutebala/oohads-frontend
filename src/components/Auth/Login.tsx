import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GoogleIcon from '@mui/icons-material/Google';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CampaignIcon from '@mui/icons-material/Campaign';
import { User } from 'firebase/auth';
import { firebaseReady } from '../../config/firebase';
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  signInWithGoogle,
  createOrUpdateUserProfile,
  logout as firebaseLogout,
} from '../../services/firebase/auth';
import { getUserById } from '../../services/firebase/firestore';
import { useAuthContext } from '../../context/AuthContext';

type TabRole = 'owner' | 'advertiser';
type Step = 'entry' | 'otp' | 'profile' | 'success';

interface FormData {
  phone: string;
  name: string;
  email: string;
}

const BRAND = '#E8521A';
const POST_LOGIN_REDIRECT_DELAY_MS = 1500;

function redirectAfterLogin(role: TabRole, navigate: ReturnType<typeof useNavigate>) {
  setTimeout(() => {
    if (role === 'owner') {
      navigate('/owner-onboarding');
    } else {
      navigate('/dashboard');
    }
  }, POST_LOGIN_REDIRECT_DELAY_MS);
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUserProfile } = useAuthContext();
  const [tabRole, setTabRole] = useState<TabRole | null>(null);
  const [step, setStep] = useState<Step>('entry');
  const [formData, setFormData] = useState<FormData>({ phone: '', name: '', email: '' });
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  // Auto-select tab based on ?role= query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'owner' || roleParam === 'advertiser') {
      setTabRole(roleParam);
    }
  }, [location.search]);

  const handleTabChange = (_: React.SyntheticEvent, newRole: TabRole) => {
    setTabRole(newRole);
    setStep('entry');
    setError('');
    setFormData({ phone: '', name: '', email: '' });
    setOtpDigits(['', '', '', '', '', '']);
    setVerifiedUser(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) (prev as HTMLInputElement).focus();
    }
  };

  const handleSendOtp = async () => {
    if (formData.phone.length !== 10 || !/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');

    if (!firebaseReady) {
      setTimeout(() => { setLoading(false); setStep('otp'); }, 1000);
      return;
    }

    try {
      await sendPhoneOtp(`+91${formData.phone}`);
      setLoading(false);
      setStep('otp');
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otpDigits.join('');
    if (otpValue.length !== 6) {
      setError('Please enter all 6 OTP digits');
      return;
    }
    setLoading(true);
    setError('');

    if (!firebaseReady) {
      setTimeout(() => { setLoading(false); setStep('profile'); }, 1000);
      return;
    }

    try {
      const credential = await verifyPhoneOtp(otpValue);
      const user = credential.user;

      // Check if user already exists in Firestore
      const existing = await getUserById(user.uid);
      if (existing) {
        if (existing.role !== 'owner') {
          await firebaseLogout();
          setLoading(false);
          setError('This account is registered as an Advertiser. Please use the Advertiser tab and Google sign-in to log in instead.');
          return;
        }
        // Existing owner — log in directly
        await refreshUserProfile();
        setFormData((prev) => ({ ...prev, name: existing.name }));
        setLoading(false);
        setStep('success');
        redirectAfterLogin('owner', navigate);
      } else {
        // New user — collect profile details
        setVerifiedUser(user);
        setLoading(false);
        setStep('profile');
      }
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
    }
  };

  const handleCompleteProfile = async () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!tabRole) {
      setError('Please select an account type (Owner or Advertiser) first.');
      return;
    }
    setLoading(true);
    setError('');

    if (!firebaseReady) {
      setTimeout(() => { setLoading(false); setStep('success'); }, 1000);
      return;
    }

    try {
      const user = verifiedUser;
      const role = tabRole;
      if (user) {
        await createOrUpdateUserProfile(user, formData.name, role, formData.email || undefined);
        await refreshUserProfile();
      }
      setLoading(false);
      setStep('success');
      redirectAfterLogin(role as TabRole, navigate);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    if (!firebaseReady) {
      setTimeout(() => { setLoading(false); setStep('profile'); }, 1200);
      return;
    }

    try {
      const credential = await signInWithGoogle();
      const user = credential.user;

      // Check if user already exists in Firestore
      const existing = await getUserById(user.uid);
      if (existing) {
        if (existing.role !== 'advertiser') {
          await firebaseLogout();
          setLoading(false);
          setError('This account is registered as a Vehicle Owner. Please use the Owner tab and Phone OTP to log in instead.');
          return;
        }
        // Existing advertiser — log in directly
        await refreshUserProfile();
        setFormData((prev) => ({ ...prev, name: existing.name }));
        setLoading(false);
        setStep('success');
        redirectAfterLogin('advertiser', navigate);
      } else {
        // New user
        setVerifiedUser(user);
        const displayName = user.displayName;
        if (displayName) {
          await createOrUpdateUserProfile(user, displayName, 'advertiser', user.email ?? undefined);
          await refreshUserProfile();
          setFormData((prev) => ({ ...prev, name: displayName }));
          setLoading(false);
          setStep('success');
          redirectAfterLogin('advertiser', navigate);
        } else {
          if (user.email) setFormData((prev) => ({ ...prev, email: user.email as string }));
          setLoading(false);
          setStep('profile');
        }
      }
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    }
  };

  const brandGradient = `linear-gradient(135deg, #1A1510 0%, #2D2520 100%)`;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      {/* reCAPTCHA container (invisible, required for phone auth) */}
      <div id="recaptcha-container" />

      {/* Left branding panel */}
      <Box
        sx={{
          background: brandGradient,
          color: '#fff',
          p: { xs: 4, md: 6 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: { xs: 220, md: 'auto' },
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, mb: 1 }}>
            Ad<span style={{ color: BRAND }}>Ride</span>
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', mt: 1 }}>
            Hyperlocal advertising platform
          </Typography>
        </Box>

        <Box sx={{ my: 4 }}>
          {[
            { icon: '🎯', text: 'Reach lakhs of daily commuters' },
            { icon: '📊', text: 'Real-time km tracking & analytics' },
            { icon: '🚗', text: "Chennai's largest auto & taxi network" },
          ].map((item, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ fontSize: '1.25rem' }}>{item.icon}</Box>
              <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>

        <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
          © 2024 AdRide. All rights reserved.
        </Typography>
      </Box>

      {/* Right form panel */}
      <Box
        sx={{
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, md: 4 },
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 420,
            p: { xs: 3, md: 4 },
            border: '1px solid rgba(26,21,16,0.08)',
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Welcome to AdRide
          </Typography>
          <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem', mb: 2.5 }}>
            Select your account type to continue
          </Typography>

          {/* Role tabs */}
          <Tabs
            value={tabRole ?? false}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 3,
              border: '1px solid rgba(26,21,16,0.12)',
              borderRadius: 2,
              overflow: 'hidden',
              '& .MuiTabs-indicator': { backgroundColor: BRAND, height: 3 },
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.875rem',
                color: '#6B5E54',
                minHeight: 48,
              },
              '& .Mui-selected': { color: BRAND },
            }}
          >
            <Tab
              value="owner"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <DirectionsCarIcon fontSize="small" />
                  <span>Owner</span>
                </Box>
              }
            />
            <Tab
              value="advertiser"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <CampaignIcon fontSize="small" />
                  <span>Advertiser</span>
                </Box>
              }
            />
          </Tabs>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* No tab selected */}
          {tabRole === null && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ fontSize: '0.875rem', color: '#6B5E54' }}>
                Please select <strong>Owner</strong> or <strong>Advertiser</strong> above to see login options.
              </Typography>
            </Box>
          )}

          {/* Owner — Phone number entry */}
          {tabRole === 'owner' && step === 'entry' && (
            <Box>
              <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54', mb: 2 }}>
                🛺 Vehicle owners sign in with Phone OTP
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  disabled
                  value="+91"
                  size="small"
                  sx={{ width: 64, '& .MuiInputBase-input': { textAlign: 'center' } }}
                />
                <TextField
                  fullWidth
                  name="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  size="small"
                  inputProps={{ maxLength: 10 }}
                  autoFocus
                />
              </Box>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Send OTP →'}
              </Button>
            </Box>
          )}

          {/* Owner — OTP verification */}
          {tabRole === 'owner' && step === 'otp' && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Verify OTP
              </Typography>
              <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem', mb: 3 }}>
                Sent to +91 {formData.phone}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
                {otpDigits.map((digit, i) => (
                  <TextField
                    key={i}
                    id={`otp-${i}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    size="small"
                    inputProps={{ maxLength: 1, style: { textAlign: 'center', fontSize: '1.2rem', fontWeight: 700 } }}
                    sx={{ width: 48 }}
                    autoFocus={i === 0}
                  />
                ))}
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Verify & Continue →'}
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54' }}>
                  Didn't receive?{' '}
                  <Button
                    variant="text"
                    size="small"
                    sx={{ color: BRAND, p: 0, minWidth: 0, fontSize: '0.8rem' }}
                    onClick={() => setError('')}
                  >
                    Resend OTP
                  </Button>
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="text"
                onClick={() => setStep('entry')}
                sx={{ mt: 1, color: '#6B5E54' }}
              >
                ← Back
              </Button>
            </Box>
          )}

          {/* Advertiser — Google sign-in */}
          {tabRole === 'advertiser' && step === 'entry' && (
            <Box>
              <Typography sx={{ fontSize: '0.8rem', color: '#6B5E54', mb: 2 }}>
                📢 Advertisers sign in with Google
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                disabled={loading}
                sx={{ borderColor: 'rgba(26,21,16,0.2)', color: '#1A1510', '&:hover': { borderColor: '#1A1510' } }}
              >
                {loading ? <CircularProgress size={20} /> : 'Continue with Google'}
              </Button>
            </Box>
          )}

          {/* Profile completion (new users — both roles) */}
          {step === 'profile' && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Complete your profile
              </Typography>
              <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem', mb: 2 }}>
                Just a few details to get started
              </Typography>

              <TextField
                fullWidth
                name="name"
                label="Full name *"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                size="small"
                sx={{ mb: 2 }}
                autoFocus
              />

              <TextField
                fullWidth
                name="email"
                type="email"
                label="Email (optional)"
                placeholder="your@example.com"
                value={formData.email}
                onChange={handleChange}
                size="small"
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleCompleteProfile}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Account →'}
              </Button>
            </Box>
          )}

          {/* Success */}
          {step === 'success' && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: '#27500A', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                You're all set!
              </Typography>
              <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem', mb: 1 }}>
                Welcome, <strong>{formData.name || 'User'}</strong>!
              </Typography>
              <Typography sx={{ color: '#6B5E54', fontSize: '0.875rem', mb: 3 }}>
                Signed in as{' '}
                <Box
                  component="span"
                  sx={{
                    background: '#FDF0EB',
                    color: BRAND,
                    fontWeight: 600,
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '0.8rem',
                  }}
                >
                  {tabRole === 'advertiser' ? '📢 Advertiser' : '🛺 Vehicle Owner'}
                </Box>
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {tabRole === 'owner' ? (
                  <Button
                    fullWidth
                    variant="contained"
                    component={Link}
                    to="/owner-onboarding"
                  >
                    Complete Vehicle Registration →
                  </Button>
                ) : (
                  <Button fullWidth variant="contained" component={Link} to="/dashboard">
                    Go to Dashboard →
                  </Button>
                )}
              </Box>

              <Button
                variant="text"
                onClick={() => {
                  setTabRole(null);
                  setStep('entry');
                  setFormData({ phone: '', name: '', email: '' });
                  setOtpDigits(['', '', '', '', '', '']);
                }}
                sx={{ mt: 2, color: '#6B5E54', fontSize: '0.8rem' }}
              >
                Sign in with a different account
              </Button>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}
