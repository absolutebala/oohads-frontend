import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import { renderWithProviders } from '../../test-utils';

describe('Login', () => {
  describe('Step 1: Role Selection', () => {
    it('renders the welcome heading', () => {
      renderWithProviders(<Login />);
      expect(screen.getByText('Welcome to AdRide')).toBeInTheDocument();
    });

    it('renders role selection options', () => {
      renderWithProviders(<Login />);
      expect(screen.getByText('Advertiser')).toBeInTheDocument();
      expect(screen.getByText('Vehicle Owner')).toBeInTheDocument();
    });

    it('renders role descriptions', () => {
      renderWithProviders(<Login />);
      expect(screen.getByText('Run ad campaigns')).toBeInTheDocument();
      expect(screen.getByText('Earn from your vehicle')).toBeInTheDocument();
    });

    it('renders Continue button', () => {
      renderWithProviders(<Login />);
      expect(screen.getByRole('button', { name: /continue →/i })).toBeInTheDocument();
    });

    it('renders Google sign-in button', () => {
      renderWithProviders(<Login />);
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });

    it('navigates to phone step when Continue is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      await user.click(screen.getByRole('button', { name: /continue →/i }));
      expect(screen.getByText('Enter your number')).toBeInTheDocument();
    });

    it('navigates to profile step when Google sign-in is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      await user.click(screen.getByRole('button', { name: /continue with google/i }));

      await waitFor(() => {
        expect(screen.getByText('Complete your profile')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Step 2: Phone Number', () => {
    it('shows phone number input after clicking Continue', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      await user.click(screen.getByRole('button', { name: /continue →/i }));
      expect(screen.getByPlaceholderText('10-digit mobile number')).toBeInTheDocument();
    });

    it('shows +91 country code prefix', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      await user.click(screen.getByRole('button', { name: /continue →/i }));
      expect(screen.getByDisplayValue('+91')).toBeInTheDocument();
    });

    it('shows Send OTP button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      await user.click(screen.getByRole('button', { name: /continue →/i }));
      expect(screen.getByRole('button', { name: /send otp/i })).toBeInTheDocument();
    });

    it('shows error for invalid phone number', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      await user.click(screen.getByRole('button', { name: /continue →/i }));
      await user.type(screen.getByPlaceholderText('10-digit mobile number'), '12345');
      await user.click(screen.getByRole('button', { name: /send otp/i }));

      expect(screen.getByText(/valid 10-digit phone number/i)).toBeInTheDocument();
    });

    it('shows Back button that goes to role selection', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      await user.click(screen.getByRole('button', { name: /continue →/i }));
      await user.click(screen.getByRole('button', { name: /← back/i }));

      expect(screen.getByText('Welcome to AdRide')).toBeInTheDocument();
    });

    it('navigates to OTP step with valid phone', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      await user.click(screen.getByRole('button', { name: /continue →/i }));
      await user.type(screen.getByPlaceholderText('10-digit mobile number'), '9876543210');
      await user.click(screen.getByRole('button', { name: /send otp/i }));

      await waitFor(() => {
        expect(screen.getByText('Verify OTP')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Step 3: OTP Verification', () => {
    async function navigateToOtpStep() {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      await user.click(screen.getByRole('button', { name: /continue →/i }));
      await user.type(screen.getByPlaceholderText('10-digit mobile number'), '9876543210');
      await user.click(screen.getByRole('button', { name: /send otp/i }));

      await waitFor(() => {
        expect(screen.getByText('Verify OTP')).toBeInTheDocument();
      }, { timeout: 2000 });

      return user;
    }

    it('shows the phone number the OTP was sent to', async () => {
      await navigateToOtpStep();
      expect(screen.getByText(/9876543210/)).toBeInTheDocument();
    });

    it('renders 6 OTP input fields', async () => {
      await navigateToOtpStep();
      for (let i = 0; i < 6; i++) {
        expect(document.getElementById(`otp-${i}`)).toBeInTheDocument();
      }
    });

    it('shows Verify & Continue button', async () => {
      await navigateToOtpStep();
      expect(screen.getByRole('button', { name: /verify & continue/i })).toBeInTheDocument();
    });

    it('shows error when OTP is incomplete', async () => {
      const user = await navigateToOtpStep();

      await user.click(screen.getByRole('button', { name: /verify & continue/i }));
      expect(screen.getByText(/enter all 6 OTP digits/i)).toBeInTheDocument();
    });

    it('shows Resend OTP button', async () => {
      await navigateToOtpStep();
      expect(screen.getByRole('button', { name: /resend otp/i })).toBeInTheDocument();
    });

    it('navigates to profile step with valid OTP', async () => {
      const user = await navigateToOtpStep();

      // Type digits one by one into each OTP field
      for (let i = 0; i < 6; i++) {
        const input = document.getElementById(`otp-${i}`) as HTMLInputElement;
        await user.type(input, String(i + 1));
      }

      await user.click(screen.getByRole('button', { name: /verify & continue/i }));

      await waitFor(() => {
        expect(screen.getByText('Complete your profile')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Step 4: Profile Completion', () => {
    async function navigateToProfileStep() {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      // Use Google login for faster navigation to profile
      await user.click(screen.getByRole('button', { name: /continue with google/i }));

      await waitFor(() => {
        expect(screen.getByText('Complete your profile')).toBeInTheDocument();
      }, { timeout: 2000 });

      return user;
    }

    it('shows Full name and Email fields', async () => {
      await navigateToProfileStep();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('shows Create Account button', async () => {
      await navigateToProfileStep();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('shows error when name is empty', async () => {
      const user = await navigateToProfileStep();
      await user.click(screen.getByRole('button', { name: /create account/i }));
      expect(screen.getByText(/enter your name/i)).toBeInTheDocument();
    });

    it('navigates to success step with valid name', async () => {
      const user = await navigateToProfileStep();
      await user.type(screen.getByLabelText(/full name/i), 'Test User');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText("You're all set!")).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Step 5: Success', () => {
    async function navigateToSuccessStep() {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      await user.click(screen.getByRole('button', { name: /continue with google/i }));

      await waitFor(() => {
        expect(screen.getByText('Complete your profile')).toBeInTheDocument();
      }, { timeout: 2000 });

      await user.type(screen.getByLabelText(/full name/i), 'Test User');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText("You're all set!")).toBeInTheDocument();
      }, { timeout: 2000 });

      return user;
    }

    it('shows the user name in success message', async () => {
      await navigateToSuccessStep();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('shows role badge for advertiser', async () => {
      await navigateToSuccessStep();
      expect(screen.getByText(/Advertiser/)).toBeInTheDocument();
    });

    it('shows "Start a Campaign" button for advertiser role', async () => {
      await navigateToSuccessStep();
      expect(screen.getByRole('link', { name: /start a campaign/i })).toBeInTheDocument();
    });

    it('shows "Go to Dashboard" link', async () => {
      await navigateToSuccessStep();
      expect(screen.getByRole('link', { name: /go to dashboard/i })).toBeInTheDocument();
    });

    it('shows "Sign in with a different account" button', async () => {
      await navigateToSuccessStep();
      expect(screen.getByRole('button', { name: /sign in with a different account/i })).toBeInTheDocument();
    });

    it('resets to role step when "Sign in with a different account" is clicked', async () => {
      const user = await navigateToSuccessStep();
      await user.click(screen.getByRole('button', { name: /sign in with a different account/i }));
      expect(screen.getByText('Welcome to AdRide')).toBeInTheDocument();
    });
  });

  describe('Left branding panel', () => {
    it('renders the AdRide brand name', () => {
      renderWithProviders(<Login />);
      // The brand name appears in the left panel
      expect(screen.getByText('Hyperlocal advertising platform')).toBeInTheDocument();
    });

    it('renders the feature bullets', () => {
      renderWithProviders(<Login />);
      expect(screen.getByText(/Reach lakhs of daily commuters/)).toBeInTheDocument();
      expect(screen.getByText(/Real-time km tracking & analytics/)).toBeInTheDocument();
      expect(screen.getByText(/Chennai's largest auto & taxi network/)).toBeInTheDocument();
    });
  });
});
