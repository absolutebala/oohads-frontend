import React from 'react';
import { render, screen } from '@testing-library/react';
import Homepage from './Homepage';
import { renderWithProviders } from '../../test-utils';

describe('Homepage', () => {
  it('renders the hero section with brand name and tagline', () => {
    renderWithProviders(<Homepage />);
    expect(screen.getByText(/Turn Every Auto & Taxi Into a/i)).toBeInTheDocument();
    expect(screen.getByText('Moving Billboard')).toBeInTheDocument();
  });

  it('renders the "Now in Chennai" chip', () => {
    renderWithProviders(<Homepage />);
    expect(screen.getByText(/Now in Chennai/)).toBeInTheDocument();
  });

  it('renders hero description text', () => {
    renderWithProviders(<Homepage />);
    expect(
      screen.getByText(/AdRide connects advertisers with Chennai/i)
    ).toBeInTheDocument();
  });

  it('renders "Start a Campaign" CTA button', () => {
    renderWithProviders(<Homepage />);
    const buttons = screen.getAllByRole('link', { name: /start a campaign/i });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders "Register Your Vehicle" CTA button', () => {
    renderWithProviders(<Homepage />);
    expect(
      screen.getByRole('link', { name: /register your vehicle/i })
    ).toBeInTheDocument();
  });

  it('renders all stats', () => {
    renderWithProviders(<Homepage />);
    expect(screen.getByText('5,000+')).toBeInTheDocument();
    expect(screen.getByText('2M+')).toBeInTheDocument();
    expect(screen.getByText('₹3,000')).toBeInTheDocument();
    expect(screen.getByText('50+')).toBeInTheDocument();
  });

  it('renders all stat labels', () => {
    renderWithProviders(<Homepage />);
    expect(screen.getByText('Vehicles on network')).toBeInTheDocument();
    expect(screen.getByText('Daily commuters reached')).toBeInTheDocument();
    expect(screen.getByText('Avg. monthly owner earning')).toBeInTheDocument();
    expect(screen.getByText('Active brand campaigns')).toBeInTheDocument();
  });

  it('renders the "Why AdRide" features section heading', () => {
    renderWithProviders(<Homepage />);
    expect(screen.getByText('Why AdRide')).toBeInTheDocument();
    expect(screen.getByText(/Everything you need to run/i)).toBeInTheDocument();
  });

  it('renders all 6 feature cards', () => {
    renderWithProviders(<Homepage />);
    expect(screen.getByText('Hyperlocal Targeting')).toBeInTheDocument();
    expect(screen.getByText('Real-Time Km Tracking')).toBeInTheDocument();
    expect(screen.getByText('Campaign Analytics')).toBeInTheDocument();
    expect(screen.getByText('Verified Fleet')).toBeInTheDocument();
    expect(screen.getByText('Cost-Effective Reach')).toBeInTheDocument();
    expect(screen.getByText('Easy Campaign Booking')).toBeInTheDocument();
  });

  it('renders the "How it works" section', () => {
    renderWithProviders(<Homepage />);
    expect(screen.getByText('How it works')).toBeInTheDocument();
    expect(screen.getByText('Simple for everyone')).toBeInTheDocument();
  });

  it('renders advertiser how-it-works steps', () => {
    renderWithProviders(<Homepage />);
    expect(screen.getByText('For Advertisers')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByText('Choose Vehicles')).toBeInTheDocument();
    expect(screen.getByText('Upload Artwork')).toBeInTheDocument();
    expect(screen.getByText('Go Live')).toBeInTheDocument();
  });

  it('renders vehicle owner how-it-works steps', () => {
    renderWithProviders(<Homepage />);
    expect(screen.getByText('For Vehicle Owners')).toBeInTheDocument();
    // "Register Your Vehicle" appears both as a step title and a button
    const registerTexts = screen.getAllByText('Register Your Vehicle');
    expect(registerTexts.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Get Approved')).toBeInTheDocument();
    expect(screen.getByText('Ad Gets Installed')).toBeInTheDocument();
    expect(screen.getByText('Earn Monthly')).toBeInTheDocument();
  });

  it('renders "Book a Campaign" link for advertisers', () => {
    renderWithProviders(<Homepage />);
    expect(
      screen.getByRole('link', { name: /book a campaign/i })
    ).toBeInTheDocument();
  });

  it('renders "Register My Vehicle" link for owners', () => {
    renderWithProviders(<Homepage />);
    expect(
      screen.getByRole('link', { name: /register my vehicle/i })
    ).toBeInTheDocument();
  });

  it('renders the CTA banner section', () => {
    renderWithProviders(<Homepage />);
    expect(
      screen.getByText(/Ready to put your brand on the move/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /get started free/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /view demo dashboard/i })
    ).toBeInTheDocument();
  });

  it('renders the footer with copyright', () => {
    renderWithProviders(<Homepage />);
    expect(screen.getByText(/© 2024 AdRide. All rights reserved./)).toBeInTheDocument();
  });

  it('has correct link destinations for CTA buttons', () => {
    renderWithProviders(<Homepage />);
    const campaignLinks = screen.getAllByRole('link', { name: /start a campaign/i });
    expect(campaignLinks[0]).toHaveAttribute('href', '/campaign');

    const vehicleLink = screen.getByRole('link', { name: /register your vehicle/i });
    expect(vehicleLink).toHaveAttribute('href', '/login');
  });
});
