'use client';

import {
  Box,
  Container,
  Grid,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  Assignment,
  Groups,
  PendingActions,
  Article,
  RateReview,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { AdminOverviewTab } from '@/components/dashboard/AdminOverviewTab';
import { UserManagementTab } from '@/components/dashboard/UserManagementTab';
import { OrderManagementTab } from '@/components/dashboard/OrderManagementTab';
import { PapersManagementTab } from '@/components/dashboard/PapersManagementTab';
import { ReviewModerationTab } from '@/components/dashboard/ReviewModerationTab';
import { StatTile } from '@/components/dashboard/StatTile';
import { useGetDashboardStatsQuery } from '@/store/api/adminApi';
import { useGetUserStatsQuery } from '@/store/api/userApi';
import { brand, accents, panelSx, AppPageHeader, PageShell } from '@/lib/brand';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`admin-tabpanel-${index}`}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function AdminDashboard() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const { data: dashboardStats, isLoading: dashboardLoading } = useGetDashboardStatsQuery();
  const { data: userStats, isLoading: userStatsLoading } = useGetUserStatsQuery();

  return (
    <PageShell>
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 5 } }}>
        <AppPageHeader
          title={`${getGreeting()}, ${user?.firstName || 'Administrator'}`}
          subtitle="Platform overview and management"
        />

        {/* Essential KPIs */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} md={3}>
            <StatTile icon={<People />} label="Total Users" color={brand.purple} loading={userStatsLoading} value={userStats?.totalUsers ?? 0} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatTile icon={<Assignment />} label="Total Orders" color={accents.active} loading={dashboardLoading} value={dashboardStats?.totalOrders ?? 0} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatTile icon={<PendingActions />} label="Active Orders" color={accents.pending} loading={dashboardLoading} value={dashboardStats?.activeOrders ?? 0} />
          </Grid>
          <Grid item xs={6} md={3}>
            {/* Not revenue: payment happens off-site and nothing in the system
                records receipts, so totalRevenue is structurally always $0.
                Writers on the bench is a number an admin can act on. */}
            <StatTile icon={<Groups />} label="Writers" color={accents.done} loading={userStatsLoading} value={userStats?.usersByRole?.writer ?? 0} />
          </Grid>
        </Grid>

        {/* Management sections */}
        <Box sx={{ ...panelSx, mb: 3, px: 1 }}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            aria-label="admin dashboard tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 56,
              '& .MuiTab-root': {
                minHeight: 56,
                textTransform: 'none',
                fontSize: 15,
                fontWeight: 600,
                color: brand.body,
                '& svg': { fontSize: 20 },
                '&.Mui-selected': { color: brand.purpleDeep, fontWeight: 800 },
              },
              // Lime indicator, matching the navbar's active marker.
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 2,
                backgroundColor: brand.lime,
              },
            }}
          >
            <Tab label="Overview" icon={<DashboardIcon />} iconPosition="start" />
            <Tab label="Users" icon={<People />} iconPosition="start" />
            <Tab label="Orders" icon={<Assignment />} iconPosition="start" />
            <Tab label="Papers" icon={<Article />} iconPosition="start" />
            <Tab label="Reviews" icon={<RateReview />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}><AdminOverviewTab /></TabPanel>
        <TabPanel value={tabValue} index={1}><UserManagementTab /></TabPanel>
        <TabPanel value={tabValue} index={2}><OrderManagementTab /></TabPanel>
        <TabPanel value={tabValue} index={3}><PapersManagementTab /></TabPanel>
        <TabPanel value={tabValue} index={4}><ReviewModerationTab /></TabPanel>
      </Container>
    </PageShell>
  );
}

export default function AdminDashboardWithAuth() {
  return (
    <PrivateRoute roles={['admin']}>
      <AdminDashboard />
    </PrivateRoute>
  );
}
