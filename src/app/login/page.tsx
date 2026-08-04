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
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ValidatedForm } from '@/components/forms/ValidatedForm';
import { loginSchema } from '@/utils/validation';
import { brand, cardSx, primaryButtonSx, Mark, PageShell } from '@/lib/brand';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (values: Record<string, any>) => {
    // Clear any previous errors
    clearError();

    try {
      await login({ email: values.email, password: values.password });
      // Redirect will happen automatically via useEffect
    } catch (err: any) {
      // Don't re-throw - let AuthContext handle the error display
      // ValidatedForm will still set isSubmitting to false in finally block
      console.error('Login failed:', err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            maxWidth: 460,
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
              <Mark>Welcome</Mark> back
            </Typography>
            <Typography sx={{ mt: 1.5, fontSize: 16, fontWeight: 500, color: brand.body }}>
              Sign in to your GCTS account to continue.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <ValidatedForm
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
            submitText="Sign In"
            disabled={isLoading}
            showSubmitButton={false}
          >
            {({ values, errors, touched, isSubmitting, handleChange, handleBlur }) => (
              <>
                <TextField
                  fullWidth
                  name="email"
                  label="Email Address"
                  type="email"
                  required
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  margin="normal"
                  error={touched.email && !!errors.email}
                  helperText={touched.email ? errors.email : undefined}
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
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={values.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  margin="normal"
                  error={touched.password && !!errors.password}
                  helperText={touched.password ? errors.password : undefined}
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

                <Box sx={{ textAlign: 'right', mt: 1.5 }}>
                  <MuiLink
                    component={Link}
                    href="/resetpassword"
                    sx={{ fontSize: 14, fontWeight: 600, color: brand.purple }}
                  >
                    Forgot Password?
                  </MuiLink>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading || isSubmitting}
                  sx={{ ...primaryButtonSx, mt: 3, py: 1.3, fontSize: 16 }}
                >
                  {isSubmitting ? 'Signing In…' : 'Sign In'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: brand.body }}>
                    Don't have an account?{' '}
                    <MuiLink
                      component={Link}
                      href="/register"
                      sx={{ fontWeight: 700, color: brand.purple }}
                    >
                      Sign Up
                    </MuiLink>
                  </Typography>
                </Box>
              </>
            )}
          </ValidatedForm>
        </Box>
      </Box>
    </PageShell>
  );
}
