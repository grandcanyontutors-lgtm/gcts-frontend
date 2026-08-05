'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
} from '@mui/material';
import { Assignment, Schedule, CheckCircle, Add } from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { StudentOrdersOverview } from '@/components/dashboard/StudentOrdersOverview';
import { StatTile } from '@/components/dashboard/StatTile';
import { useGetMyOrderStatsQuery } from '@/store/api/orderApi';
import {
  brand,
  accents,
  panelSx,
  primaryButtonSx,
  AppPageHeader,
  PageShell,
} from '@/lib/brand';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function StudentDashboard() {
  const { user } = useAuth();
  const { data: orderStats, isLoading } = useGetMyOrderStatsQuery();

  const hasNoOrders = !isLoading && (!orderStats || orderStats.total === 0);

  return (
    <PageShell>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
        <AppPageHeader
          title={`${getGreeting()}, ${user?.firstName || user?.email}`}
          subtitle="Here's an overview of your orders"
          action={
            <Button
              component={Link}
              href="/order/place"
              variant="contained"
              size="large"
              startIcon={<Add />}
              sx={{ ...primaryButtonSx, px: 3, py: 1.2 }}
            >
              New Order
            </Button>
          }
        />

        {/* Essential stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <StatTile icon={<Assignment />} label="Active" color={accents.active} loading={isLoading} value={orderStats?.inProgress ?? 0} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatTile icon={<Schedule />} label="Pending" color={accents.pending} loading={isLoading} value={orderStats?.pending ?? 0} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatTile icon={<CheckCircle />} label="Completed" color={accents.done} loading={isLoading} value={orderStats?.completed ?? 0} />
          </Grid>
        </Grid>

        {/* Primary content: recent orders, or a first-order prompt */}
        {hasNoOrders ? (
          <Box sx={{ ...panelSx, p: { xs: 4, md: 6 }, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: brand.ink, mb: 1 }}>
              You haven&apos;t placed any orders yet
            </Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 500, color: brand.body, mb: 3, maxWidth: 420, mx: 'auto' }}>
              Start by placing your first order to get academic assistance from our expert writers.
            </Typography>
            <Button
              component={Link}
              href="/order/place"
              variant="contained"
              startIcon={<Add />}
              sx={{ ...primaryButtonSx, px: 3, py: 1.2 }}
            >
              Place Your First Order
            </Button>
          </Box>
        ) : (
          <Box sx={{ ...panelSx, p: { xs: 2.5, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: brand.ink }}>
                Recent Orders
              </Typography>
              <Button
                component={Link}
                href="/orders"
                size="small"
                sx={{ color: brand.purple, fontWeight: 700 }}
              >
                View all
              </Button>
            </Box>
            <StudentOrdersOverview />
          </Box>
        )}
      </Container>
    </PageShell>
  );
}

export default function StudentDashboardWithAuth() {
  return (
    <PrivateRoute roles={['student']}>
      <StudentDashboard />
    </PrivateRoute>
  );
}
