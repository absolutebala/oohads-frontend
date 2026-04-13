import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockResetIcon from '@mui/icons-material/LockReset';
import {
  verifyAdminCredentials,
  setAdminSession,
  updateAdminPassword,
  resetAdminCredentials,
} from '../../utils/adminAuth';

const BRAND = '#E8521A';
const DARK = '#1A1510';
const BG = '#F5F2EF';

// ── Change-Password Modal ─────────────────────────────────────────────────────

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetState = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    const ok = await updateAdminPassword(currentPassword, newPassword);
    setLoading(false);

    if (!ok) {
      setError('Current password is incorrect.');
      return;
    }

    setSuccess('Password updated successfully!');
    setTimeout(() => handleClose(), 1500);
  };

  const handleReset = async () => {
    setLoading(true);
    await resetAdminCredentials();
    setLoading(false);
    setSuccess('Credentials reset to default. Use the original master credentials to sign in.');
    setTimeout(() => handleClose(), 2000);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, color: DARK }}>
        Change Admin Password
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Current Password"
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowCurrent((v) => !v)} edge="end" size="small">
                    {showCurrent ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="New Password"
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            helperText="Minimum 8 characters"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNew((v) => !v)} edge="end" size="small">
                    {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
          />
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Button
            size="small"
            startIcon={<LockResetIcon fontSize="small" />}
            onClick={handleReset}
            disabled={loading}
            sx={{ color: '#6B5E54', fontSize: '0.75rem' }}
          >
            Reset to Default Credentials
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" size="small" disabled={loading}
          sx={{ borderColor: 'rgba(26,21,16,0.2)', color: DARK }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="small"
          disabled={loading}
          sx={{ background: BRAND, '&:hover': { background: '#B83D0F' } }}
        >
          {loading ? <CircularProgress size={16} color="inherit" /> : 'Update Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Admin Login Page ──────────────────────────────────────────────────────────

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);
    const ok = await verifyAdminCredentials(username.trim(), password);
    setLoading(false);

    if (!ok) {
      setError('Invalid username or password.');
      return;
    }

    setAdminSession();
    navigate('/admin');
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        background: BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, md: 3 },
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, md: 4 },
          border: '1px solid rgba(26,21,16,0.10)',
          borderRadius: 3,
          background: '#FFFFFF',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${BRAND} 0%, #B83D0F 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <AdminPanelSettingsIcon sx={{ color: '#fff', fontSize: 30 }} />
          </Box>

          <Typography
            variant="h5"
            sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, color: DARK, mb: 0.5 }}
          >
            Admin Login
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#6B5E54' }}>
            Secure access to the AdRide admin panel
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 0.5 }}>{error}</Alert>}

          <TextField
            label="Username"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            fullWidth
            autoFocus
            autoComplete="username"
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            fullWidth
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    size="small"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 0.5,
              background: BRAND,
              py: '11px',
              fontSize: '0.95rem',
              fontWeight: 600,
              '&:hover': { background: '#B83D0F' },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign In →'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Footer actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            size="small"
            startIcon={<LockResetIcon fontSize="small" />}
            onClick={() => setChangePasswordOpen(true)}
            sx={{ color: '#6B5E54', fontSize: '0.78rem', '&:hover': { color: DARK } }}
          >
            Change Password
          </Button>

          <Typography
            component={Link}
            to="/login"
            sx={{
              fontSize: '0.78rem',
              color: BRAND,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            ← Back to Login
          </Typography>
        </Box>
      </Card>

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </Box>
  );
}
