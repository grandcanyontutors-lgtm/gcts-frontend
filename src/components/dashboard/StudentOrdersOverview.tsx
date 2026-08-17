'use client';

import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  IconButton,
  Typography,
  Button,
  Skeleton,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Assignment,
  Visibility,
  Message,
  Download,
  Schedule,
  CheckCircle,
  Warning,
  Error,
} from '@mui/icons-material';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { useGetOrdersQuery } from '@/store/api/orderApi';

interface StudentOrdersOverviewProps {
  limit?: number;
}

export function StudentOrdersOverview({ limit = 5 }: StudentOrdersOverviewProps) {
  const { 
    data: ordersResponse, 
    isLoading, 
    error 
  } = useGetOrdersQuery({
    page: 1,
    pageSize: limit,
    ordering: '-created_at'
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'in_progress':
        return <Schedule color="info" />;
      case 'pending':
        return <Warning color="warning" />;
      case 'cancelled':
        return <Error color="error" />;
      default:
        return <Assignment />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getProgressValue = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 100;
      case 'in_progress': return 70;
      case 'pending': return 30;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  if (isLoading) {
    return (
      <Box>
        {Array.from({ length: 3 }).map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
              <Skeleton variant="rectangular" width={80} height={24} />
            </Box>
            <Skeleton variant="rectangular" width="100%" height={4} />
          </Box>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load orders. Please try again later.
      </Alert>
    );
  }

  if (!ordersResponse?.results || ordersResponse.results.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Orders Yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Start by placing your first order
        </Typography>
        <Button
          component={Link}
          href="/order/place"
          variant="contained"
          size="small"
        >
          Place Order
        </Button>
      </Box>
    );
  }

  return (
    <List sx={{ p: 0 }}>
      {ordersResponse.results.map((order, index) => (
        <Box key={order.id}>
          <ListItem sx={{ px: 0, py: 2 }}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                {getStatusIcon(order.status)}
              </Avatar>
            </ListItemAvatar>
            
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" component="span">
                    {order.title}
                  </Typography>
                  <Chip
                    label={order?.status?.replace('_', ' ') || 'Unknown'}
                    color={getStatusColor(order?.status) as any}
                    size="small"
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {order?.subject?.name || 'N/A'} • {order?.min_pages || 0} pages • {order?.deadline ? `Due ${format(new Date(order.deadline), 'MMM dd')}` : 'No deadline'}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressValue(order?.status)}
                    sx={{ mt: 1, height: 4, borderRadius: 2 }}
                    color={getStatusColor(order?.status) as any}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Created {order?.created_at ? formatDistanceToNow(new Date(order.created_at), { addSuffix: true }) : 'Unknown'}
                  </Typography>
                </Box>
              }
            />
            
            <ListItemSecondaryAction>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  component={Link}
                  href={`/orders/${order.id}`}
                  size="small"
                  title="View Details"
                >
                  <Visibility />
                </IconButton>
                
                {order.status === 'completed' && (
                  <IconButton
                    component={Link}
                    href={`/orders/${order.id}/download`}
                    size="small"
                    title="Download Files"
                  >
                    <Download />
                  </IconButton>
                )}
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
          
          {index < ordersResponse.results.length - 1 && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mx: 2 }} />
          )}
        </Box>
      ))}
      
      {ordersResponse.results.length >= limit && (
        <Box sx={{ textAlign: 'center', pt: 2 }}>
          <Button
            component={Link}
            href="/orders"
            variant="outlined"
            size="small"
          >
            View All Orders ({ordersResponse.count} total)
          </Button>
        </Box>
      )}
    </List>
  );
}