'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  People,
  Assignment,
  AttachMoney,
  Star,
  Schedule,
  Download,
} from '@mui/icons-material';
import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { subDays, format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { 
  useGetAnalyticsQuery,
  useGetOrderTrendsQuery,
  useGetRevenueTrendsQuery,
  useGetUserMetricsQuery,
  useGetWriterPerformanceQuery,
  useExportAnalyticsMutation 
} from '@/store/api/analyticsApi';
import { MetricCard } from '@/components/analytics/MetricCard';
import { OrderTrendsChart } from '@/components/analytics/OrderTrendsChart';
import { RevenueChart } from '@/components/analytics/RevenueChart';
import { OrderStatusPieChart } from '@/components/analytics/OrderStatusPieChart';

function AnalyticsPage() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [dateFrom, setDateFrom] = useState(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState(new Date());
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const filters = {
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
    period,
  };

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useGetAnalyticsQuery(filters);
  const { data: orderTrends, isLoading: orderTrendsLoading } = useGetOrderTrendsQuery(filters);
  const { data: revenueTrends, isLoading: revenueTrendsLoading } = useGetRevenueTrendsQuery(filters);
  const { data: userMetrics, isLoading: userMetricsLoading } = useGetUserMetricsQuery(filters);
  const { data: writerPerformance, isLoading: writerPerformanceLoading } = useGetWriterPerformanceQuery(filters);
  const [exportAnalytics, { isLoading: exporting }] = useExportAnalyticsMutation();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExport = async () => {
    try {
      const blob = await exportAnalytics(filters).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  const canViewAnalytics = () => {
    return user?.role === 'admin';
  };

  if (!canViewAnalytics()) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          You don't have permission to view analytics.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Analytics Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Comprehensive analytics and insights for your platform
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="From Date"
                value={dateFrom}
                onChange={(date) => setDateFrom(date || new Date())}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="To Date"
                value={dateTo}
                onChange={(date) => setDateTo(date || new Date())}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Period</InputLabel>
                <Select
                  value={period}
                  label="Period"
                  onChange={(e) => setPeriod(e.target.value as any)}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Paper>

      {analyticsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load analytics data. Please try again.
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="Overview" />
          <Tab label="Orders" />
          <Tab label="Revenue" />
          <Tab label="Users" />
          <Tab label="Writers" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {tabValue === 0 && (
        <Box>
          {/* Key Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title="Total Orders"
                value={analytics?.overview.totalOrders || 0}
                icon={<Assignment />}
                color="primary"
                isLoading={analyticsLoading}
                tooltip="Total number of orders placed"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title="Total Revenue"
                value={analytics?.overview.totalRevenue || 0}
                icon={<AttachMoney />}
                color="success"
                format="currency"
                isLoading={analyticsLoading}
                tooltip="Total revenue generated"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title="Active Users"
                value={analytics?.overview.totalUsers || 0}
                icon={<People />}
                color="info"
                isLoading={analyticsLoading}
                tooltip="Total number of registered users"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title="Active Writers"
                value={analytics?.overview.totalWriters || 0}
                icon={<Star />}
                color="warning"
                isLoading={analyticsLoading}
                tooltip="Number of active writers"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title="Average Order Value"
                value={analytics?.overview.averageOrderValue || 0}
                icon={<TrendingUp />}
                color="secondary"
                format="currency"
                isLoading={analyticsLoading}
                tooltip="Average value per order"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title="Completion Rate"
                value={analytics?.overview.completionRate || 0}
                icon={<Schedule />}
                color="success"
                format="percentage"
                isLoading={analyticsLoading}
                tooltip="Percentage of orders completed on time"
              />
            </Grid>
          </Grid>

          {/* Charts Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <OrderTrendsChart
                data={orderTrends}
                isLoading={orderTrendsLoading}
                title="Order Trends"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <OrderStatusPieChart
                data={analytics?.ordersByStatus}
                isLoading={analyticsLoading}
                title="Orders by Status"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RevenueChart
                data={revenueTrends}
                isLoading={revenueTrendsLoading}
                title="Revenue Trends"
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Orders Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <OrderTrendsChart
              data={orderTrends}
              isLoading={orderTrendsLoading}
              title="Order Volume Over Time"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <OrderStatusPieChart
              data={analytics?.ordersByStatus}
              isLoading={analyticsLoading}
              title="Order Status Distribution"
            />
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Orders by Category
                </Typography>
                {/* Add category breakdown chart here */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Revenue Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <RevenueChart
              data={revenueTrends}
              isLoading={revenueTrendsLoading}
              title="Revenue Performance"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue by Payment Method
                </Typography>
                {/* Add payment method breakdown */}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue by Academic Level
                </Typography>
                {/* Add academic level breakdown */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Users Tab */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Active Users"
              value={userMetrics?.activeUsers || 0}
              icon={<People />}
              color="primary"
              isLoading={userMetricsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="New Signups"
              value={userMetrics?.newSignups || 0}
              icon={<People />}
              color="success"
              isLoading={userMetricsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Retention Rate"
              value={userMetrics?.userRetentionRate || 0}
              icon={<TrendingUp />}
              color="info"
              format="percentage"
              isLoading={userMetricsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Avg Session Duration"
              value={`${Math.round((userMetrics?.averageSessionDuration || 0) / 60)}m`}
              icon={<Schedule />}
              color="warning"
              isLoading={userMetricsLoading}
            />
          </Grid>
        </Grid>
      )}

      {/* Writers Tab */}
      {tabValue === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Avg Completion Time"
              value={`${writerPerformance?.performanceMetrics.averageCompletionTime || 0}h`}
              icon={<Schedule />}
              color="primary"
              isLoading={writerPerformanceLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Quality Score"
              value={writerPerformance?.performanceMetrics.qualityScore || 0}
              icon={<Star />}
              color="success"
              format="percentage"
              isLoading={writerPerformanceLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Client Satisfaction"
              value={writerPerformance?.performanceMetrics.clientSatisfaction || 0}
              icon={<TrendingUp />}
              color="info"
              format="percentage"
              isLoading={writerPerformanceLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Top Performers"
              value={writerPerformance?.topPerformers.length || 0}
              icon={<People />}
              color="warning"
              isLoading={writerPerformanceLoading}
            />
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default function AnalyticsPageWithAuth() {
  return (
    <PrivateRoute>
      <AnalyticsPage />
    </PrivateRoute>
  );
}