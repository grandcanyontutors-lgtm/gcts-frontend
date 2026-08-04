'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  LockReset,
  Email,
  Lock,
  Pin,
  ArrowBack,
  Visibility,
  VisibilityOff,
  CheckCircle,
} from '@mui/icons-material';
import Link from 'next/link';
import { APIClient } from '@/lib/api';
import { brand, cardSx, primaryButtonSx, Mark, PageShell } from '@/lib/brand';

type Step = 'email' | 'reset';

export default function ResetPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Step 1: request an OTP for the account's email.
  const handleRequestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // is_account: true ensures the backend rejects unknown emails.
      await APIClient.post('/generate-otp/', { email, is_account: true });
      setStep('reset');
    } catch (err: any) {
      setError(err?.message || 'Failed to send the verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: verify the OTP, then reset the password.
  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Verify the code first so we never reset without a valid OTP.
      await APIClient.post('/verify-otp/', { email, otp, is_account: true });
      // OTP verified -> set the new password.
      await APIClient.post('/auth/reset-password/', { email, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError('');
    try {
      await APIClient.post('/generate-otp/', { email, is_account: true });
    } catch (err: any) {
      setError(err?.message || 'Failed to resend the verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const cardWrapSx = {
    ...cardSx,
    width: '100%',
    maxWidth: 460,
    mx: 'auto',
    p: { xs: 3, md: 5 },
  } as const;

  const shellSx = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    px: 2,
    py: { xs: 6, md: 8 },
  } as const;

  if (success) {
    return (
      <PageShell>
        <Box sx={shellSx}>
          <Box sx={{ ...cardWrapSx, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 56, color: 'success.main', mb: 2 }} />
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 26, md: 30 },
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: brand.ink,
              }}
            >
              Password <Mark>updated</Mark>
            </Typography>
            <Typography sx={{ mt: 2, mb: 4, fontSize: 16, fontWeight: 500, color: brand.body }}>
              Your password for <strong>{email}</strong> has been updated. You can now sign in with
              your new password.
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              component={Link}
              href="/login"
              fullWidth
              sx={{ ...primaryButtonSx, py: 1.3, fontSize: 16 }}
            >
              Back to Sign In
            </Button>
          </Box>
        </Box>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Box sx={shellSx}>
        <Box sx={cardWrapSx}>
          <Box sx={{ mb: 4 }}>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 28, md: 32 },
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                color: brand.ink,
              }}
            >
              Reset <Mark>password</Mark>
            </Typography>
            <Typography sx={{ mt: 1.5, fontSize: 16, fontWeight: 500, color: brand.body }}>
              {step === 'email'
                ? "Enter your email address and we'll send you a verification code to reset your password."
                : `Enter the verification code sent to ${email} and choose a new password.`}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {step === 'email' ? (
            <Box component="form" onSubmit={handleRequestOtp}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: brand.purple }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ ...primaryButtonSx, mt: 3, mb: 1, py: 1.3, fontSize: 16 }}
              >
                {isLoading ? 'Sending…' : 'Send Verification Code'}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleResetPassword}>
              <TextField
                fullWidth
                label="Verification Code"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Pin sx={{ color: brand.purple }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="New Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: brand.purple }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: brand.purple }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ ...primaryButtonSx, mt: 3, mb: 1.5, py: 1.3, fontSize: 16 }}
              >
                {isLoading ? 'Resetting…' : 'Reset Password'}
              </Button>

              <Button
                fullWidth
                variant="text"
                size="small"
                disabled={isLoading}
                onClick={handleResendOtp}
                sx={{ mb: 1, fontWeight: 700, color: brand.purple }}
              >
                Resend Code
              </Button>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <MuiLink
              component={Link}
              href="/login"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                fontSize: 14,
                fontWeight: 700,
                color: brand.purple,
              }}
            >
              <ArrowBack fontSize="small" />
              Back to Sign In
            </MuiLink>
          </Box>
        </Box>
      </Box>
    </PageShell>
  );
}
