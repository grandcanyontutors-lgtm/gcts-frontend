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
  Paper,
} from '@mui/material';
import {
  Assignment,
  Visibility,
  Message,
  Upload,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  Person,
} from '@mui/icons-material';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { useGetOrdersQuery } from '@/store/api/orderApi';

interface WriterOrdersOverviewProps {
  limit?: number;
}

export function WriterOrdersOverview({ limit = 5 }: WriterOrdersOverviewProps) {
  const { 
    data: ordersResponse, 
    isLoading, 
    error 
  } = useGetOrdersQuery({
    page: 1,
    pageSize: limit,
    // Both of these were camelCase, which the API accepts and ignores — the
    // widget was showing every order in newest-first-by-accident order rather
    // than the writer's own assignments.
    ordering: '-created_at',
    filters: { assigned_to_me: true }
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
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getProgressValue = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 100;
      case 'in_progress': return 70;
      case 'pending': return 30;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const getPriorityColor = (urgency: string) => {
    // Server values are Order.URGENCY_LEVELS (low/medium/high), never the
    // 'urgent'/'very_urgent' labels this used to switch on.
    switch (urgency.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'info';
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
        Failed to load assigned orders. Please try again later.
      </Alert>
    );
  }

  if (!ordersResponse?.results || ordersResponse.results.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Assigned Orders
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You don't have any assigned orders yet
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={() => {/* Navigate to available orders */}}
        >
          Find Available Orders
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
                    label={order.status.replace('_', ' ')}
                    color={getStatusColor(order.status) as any}
                    size="small"
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Person sx={{ fontSize: 16 }} />
                    <Typography variant="body2" color="text.secondary">
                      {order.student?.firstName} {order.student?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • {order.subject?.name} • {order.pages} pages
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Due: {format(new Date(order.deadline), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                  
                  <LinearProgress
                    variant="determinate"
                    value={getProgressValue(order.status)}
                    sx={{ mt: 1, height: 4, borderRadius: 2 }}
                    color={getStatusColor(order.status) as any}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Created {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }) : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="primary.main" fontWeight="medium">
                      ${order.price}
                    </Typography>
                  </Box>
                </Box>
              }
            />
            
            <ListItemSecondaryAction>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <IconButton
                  component={Link}
                  href={`/orders/${order.id}`}
                  size="small"
                  title="View Details"
                >
                  <Visibility />
                </IconButton>
                
                <IconButton
                  component={Link}
                  href={`/orders/${order.id}/messages`}
                  size="small"
                  title="Message Student"
                >
                  <Message />
                </IconButton>
                
                {order.status === 'in_progress' && (
                  <IconButton
                    component={Link}
                    href={`/orders/${order.id}/submit`}
                    size="small"
                    title="Submit Work"
                    color="primary"
                  >
                    <Upload />
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
            View All Assigned Orders ({ordersResponse.count} total)
          </Button>
        </Box>
      )}
    </List>
  );
}