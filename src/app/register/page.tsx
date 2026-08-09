'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  Alert,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { APIClient } from '@/lib/api';
import { brand, cardSx, primaryButtonSx, outlineButtonSx, Mark, PageShell } from '@/lib/brand';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Signup is two steps: fill in the details, then prove the address is real
  // by entering the emailed code. The account is only created at the end, so
  // abandoning the second step leaves nothing behind.
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState('');

  // Redirect once authenticated (mirrors the login page behaviour).
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Step 1 — validate the details locally, then have a code emailed.
  const handleDetailsSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    try {
      await APIClient.post('/generate-otp/', { email: formData.email });
      setStep('verify');
      setNotice(`We sent an 8-character code to ${formData.email}.`);
    } catch (err: any) {
      setError(err?.message || 'Could not send the verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 — exchange the code for a verification token, then create the account.
  const handleVerifySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsLoading(true);

    try {
      const verification = await APIClient.post<{ verificationToken?: string }>(
        '/verify-otp/',
        { email: formData.email, otp: code.trim() }
      );

      if (!verification?.verificationToken) {
        throw new Error('Verification failed. Please request a new code.');
      }

      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'student',
        verificationToken: verification.verificationToken,
      });
      // On success the user is logged in; redirect happens via useEffect above.
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setNotice('');
    setIsLoading(true);
    try {
      await APIClient.post('/generate-otp/', { email: formData.email });
      setNotice('A new code is on its way.');
    } catch (err: any) {
      setError(err?.message || 'Could not resend the code. Please try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <PageShell>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: { xs: 6, md: 8 },
        }}
      >
        <Box
          sx={{
            ...cardSx,
            width: '100%',
            maxWidth: 520,
            mx: 'auto',
            p: { xs: 3, md: 5 },
          }}
        >
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
              {step === 'details' ? (
                <>Create your <Mark>account</Mark></>
              ) : (
                <>Check your <Mark>email</Mark></>
              )}
            </Typography>
            <Typography sx={{ mt: 1.5, fontSize: 16, fontWeight: 500, color: brand.body }}>
              {step === 'details'
                ? 'Join GCTS today and get expert help with your work.'
                : `Enter the code we sent to ${formData.email} to finish creating your account.`}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {notice && !error && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {notice}
            </Alert>
          )}

          {step === 'verify' && (
            <Box component="form" onSubmit={handleVerifySubmit}>
              <TextField
                fullWidth
                label="Verification code"
                name="otp"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                autoFocus
                autoComplete="one-time-code"
                inputProps={{ maxLength: 8 }}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: brand.purple }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Typography sx={{ mt: 1, fontSize: 13, fontWeight: 500, color: brand.body }}>
                The code expires in 15 minutes.
              </Typography>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading || !code.trim()}
                sx={{ ...primaryButtonSx, mt: 3, py: 1.3, fontSize: 16 }}
              >
                {isLoading ? 'Verifying…' : 'Verify and create account'}
              </Button>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  fullWidth
                  onClick={handleResend}
                  disabled={isLoading}
                  sx={{ ...outlineButtonSx, py: 1 }}
                >
                  Resend code
                </Button>
                <Button
                  fullWidth
                  onClick={() => {
                    setStep('details');
                    setCode('');
                    setError('');
                    setNotice('');
                  }}
                  disabled={isLoading}
                  sx={{ ...outlineButtonSx, py: 1 }}
                >
                  Change email
                </Button>
              </Box>
            </Box>
          )}

          <Box
            component="form"
            onSubmit={handleDetailsSubmit}
            sx={{ display: step === 'details' ? 'block' : 'none' }}
          >
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: brand.purple }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: brand.purple }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
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

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
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
                      onClick={togglePasswordVisibility}
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
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
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
                      aria-label="toggle confirm password visibility"
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  sx={{ color: brand.purple, '&.Mui-checked': { color: brand.purple } }}
                />
              }
              label={
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: brand.body }}>
                  I agree to the{' '}
                  <MuiLink href="/terms" target="_blank" sx={{ fontWeight: 700, color: brand.purple }}>
                    Terms and Conditions
                  </MuiLink>
                </Typography>
              }
              sx={{ mt: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ ...primaryButtonSx, mt: 3, py: 1.3, fontSize: 16 }}
            >
              {isLoading ? 'Sending code…' : 'Continue'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: brand.body }}>
                Already have an account?{' '}
                <MuiLink
                  component={Link}
                  href="/login"
                  sx={{ fontWeight: 700, color: brand.purple }}
                >
                  Sign In
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </PageShell>
  );
}
