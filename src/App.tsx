import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Button, CircularProgress } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CampaignIcon from '@mui/icons-material/Campaign';
import theme from './theme/theme';
import './styles/global.css';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { firebaseReady } from './config/firebase';

import Homepage from './components/Home/Homepage';
import Login from './components/Auth/Login';
import OwnerOnboarding from './components/OnBoarding/OwnerOnboarding';
import AdminPanel from './components/Admin/AdminPanel';
import CampaignBooking from './components/Campaigns/CampaignBooking';
import AdvertiserDashboard from './components/Dashboard/AdvertiserDashboard';
import OwnerDashboard from './components/Dashboard/OwnerDashboard';

// ── NavBar ────────────────────────────────────────────────────────────────────

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, logout } = useAuthContext();

  const role = userProfile?.role;

  // Determine which nav items to show based on auth state and role
  const navItems: { label: string; path: string }[] = (() => {
    if (!isAuthenticated || !firebaseReady) {
      return [];
    }
    if (role === 'admin') {
      return [
        { label: 'Home', path: '/' },
        { label: 'Admin Panel', path: '/admin' },
        { label: 'Dashboard', path: '/dashboard' },
      ];
    }
    if (role === 'owner') {
      return [
        { label: 'Owner Dashboard', path: '/owner-dashboard' },
      ];
    }
    // advertiser — no nav links, only logo + profile/logout
    return [];
  })();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: '#1A1510',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
        <Typography
          component={Link}
          to={role === 'advertiser' ? '/dashboard' : role === 'owner' ? '/owner-dashboard' : '/'}
          variant="h6"
          sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, mr: 2, textDecoration: 'none', color: 'inherit' }}
        >
          Ad<span style={{ color: '#E8521A' }}>Ride</span>
        </Typography>
        {navItems.map((item) => (
          <Button
            key={item.path}
            component={Link}
            to={item.path}
            size="small"
            sx={{
              color: location.pathname === item.path ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
              fontSize: '0.78rem',
              borderBottom: location.pathname === item.path ? '2px solid #E8521A' : '2px solid transparent',
              borderRadius: 0,
              pb: '6px',
              '&:hover': { color: '#FFFFFF', background: 'rgba(255,255,255,0.06)' },
            }}
          >
            {item.label}
          </Button>
        ))}
        {isAuthenticated ? (
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccountCircleIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.7)' }} />
              <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>
                {userProfile?.name}
              </Typography>
            </Box>
            <Button
              size="small"
              startIcon={<LogoutIcon fontSize="small" />}
              onClick={logout}
              sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', '&:hover': { color: '#FFFFFF', background: 'rgba(255,255,255,0.06)' } }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DirectionsCarIcon fontSize="small" />}
              onClick={() => navigate('/login?role=owner')}
              sx={{
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#FFFFFF',
                background: 'transparent',
                borderRadius: '100px',
                fontSize: '0.8rem',
                px: '16px',
                py: '6px',
                textTransform: 'none',
                '&:hover': { border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.06)' },
              }}
            >
              Owner Login
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<CampaignIcon fontSize="small" />}
              onClick={() => navigate('/login?role=advertiser')}
              sx={{
                background: '#E8521A',
                color: '#FFFFFF',
                borderRadius: '100px',
                fontSize: '0.8rem',
                px: '16px',
                py: '6px',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { background: '#B83D0F', boxShadow: 'none' },
              }}
            >
              Advertiser Login
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

// ── Route Guards ──────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'advertiser' | 'owner' | 'admin'>;
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, userProfile } = useAuthContext();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <CircularProgress sx={{ color: '#E8521A' }} />
      </Box>
    );
  }

  // When Firebase is not configured, allow access (development / no-env mode)
  if (!firebaseReady) return <>{children}</>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    // Redirect to role-appropriate home instead of a blank 403
    if (userProfile.role === 'admin') return <Navigate to="/admin" replace />;
    if (userProfile.role === 'owner') return <Navigate to="/owner-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

/** Redirects already-authenticated users away from the login page */
function LoginRoute() {
  const { isAuthenticated, isLoading, userProfile } = useAuthContext();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <CircularProgress sx={{ color: '#E8521A' }} />
      </Box>
    );
  }

  if (isAuthenticated && firebaseReady) {
    if (userProfile?.role === 'admin') return <Navigate to="/admin" replace />;
    if (userProfile?.role === 'owner') return <Navigate to="/owner-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
}

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <NavBar />
            <Box sx={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/login" element={<LoginRoute />} />
                <Route
                  path="/owner-onboarding"
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <OwnerOnboarding />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/campaign"
                  element={
                    <ProtectedRoute allowedRoles={['advertiser']}>
                      <CampaignBooking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['advertiser', 'admin']}>
                      <AdvertiserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
