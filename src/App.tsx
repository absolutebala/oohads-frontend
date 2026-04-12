import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import theme from './theme/theme';
import './styles/global.css';
import { AuthProvider } from './context/AuthContext';

import Login from './components/Auth/Login';
import OwnerOnboarding from './components/OnBoarding/OwnerOnboarding';
import AdminOwnerOnboarding from './components/Admin/AdminOwnerOnboarding';
import CampaignBooking from './components/Campaigns/CampaignBooking';
import AdvertiserDashboard from './components/Dashboard/AdvertiserDashboard';

function NavBar() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: '#1A1510',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, mr: 3 }}
        >
          Ad<span style={{ color: '#E8521A' }}>Ride</span>
        </Typography>
        {[
          { label: 'Login', path: '/' },
          { label: 'Owner Onboarding', path: '/owner-onboarding' },
          { label: 'Admin Panel', path: '/admin' },
          { label: 'Book Campaign', path: '/campaign' },
          { label: 'Dashboard', path: '/dashboard' },
        ].map((item) => (
          <Button
            key={item.path}
            component={Link}
            to={item.path}
            size="small"
            sx={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: '0.8rem',
              '&:hover': { color: '#FFFFFF', background: 'rgba(255,255,255,0.08)' },
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
                <Route path="/" element={<Login />} />
                <Route path="/owner-onboarding" element={<OwnerOnboarding />} />
                <Route path="/admin" element={<AdminOwnerOnboarding />} />
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
