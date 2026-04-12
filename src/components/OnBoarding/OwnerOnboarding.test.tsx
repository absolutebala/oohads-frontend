import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OwnerOnboarding from './OwnerOnboarding';
import { renderWithProviders } from '../../test-utils';

describe('OwnerOnboarding', () => {
  describe('Step 0: Personal Details', () => {
    it('renders the heading', () => {
      renderWithProviders(<OwnerOnboarding />);
      expect(screen.getByText('Vehicle Owner Registration')).toBeInTheDocument();
    });

    it('shows step indicator as Step 1 of 4', () => {
      renderWithProviders(<OwnerOnboarding />);
      expect(screen.getByText(/Step 1 of 4/)).toBeInTheDocument();
    });

    it('renders personal details form fields', () => {
      renderWithProviders(<OwnerOnboarding />);
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    });

    it('renders Next and Back buttons', () => {
      renderWithProviders(<OwnerOnboarding />);
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('Back button is disabled on first step', () => {
      renderWithProviders(<OwnerOnboarding />);
      expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
    });

    it('shows error when name is empty and Next is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<OwnerOnboarding />);

      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    });

    it('shows error for invalid phone number', async () => {
      const user = userEvent.setup();
      renderWithProviders(<OwnerOnboarding />);

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Phone Number/i), '123');
      await user.click(screen.getByRole('button', { name: /next/i }));

      expect(screen.getByText(/Valid 10-digit phone is required/i)).toBeInTheDocument();
    });

    it('navigates to step 2 with valid input', async () => {
      const user = userEvent.setup();
      renderWithProviders(<OwnerOnboarding />);

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Phone Number/i), '9876543210');
      await user.click(screen.getByRole('button', { name: /next/i }));

      expect(screen.getByText(/Step 2 of 4/)).toBeInTheDocument();
      // "Vehicle Details" appears both as step label and section heading
      const vehicleDetails = screen.getAllByText('Vehicle Details');
      expect(vehicleDetails.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Step 1: Vehicle Details', () => {
    async function navigateToStep1() {
      const user = userEvent.setup();
      renderWithProviders(<OwnerOnboarding />);

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Phone Number/i), '9876543210');
      await user.click(screen.getByRole('button', { name: /next/i }));

      return user;
    }

    it('renders vehicle type selection', async () => {
      await navigateToStep1();
      expect(screen.getByText('Auto Rickshaw')).toBeInTheDocument();
      expect(screen.getByText('Taxi / Cab')).toBeInTheDocument();
    });

    it('renders registration number field', async () => {
      await navigateToStep1();
      expect(screen.getByLabelText(/Registration Number/i)).toBeInTheDocument();
    });

    it('renders operating areas dropdown', async () => {
      await navigateToStep1();
      const areasElements = screen.getAllByText(/Operating Areas/i);
      expect(areasElements.length).toBeGreaterThan(0);
    });

    it('renders vehicle photo upload section', async () => {
      await navigateToStep1();
      expect(screen.getByText('Vehicle Photo')).toBeInTheDocument();
    });

    it('shows error when vehicle type not selected', async () => {
      const user = await navigateToStep1();
      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText(/Please select vehicle type/i)).toBeInTheDocument();
    });

    it('can go back to step 0', async () => {
      const user = await navigateToStep1();
      await user.click(screen.getByRole('button', { name: /back/i }));
      expect(screen.getByText(/Step 1 of 4/)).toBeInTheDocument();
    });
  });

  describe('Step 2: Documents & Pricing', () => {
    async function navigateToStep2() {
      const user = userEvent.setup();
      renderWithProviders(<OwnerOnboarding />);

      // Step 0: Personal Details
      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Phone Number/i), '9876543210');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 1: Vehicle Details
      await user.click(screen.getByText('Auto Rickshaw'));
      await user.type(screen.getByLabelText(/Registration Number/i), 'TN01AB1234');

      // Select an operating area using the MUI Select
      const areasLabels = screen.getAllByText(/Operating Areas/i);
      const areasFormControl = areasLabels[0].closest('.MuiFormControl-root')!;
      const selectInput = within(areasFormControl as HTMLElement).getByRole('combobox');
      await user.click(selectInput);
      const listbox = await screen.findByRole('listbox');
      await user.click(within(listbox).getByText('Anna Nagar'));
      // Close dropdown by pressing Escape
      await user.keyboard('{Escape}');

      await user.click(screen.getByRole('button', { name: /next/i }));

      return user;
    }

    it('renders documents section heading', async () => {
      await navigateToStep2();
      const headings = screen.getAllByText('Documents & Pricing');
      expect(headings.length).toBeGreaterThanOrEqual(1);
    });

    it('renders UPI ID and monthly rate fields', async () => {
      await navigateToStep2();
      expect(screen.getByLabelText(/UPI ID/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Expected Monthly Rate/i)).toBeInTheDocument();
    });

    it('renders document upload areas', async () => {
      await navigateToStep2();
      expect(screen.getByText(/RC Book/i)).toBeInTheDocument();
      expect(screen.getByText(/Insurance Document/i)).toBeInTheDocument();
    });

    it('shows error when UPI ID is empty', async () => {
      const user = await navigateToStep2();
      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText(/UPI ID is required/i)).toBeInTheDocument();
    });
  });

  describe('Step 3: Review & Submit', () => {
    async function navigateToStep3() {
      const user = userEvent.setup();
      renderWithProviders(<OwnerOnboarding />);

      // Step 0
      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
      await user.type(screen.getByLabelText(/Phone Number/i), '9876543210');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 1
      await user.click(screen.getByText('Auto Rickshaw'));
      await user.type(screen.getByLabelText(/Registration Number/i), 'TN01AB1234');
      const areasLabels = screen.getAllByText(/Operating Areas/i);
      const areasFormControl = areasLabels[0].closest('.MuiFormControl-root')!;
      const selectInput = within(areasFormControl as HTMLElement).getByRole('combobox');
      await user.click(selectInput);
      const listbox = await screen.findByRole('listbox');
      await user.click(within(listbox).getByText('Anna Nagar'));
      await user.keyboard('{Escape}');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 2
      await user.type(screen.getByLabelText(/UPI ID/i), 'john@upi');
      await user.type(screen.getByLabelText(/Expected Monthly Rate/i), '3000');
      await user.click(screen.getByRole('button', { name: /next/i }));

      return user;
    }

    it('renders review heading', async () => {
      await navigateToStep3();
      expect(screen.getByText('Review Your Details')).toBeInTheDocument();
    });

    it('displays submitted personal details', async () => {
      await navigateToStep3();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('+91 9876543210')).toBeInTheDocument();
    });

    it('displays submitted vehicle details', async () => {
      await navigateToStep3();
      expect(screen.getByText('AUTO')).toBeInTheDocument();
      expect(screen.getByText('TN01AB1234')).toBeInTheDocument();
    });

    it('displays pricing details', async () => {
      await navigateToStep3();
      expect(screen.getByText('john@upi')).toBeInTheDocument();
      expect(screen.getByText('₹3000')).toBeInTheDocument();
    });

    it('renders Submit Registration button', async () => {
      await navigateToStep3();
      expect(screen.getByRole('button', { name: /submit registration/i })).toBeInTheDocument();
    });

    it('shows terms notice', async () => {
      await navigateToStep3();
      expect(screen.getByText(/Terms of Service and Privacy Policy/i)).toBeInTheDocument();
    });

    it('shows success screen after submission', async () => {
      const user = await navigateToStep3();
      await user.click(screen.getByRole('button', { name: /submit registration/i }));

      await waitFor(() => {
        expect(screen.getByText('Registration Submitted!')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Progress bar', () => {
    it('renders the progress bar', () => {
      renderWithProviders(<OwnerOnboarding />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders step labels', () => {
      renderWithProviders(<OwnerOnboarding />);
      // "Personal Details" appears both as a step label and form heading
      const personalDetails = screen.getAllByText('Personal Details');
      expect(personalDetails.length).toBeGreaterThanOrEqual(1);
    });
  });
});
