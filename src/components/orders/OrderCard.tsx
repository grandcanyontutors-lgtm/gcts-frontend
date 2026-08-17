'use client';

import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  LinearProgress,
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Assignment,
  Person,
  Schedule,
  MoreVert,
  Upload,
} from '@mui/icons-material';
import { useState } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { brand, accents } from '@/lib/brand';
import { orderVisibility, personName, type OrderViewerRole } from '@/lib/orderVisibility';
import { labelFor, SUBJECT_OPTIONS, ACADEMIC_LEVEL_OPTIONS } from '@/lib/orderOptions';
import { statusLabel, statusTone, progressFor } from '@/lib/orderStatus';

interface OrderCardProps {
  orders: any[];
  isLoading: boolean;
  userRole?: OrderViewerRole;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalCount: number;
}

export function OrderCard({
  orders,
  isLoading,
  userRole,
  onPageChange,
  currentPage,
  totalCount,
}: OrderCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const show = orderVisibility(userRole);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, order: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  // Deadline pressure, for the one date that matters on a card.
  const deadlineTone = (deadline: string) => {
    const hoursLeft = (new Date(deadline).getTime() - Date.now()) / 36e5;
    if (hoursLeft < 24) return '#c62828';
    if (hoursLeft < 72) return accents.pending;
    return brand.body;
  };

  const canEdit = (order: any) =>
    userRole === 'admin' || (userRole === 'student' && order?.status === 'pending');

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid item xs={12} sm={6} lg={4} key={index}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={4} sx={{ mt: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Skeleton variant="rectangular" width={70} height={24} />
                  <Skeleton variant="rectangular" width={60} height={24} />
                </Box>
                <Skeleton variant="text" width="55%" sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Assignment sx={{ fontSize: 56, color: brand.body, opacity: 0.4, mb: 2 }} />
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: brand.ink, mb: 0.5 }}>
          No orders found
        </Typography>
        <Typography sx={{ fontSize: 15, color: brand.body }}>
          {userRole === 'student'
            ? "You haven't placed any orders yet."
            : 'Nothing matches the current filters.'}
        </Typography>
      </Box>
    );
  }

  const pageCount = Math.ceil(totalCount / 12);

  return (
    <Box>
      <Grid container spacing={3}>
        {orders.map((order) => {
          const tone = statusTone(order?.status);
          return (
            <Grid item xs={12} sm={6} lg={4} key={order.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: `1px solid ${brand.line}`,
                  boxShadow: '0 12px 28px -22px rgba(26,21,38,0.35)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 20px 36px -24px rgba(106,27,154,0.4)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      component="h3"
                      sx={{ fontSize: 17, fontWeight: 700, color: brand.ink, lineHeight: 1.3 }}
                    >
                      {order.title}
                    </Typography>
                    <IconButton size="small" onClick={(e) => handleMenuClick(e, order)}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={statusLabel(order?.status)}
                        size="small"
                        sx={{ bgcolor: `${tone}1a`, color: tone, fontWeight: 700 }}
                      />
                      {/* Cost lives on the order's Payment card, not here — the
                          admin sets it after review, so in a list it is usually
                          blank and never actionable. */}
                      {show.costInList && order?.price != null && (
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: accents.money }}>
                          ${order.price}
                        </Typography>
                      )}
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progressFor(order?.status)}
                      sx={{
                        height: 5,
                        borderRadius: 3,
                        bgcolor: `${tone}22`,
                        '& .MuiLinearProgress-bar': { bgcolor: tone },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                    <Chip
                      label={labelFor(SUBJECT_OPTIONS, order?.subject)}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: brand.line, color: brand.body }}
                    />
                    <Chip
                      label={`${order?.min_pages ?? 0} ${order?.min_pages === 1 ? 'page' : 'pages'}`}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: brand.line, color: brand.body }}
                    />
                    <Chip
                      label={labelFor(ACADEMIC_LEVEL_OPTIONS, order?.level)}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: brand.line, color: brand.body }}
                    />
                  </Box>

                  {/* Requester — staff only, and only when there is a name to
                      show. This used to render a bare "Student:" with nothing
                      after it, because it read snake_case off a camelCase
                      payload. The writer is never named here: students have no
                      direct relationship with them. */}
                  {show.requester && personName(order?.user) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                      <Person sx={{ fontSize: 16, color: brand.body }} />
                      <Typography sx={{ fontSize: 13, color: brand.body }}>
                        {personName(order.user)}
                      </Typography>
                    </Box>
                  )}

                  {show.writer && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                      <Person sx={{ fontSize: 16, color: brand.body }} />
                      <Typography sx={{ fontSize: 13, color: brand.body }}>
                        {personName(order?.assigned_to) || 'Unassigned'}
                      </Typography>
                    </Box>
                  )}

                  {order?.deadline && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Schedule sx={{ fontSize: 16, color: deadlineTone(order.deadline) }} />
                      <Typography sx={{ fontSize: 13, color: brand.body }}>
                        Due {format(new Date(order.deadline), 'MMM d, yyyy')}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 13, fontWeight: 600, color: deadlineTone(order.deadline) }}
                      >
                        · {formatDistanceToNow(new Date(order.deadline), { addSuffix: true })}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    component={Link}
                    href={`/orders/${order.id}`}
                    sx={{ textTransform: 'none', fontWeight: 700, color: brand.purple }}
                  >
                    View
                  </Button>
                  {userRole === 'writer' &&
                    order?.status === 'in_progress' &&
                    order?.assigned_to && (
                      <Button
                        size="small"
                        startIcon={<Upload />}
                        component={Link}
                        href={`/orders/${order.id}/submit`}
                        sx={{ textTransform: 'none', fontWeight: 700, color: brand.purple }}
                      >
                        Submit
                      </Button>
                    )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pageCount}
            page={currentPage}
            onChange={(_, page) => onPageChange(page)}
            color="primary"
          />
        </Box>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem component={Link} href={`/orders/${selectedOrder?.id}`}>
          <Visibility sx={{ mr: 1, fontSize: 20 }} />
          View details
        </MenuItem>
        {canEdit(selectedOrder) && (
          <MenuItem component={Link} href={`/orders/${selectedOrder?.id}/edit`}>
            <Edit sx={{ mr: 1, fontSize: 20 }} />
            Edit order
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
