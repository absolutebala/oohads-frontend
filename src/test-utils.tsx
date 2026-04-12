import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme';

/**
 * Renders a component wrapped in all necessary providers for testing.
 */
export function renderWithProviders(
  ui: React.ReactElement,
  { route = '/' }: { route?: string } = {}
) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </ThemeProvider>
  );
}
