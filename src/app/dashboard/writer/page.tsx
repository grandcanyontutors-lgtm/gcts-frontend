'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
} from '@mui/material';
import { Assignment, CheckCircle, AttachMoney } from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { WriterOrdersOverview } from '@/components/dashboard/WriterOrdersOverview';
import { StatTile } from '@/components/dashboard/StatTile';
import { useGetWriterStatsQuery } from '@/store/api/userApi';
import { useGetMyEarningsQuery } from '@/store/api/paymentApi';
import { brand, accents, panelSx, AppPageHeader, PageShell } from '@/lib/brand';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function WriterDashboard() {
  const { user } = useAuth();
  const { data: writerStats, isLoading: statsLoading } = useGetWriterStatsQuery(user?.id || 0);
  const { data: earnings, isLoading: earningsLoading } = useGetMyEarningsQuery({ period: '12m' });

  return (
    <PageShell>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
        <AppPageHeader
          title={`${getGreeting()}, ${user?.firstName || user?.email}`}
          subtitle="Your assigned work and available orders"
        />

        {/* Essential stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <StatTile icon={<Assignment />} label="Active Orders" color={accents.active} loading={statsLoading} value={writerStats?.pendingOrders ?? 0} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatTile icon={<CheckCircle />} label="Completed" color={accents.done} loading={statsLoading} value={writerStats?.completedOrders ?? 0} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatTile icon={<AttachMoney />} label="Total Earnings" color={accents.money} loading={earningsLoading} value={`$${earnings?.totalEarnings ?? 0}`} />
          </Grid>
        </Grid>

        {/* Assigned orders */}
        <Box sx={{ ...panelSx, p: { xs: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: brand.ink }}>
              My Assigned Orders
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
          <WriterOrdersOverview />
        </Box>
      </Container>
    </PageShell>
  );
}

export default function WriterDashboardWithAuth() {
  return (
    <PrivateRoute roles={['writer']}>
      <WriterDashboard />
    </PrivateRoute>
  );
}
