'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, CircularProgress } from '@mui/material';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { useAuth } from '@/contexts/AuthContext';
import { brand, PageShell } from '@/lib/brand';

function DashboardRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'student':
          router.replace('/dashboard/student');
          break;
        case 'writer':
          router.replace('/dashboard/writer');
          break;
        case 'admin':
          router.replace('/dashboard/admin');
          break;
        default:
          router.replace('/dashboard/student'); // Default fallback
      }
    }
  }, [user, isLoading, router]);

  return (
    <PageShell>
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        {isLoading && <CircularProgress size={48} sx={{ color: brand.purple, mb: 2.5 }} />}
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: brand.ink }}>
          {isLoading ? 'Loading your dashboard…' : 'Redirecting to your dashboard…'}
        </Typography>
      </Container>
    </PageShell>
  );
}

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <DashboardRedirect />
    </PrivateRoute>
  );
}