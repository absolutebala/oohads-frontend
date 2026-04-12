import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import theme from './theme/theme';
import './styles/global.css';
import { AuthProvider } from './context/AuthContext';

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
      </Toolbar>
    </AppBar>
  );
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
                <Route path="/owner-onboarding" element={<OwnerOnboarding />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/campaign" element={<CampaignBooking />} />
                <Route path="/dashboard" element={<AdvertiserDashboard />} />
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
