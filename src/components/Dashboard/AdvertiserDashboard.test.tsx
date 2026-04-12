import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdvertiserDashboard from './AdvertiserDashboard';
import { renderWithProviders } from '../../test-utils';

// Mock chart.js to avoid canvas rendering issues in test environment
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
}));

describe('AdvertiserDashboard', () => {
  describe('Layout and Header', () => {
    it('renders the dashboard heading', () => {
      renderWithProviders(<AdvertiserDashboard />);
      expect(screen.getByText('Advertiser Dashboard')).toBeInTheDocument();
    });

    it('renders subtitle', () => {
      renderWithProviders(<AdvertiserDashboard />);
      expect(screen.getByText(/Overview of your campaigns and vehicle performance/i)).toBeInTheDocument();
    });

    it('renders New Campaign button', () => {
      renderWithProviders(<AdvertiserDashboard />);
      expect(screen.getByRole('link', { name: /new campaign/i })).toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    it('renders all three tabs', () => {
      renderWithProviders(<AdvertiserDashboard />);
      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /campaigns/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /vehicle km/i })).toBeInTheDocument();
    });

    it('Overview tab is selected by default', () => {
      renderWithProviders(<AdvertiserDashboard />);
      expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute('aria-selected', 'true');
    });

    it('can switch to Campaigns tab', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AdvertiserDashboard />);

      await user.click(screen.getByRole('tab', { name: /campaigns/i }));
      expect(screen.getByRole('tab', { name: /campaigns/i })).toHaveAttribute('aria-selected', 'true');
    });

    it('can switch to Vehicle Km tab', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AdvertiserDashboard />);

      await user.click(screen.getByRole('tab', { name: /vehicle km/i }));
      expect(screen.getByRole('tab', { name: /vehicle km/i })).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Overview Tab', () => {
    it('renders metric cards', () => {
      renderWithProviders(<AdvertiserDashboard />);
      expect(screen.getByText('Live Campaigns')).toBeInTheDocument();
      expect(screen.getByText('Active Vehicles')).toBeInTheDocument();
      expect(screen.getByText('Km This Week')).toBeInTheDocument();
      expect(screen.getByText('Total Km Covered')).toBeInTheDocument();
    });

    it('renders correct live campaigns count', () => {
      renderWithProviders(<AdvertiserDashboard />);
      // 1 live campaign in mock data
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('renders correct active vehicles count', () => {
      renderWithProviders(<AdvertiserDashboard />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders metric change descriptions', () => {
      renderWithProviders(<AdvertiserDashboard />);
      expect(screen.getByText(/1 new this week/)).toBeInTheDocument();
      expect(screen.getByText(/\+2 from last month/)).toBeInTheDocument();
      expect(screen.getByText(/12% above target/)).toBeInTheDocument();
    });

    it('renders Weekly Km Tracking chart section', () => {
      renderWithProviders(<AdvertiserDashboard />);
      expect(screen.getByText('Weekly Km Tracking')).toBeInTheDocument();
      expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    });

    it('renders the line chart', () => {
      renderWithProviders(<AdvertiserDashboard />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('renders Campaign Timeline section', () => {
      renderWithProviders(<AdvertiserDashboard />);
      expect(screen.getByText('Campaign Timeline')).toBeInTheDocument();
    });

    it('renders campaign names in timeline', () => {
      renderWithProviders(<AdvertiserDashboard />);
      expect(screen.getByText('Diwali Sale 2024')).toBeInTheDocument();
      expect(screen.getByText('App Launch Chennai')).toBeInTheDocument();
      expect(screen.getByText('Store Opening Drive')).toBeInTheDocument();
    });

    it('renders campaign status chips', () => {
      renderWithProviders(<AdvertiserDashboard />);
      expect(screen.getByText('🟢 Live')).toBeInTheDocument();
      expect(screen.getByText('🟠 Approved')).toBeInTheDocument();
      expect(screen.getByText('⚪ Completed')).toBeInTheDocument();
    });
  });

  describe('Campaigns Tab', () => {
    async function switchToCampaignsTab() {
      const user = userEvent.setup();
      renderWithProviders(<AdvertiserDashboard />);
      await user.click(screen.getByRole('tab', { name: /campaigns/i }));
      return user;
    }

    it('renders campaign cards', async () => {
      await switchToCampaignsTab();
      expect(screen.getByText('Diwali Sale 2024')).toBeInTheDocument();
      expect(screen.getByText('App Launch Chennai')).toBeInTheDocument();
      expect(screen.getByText('Store Opening Drive')).toBeInTheDocument();
    });

    it('renders campaign budgets', async () => {
      await switchToCampaignsTab();
      expect(screen.getByText('₹16,000')).toBeInTheDocument();
      expect(screen.getByText('₹9,600')).toBeInTheDocument();
      expect(screen.getByText('₹24,000')).toBeInTheDocument();
    });

    it('renders View Details buttons', async () => {
      await switchToCampaignsTab();
      const buttons = screen.getAllByRole('button', { name: /view details/i });
      expect(buttons).toHaveLength(3);
    });

    it('renders campaign objectives', async () => {
      await switchToCampaignsTab();
      expect(screen.getByText(/Brand Awareness/)).toBeInTheDocument();
      expect(screen.getByText(/App Install/)).toBeInTheDocument();
      expect(screen.getByText(/Store Traffic/)).toBeInTheDocument();
    });
  });

  describe('Vehicle Km Tab', () => {
    async function switchToVehicleKmTab() {
      const user = userEvent.setup();
      renderWithProviders(<AdvertiserDashboard />);
      await user.click(screen.getByRole('tab', { name: /vehicle km/i }));
      return user;
    }

    it('renders per-vehicle performance section', async () => {
      await switchToVehicleKmTab();
      expect(screen.getByText(/Per-Vehicle Km Performance/i)).toBeInTheDocument();
    });

    it('renders vehicle registration numbers', async () => {
      await switchToVehicleKmTab();
      expect(screen.getByText(/TN01AB1234/)).toBeInTheDocument();
      expect(screen.getByText(/TN01CD5678/)).toBeInTheDocument();
    });

    it('renders the bar chart', async () => {
      await switchToVehicleKmTab();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('renders vehicle areas', async () => {
      await switchToVehicleKmTab();
      const tNagarElements = screen.getAllByText(/T\. Nagar/);
      expect(tNagarElements.length).toBeGreaterThan(0);
      const velacheryElements = screen.getAllByText(/Velachery/);
      expect(velacheryElements.length).toBeGreaterThan(0);
    });

    it('renders target status chips', async () => {
      await switchToVehicleKmTab();
      // Target chips contain unicode symbols and the text "On Target", "Near Target", or "Below Target"
      const targetChips = screen.getAllByText(/Target/i);
      expect(targetChips.length).toBeGreaterThan(0);
    });

    it('renders progress bars for each vehicle', async () => {
      await switchToVehicleKmTab();
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBe(5); // 5 vehicles
    });
  });
});
