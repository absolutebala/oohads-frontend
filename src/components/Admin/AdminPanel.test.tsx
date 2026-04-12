import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPanel from './AdminPanel';
import { renderWithProviders } from '../../test-utils';

// Mock chart.js to avoid canvas rendering issues in test environment
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
}));

describe('AdminPanel', () => {
  describe('Layout', () => {
    it('renders the admin panel heading', () => {
      renderWithProviders(<AdminPanel />);
      expect(screen.getByText('Admin Console')).toBeInTheDocument();
    });

    it('renders sidebar navigation items', () => {
      renderWithProviders(<AdminPanel />);
      // There are multiple "Overview" elements (sidebar + mobile tabs), use getAllByText
      const overviewElements = screen.getAllByText('Overview');
      expect(overviewElements.length).toBeGreaterThan(0);
      const ownersElements = screen.getAllByText('Owners');
      expect(ownersElements.length).toBeGreaterThan(0);
      const campaignsElements = screen.getAllByText('Campaigns');
      expect(campaignsElements.length).toBeGreaterThan(0);
      const analyticsElements = screen.getAllByText('Analytics');
      expect(analyticsElements.length).toBeGreaterThan(0);
    });
  });

  describe('Overview View (default)', () => {
    it('renders metric cards', () => {
      renderWithProviders(<AdminPanel />);
      expect(screen.getByText('Live Campaigns')).toBeInTheDocument();
      expect(screen.getByText('Active Owners')).toBeInTheDocument();
      expect(screen.getByText('Total Km Covered')).toBeInTheDocument();
      expect(screen.getByText('Gross Revenue')).toBeInTheDocument();
    });

    it('renders weekly km chart', () => {
      renderWithProviders(<AdminPanel />);
      expect(screen.getByText('Weekly Km Tracking')).toBeInTheDocument();
    });

    it('renders revenue trend chart', () => {
      renderWithProviders(<AdminPanel />);
      expect(screen.getByText('Monthly Revenue Trend')).toBeInTheDocument();
    });

    it('renders fleet composition chart', () => {
      renderWithProviders(<AdminPanel />);
      // Fleet Mix appears in overview
      const fleetMixElements = screen.getAllByText('Fleet Mix');
      expect(fleetMixElements.length).toBeGreaterThan(0);
    });
  });

  describe('Owners View', () => {
    async function navigateToOwnersView() {
      const user = userEvent.setup();
      renderWithProviders(<AdminPanel />);
      // Click the sidebar "Owners" item
      const ownersElements = screen.getAllByText('Owners');
      await user.click(ownersElements[0]);
      return user;
    }

    it('renders the Add New Owner form heading', async () => {
      await navigateToOwnersView();
      expect(screen.getByText(/Add New Owner/i)).toBeInTheDocument();
    });

    it('renders owner form fields', async () => {
      await navigateToOwnersView();
      expect(screen.getByLabelText(/Owner Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Registration Number/i)).toBeInTheDocument();
    });

    it('renders existing owner list', async () => {
      await navigateToOwnersView();
      expect(screen.getByText('Rajan Kumar')).toBeInTheDocument();
      expect(screen.getByText('Priya Selvam')).toBeInTheDocument();
      expect(screen.getByText('Murugan P')).toBeInTheDocument();
    });

    it('renders owner status indicators', async () => {
      await navigateToOwnersView();
      const activeChips = screen.getAllByText('active');
      expect(activeChips.length).toBeGreaterThan(0);
    });

    it('renders owner vehicle registration numbers', async () => {
      await navigateToOwnersView();
      expect(screen.getByText(/TN01AB1234/)).toBeInTheDocument();
      expect(screen.getByText(/TN01CD5678/)).toBeInTheDocument();
    });

    it('shows validation error when submitting empty owner form', async () => {
      const user = await navigateToOwnersView();
      await user.click(screen.getByRole('button', { name: /add owner/i }));
      // Should show validation error
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  describe('Campaigns View', () => {
    async function navigateToCampaignsView() {
      const user = userEvent.setup();
      renderWithProviders(<AdminPanel />);
      const campaignsElements = screen.getAllByText('Campaigns');
      await user.click(campaignsElements[0]);
      return user;
    }

    it('renders campaign list', async () => {
      await navigateToCampaignsView();
      expect(screen.getByText('Diwali Sale 2024')).toBeInTheDocument();
      expect(screen.getByText('App Launch Chennai')).toBeInTheDocument();
      expect(screen.getByText('Store Opening Drive')).toBeInTheDocument();
    });

    it('renders campaign advertiser names', async () => {
      await navigateToCampaignsView();
      expect(screen.getByText(/Big Bazaar Chennai/)).toBeInTheDocument();
      expect(screen.getByText(/Swiggy India/)).toBeInTheDocument();
    });

    it('renders campaign status labels', async () => {
      await navigateToCampaignsView();
      expect(screen.getByText('🟢 Live')).toBeInTheDocument();
      expect(screen.getByText('✅ Approved')).toBeInTheDocument();
      expect(screen.getByText('⚪ Completed')).toBeInTheDocument();
    });

    it('renders campaign budgets', async () => {
      await navigateToCampaignsView();
      expect(screen.getByText(/₹16,000/)).toBeInTheDocument();
      expect(screen.getByText(/₹9,600/)).toBeInTheDocument();
    });
  });

  describe('Analytics View', () => {
    async function navigateToAnalyticsView() {
      const user = userEvent.setup();
      renderWithProviders(<AdminPanel />);
      const analyticsElements = screen.getAllByText('Analytics');
      await user.click(analyticsElements[0]);
      return user;
    }

    it('renders analytics charts', async () => {
      await navigateToAnalyticsView();
      expect(screen.getByText(/Revenue Trend/i)).toBeInTheDocument();
    });

    it('renders km activity chart', async () => {
      await navigateToAnalyticsView();
      expect(screen.getByText('Weekly Km Activity')).toBeInTheDocument();
    });

    it('renders fleet mix chart', async () => {
      await navigateToAnalyticsView();
      const fleetMixElements = screen.getAllByText('Fleet Mix');
      expect(fleetMixElements.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation between views', () => {
    it('can switch between all views', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AdminPanel />);

      // Go to Owners
      const ownersElements = screen.getAllByText('Owners');
      await user.click(ownersElements[0]);
      expect(screen.getByText(/Add New Owner/i)).toBeInTheDocument();

      // Go to Campaigns
      const campaignsElements = screen.getAllByText('Campaigns');
      await user.click(campaignsElements[0]);
      expect(screen.getByText('Diwali Sale 2024')).toBeInTheDocument();

      // Go to Analytics
      const analyticsElements = screen.getAllByText('Analytics');
      await user.click(analyticsElements[0]);
      expect(screen.getByText(/Revenue Trend/i)).toBeInTheDocument();

      // Back to Overview
      const overviewElements = screen.getAllByText('Overview');
      await user.click(overviewElements[0]);
      expect(screen.getByText('Live Campaigns')).toBeInTheDocument();
    });
  });
});
