import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Button, CircularProgress } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
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

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Login', path: '/login' },
  { label: 'Owner Onboarding', path: '/owner-onboarding' },
  { label: 'Admin Panel', path: '/admin' },
  { label: 'Book Campaign', path: '/campaign' },
  { label: 'Dashboard', path: '/dashboard' },
];

function NavBar() {
  const location = useLocation();
  const { isAuthenticated, userProfile, logout } = useAuthContext();
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
          to="/"
          variant="h6"
          sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, mr: 2, textDecoration: 'none', color: 'inherit' }}
        >
          Ad<span style={{ color: '#E8521A' }}>Ride</span>
        </Typography>
        {NAV_ITEMS.map((item) => (
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
        {isAuthenticated && (
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
        )}
      </Toolbar>
    </AppBar>
  );
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
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
  if (adminOnly && userProfile?.role !== 'admin') return <Navigate to="/" replace />;

  return <>{children}</>;
}

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
                <Route path="/login" element={<Login />} />
                <Route path="/owner-onboarding" element={<ProtectedRoute><OwnerOnboarding /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
                <Route path="/campaign" element={<ProtectedRoute><CampaignBooking /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><AdvertiserDashboard /></ProtectedRoute>} />
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
