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
import { brand, cardSx, primaryButtonSx, Mark, PageShell } from '@/lib/brand';

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'student',
      });
      // On success the user is logged in; redirect happens via useEffect above.
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
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
              Create your <Mark>account</Mark>
            </Typography>
            <Typography sx={{ mt: 1.5, fontSize: 16, fontWeight: 500, color: brand.body }}>
              Join GCTS today and get expert help with your work.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
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
              {isLoading ? 'Creating Account…' : 'Sign Up'}
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
