import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../src/pages/LoginPage.js';
import SignupPage from '../src/pages/SignupPage.js';

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('LoginPage validation', () => {
  it('shows validation errors when submitting empty fields', async () => {
    wrap(<LoginPage />);
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
});

describe('SignupPage validation', () => {
  it('flags mismatched passwords', async () => {
    wrap(<SignupPage />);
    await userEvent.type(screen.getByLabelText('Email'), 'op@grid.test');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm'), 'different123');
    await userEvent.type(screen.getByLabelText('Callsign'), 'NEON-1');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });
});
