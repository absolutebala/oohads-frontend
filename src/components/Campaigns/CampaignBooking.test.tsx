import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CampaignBooking from './CampaignBooking';
import { renderWithProviders } from '../../test-utils';

describe('CampaignBooking', () => {
  describe('Step 0: Select Vehicles', () => {
    it('renders the booking heading', () => {
      renderWithProviders(<CampaignBooking />);
      expect(screen.getByText('Book a Campaign')).toBeInTheDocument();
    });

    it('shows step indicator', () => {
      renderWithProviders(<CampaignBooking />);
      expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();
    });

    it('renders available vehicles heading', () => {
      renderWithProviders(<CampaignBooking />);
      expect(screen.getByText('Available Vehicles')).toBeInTheDocument();
    });

    it('renders area filter dropdown', () => {
      renderWithProviders(<CampaignBooking />);
      const filters = screen.getAllByText('Filter by Area');
      expect(filters.length).toBeGreaterThan(0);
    });

    it('renders vehicle cards with registration numbers', () => {
      renderWithProviders(<CampaignBooking />);
      expect(screen.getByText('TN01AB1234')).toBeInTheDocument();
      expect(screen.getByText('TN01CD5678')).toBeInTheDocument();
      expect(screen.getByText('TN01EF9012')).toBeInTheDocument();
    });

    it('renders vehicle owner names', () => {
      renderWithProviders(<CampaignBooking />);
      expect(screen.getByText(/Rajan Kumar/)).toBeInTheDocument();
      expect(screen.getByText(/Priya Selvam/)).toBeInTheDocument();
    });

    it('renders progress bar', () => {
      renderWithProviders(<CampaignBooking />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders step labels', () => {
      renderWithProviders(<CampaignBooking />);
      expect(screen.getByText('Select Vehicles')).toBeInTheDocument();
      expect(screen.getByText('Campaign Details')).toBeInTheDocument();
      expect(screen.getByText('Upload Artwork')).toBeInTheDocument();
    });

    it('shows error when trying to proceed without selecting vehicles', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CampaignBooking />);

      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText(/select at least one vehicle/i)).toBeInTheDocument();
    });

    it('shows cost summary sidebar', () => {
      renderWithProviders(<CampaignBooking />);
      expect(screen.getByText(/Cost Summary/i)).toBeInTheDocument();
    });
  });

  describe('Vehicle selection', () => {
    it('can select a vehicle by clicking on its card', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CampaignBooking />);

      // Click the checkbox for first vehicle
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      // Now should be able to proceed
      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText(/Step 2 of 5/i)).toBeInTheDocument();
    });
  });

  describe('Step 1: Campaign Details', () => {
    async function navigateToStep1() {
      const user = userEvent.setup();
      renderWithProviders(<CampaignBooking />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(screen.getByRole('button', { name: /next/i }));

      return user;
    }

    it('renders campaign details form', async () => {
      await navigateToStep1();
      const detailsElements = screen.getAllByText('Campaign Details');
      expect(detailsElements.length).toBeGreaterThan(0);
    });

    it('renders campaign name field', async () => {
      await navigateToStep1();
      expect(screen.getByLabelText(/Campaign Name/i)).toBeInTheDocument();
    });

    it('renders start date field', async () => {
      await navigateToStep1();
      expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
    });

    it('renders objective selection', async () => {
      await navigateToStep1();
      const objectiveElements = screen.getAllByText('Campaign Objective *');
      expect(objectiveElements.length).toBeGreaterThan(0);
    });

    it('renders duration slider', async () => {
      await navigateToStep1();
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('shows error when campaign name is empty', async () => {
      const user = await navigateToStep1();
      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText(/campaign name is required/i)).toBeInTheDocument();
    });

    it('can go back to vehicle selection', async () => {
      const user = await navigateToStep1();
      await user.click(screen.getByRole('button', { name: /back/i }));
      expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();
    });
  });
});
