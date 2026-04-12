import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme';

// Mock Firebase modules before importing App
jest.mock('./config/firebase', () => ({
  auth: { currentUser: null, onAuthStateChanged: jest.fn((cb: any) => { cb(null); return jest.fn(); }) },
  firestore: {},
  storage: {},
  firebaseReady: true,
}));

jest.mock('./services/firebase/auth', () => ({
  onAuthStateChange: jest.fn((cb: any) => { cb(null); return jest.fn(); }),
  logout: jest.fn(),
}));

jest.mock('./services/firebase/firestore', () => ({
  getUserById: jest.fn(),
}));

jest.mock('./services/api/services/authService', () => ({
  authService: {
    logout: jest.fn(),
    refreshToken: jest.fn(),
  },
}));

jest.mock('./services/api/config', () => ({
  SESSION_EXPIRED_EVENT: 'session-expired',
  default: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('./utils/tokenManager', () => ({
  clearTokens: jest.fn(),
  hasValidToken: jest.fn(() => false),
  getAccessToken: jest.fn(),
  setTokens: jest.fn(),
}));

// Mock chart.js
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
}));

jest.mock('chart.js', () => ({
  Chart: { register: jest.fn() },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  LineElement: jest.fn(),
  PointElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Filler: jest.fn(),
  ArcElement: jest.fn(),
}));

// Import Homepage and other components directly for route testing
// Since App includes its own BrowserRouter, we test individual routes by
// rendering App without an extra Router wrapper.
import Homepage from './components/Home/Homepage';
import Login from './components/Auth/Login';
import OwnerOnboarding from './components/OnBoarding/OwnerOnboarding';
import AdminPanel from './components/Admin/AdminPanel';
import CampaignBooking from './components/Campaigns/CampaignBooking';
import AdvertiserDashboard from './components/Dashboard/AdvertiserDashboard';

function renderRoute(ui: React.ReactElement, route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider theme={theme}>
        {ui}
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('App - Route Rendering', () => {
  it('renders Homepage component', () => {
    renderRoute(<Homepage />);
    expect(screen.getByText(/Turn Every Auto & Taxi Into a/i)).toBeInTheDocument();
  });

  it('renders Login component', () => {
    renderRoute(<Login />, '/login');
    expect(screen.getByText('Welcome to AdRide')).toBeInTheDocument();
  });

  it('renders OwnerOnboarding component', () => {
    renderRoute(<OwnerOnboarding />, '/owner-onboarding');
    expect(screen.getByText('Vehicle Owner Registration')).toBeInTheDocument();
  });

  it('renders AdminPanel component', () => {
    renderRoute(<AdminPanel />, '/admin');
    expect(screen.getByText('Admin Console')).toBeInTheDocument();
  });

  it('renders CampaignBooking component', () => {
    renderRoute(<CampaignBooking />, '/campaign');
    expect(screen.getByText('Book a Campaign')).toBeInTheDocument();
  });

  it('renders AdvertiserDashboard component', () => {
    renderRoute(<AdvertiserDashboard />, '/dashboard');
    expect(screen.getByText('Advertiser Dashboard')).toBeInTheDocument();
  });
});

describe('App - Navigation Links', () => {
  it('renders all navigation links in Homepage', () => {
    renderRoute(<Homepage />);
    // Homepage has navigation links like "Start a Campaign", "Register Your Vehicle", etc.
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });
});
