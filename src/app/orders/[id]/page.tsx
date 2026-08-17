'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Breadcrumbs,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Message,
  Upload,
  GetApp,
  Schedule,
  AttachMoney,
  Person,
  Assignment,
  Visibility,
  MoreVert,
  Phone,
  Email,
  School,
  Description,
  AttachFile,
  Star,
  Warning,
  CheckCircle,
  Cancel,
  Refresh,
} from '@mui/icons-material';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import {
  useGetOrderQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useAssignOrderMutation,
  useReleaseSolutionMutation,
  useRequestRevisionMutation,
  useUploadOrderFileMutation,
} from '@/store/api/orderApi';
import { useGetWritersQuery } from '@/store/api/userApi';
import { OrderMessages } from '@/components/orders/OrderMessages';
import { orderVisibility, personName } from '@/lib/orderVisibility';
import { labelFor, SUBJECT_OPTIONS, ACADEMIC_LEVEL_OPTIONS, ORDER_TYPE_OPTIONS } from '@/lib/orderOptions';
import { ORDER_STEPS, activeStep, statusLabel } from '@/lib/orderStatus';

interface OrderDetailsPageProps {
  params: {
    id: string;
  };
}

function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [selectedWriterId, setSelectedWriterId] = useState<number | ''>('');
  const [assignError, setAssignError] = useState('');

  const { data: order, isLoading, error, refetch } = useGetOrderQuery(params.id);
  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();
  const [assignOrder, { isLoading: isAssigning }] = useAssignOrderMutation();
  const isAdmin = user?.role === 'admin';
  const { data: writersData } = useGetWritersQuery({}, { skip: !isAdmin });

  const [releaseSolution, { isLoading: isReleasing }] = useReleaseSolutionMutation();
  const [requestRevision, { isLoading: isRequestingRevision }] = useRequestRevisionMutation();
  const [uploadOrderFile, { isLoading: isUploadingSolution }] = useUploadOrderFileMutation();
  const [solutionError, setSolutionError] = useState('');
  const [revisionDialog, setRevisionDialog] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [revisionError, setRevisionError] = useState('');

  const isOwner = order?.user?.id === user?.id;
  // Same rules as the order list — a student is never shown the writer, and
  // is not shown their own name back.
  const show = orderVisibility(user?.role);
  const solutionFiles = (order?.files ?? []).filter(
    (f: any) => typeof f === 'object' && f?.fileType === 'solution'
  );
  const isReleased = Boolean(order?.solution_released_at);

  const handleUploadSolution = async (fileList: FileList | null) => {
    if (!order || !fileList?.length) return;
    setSolutionError('');
    try {
      for (const file of Array.from(fileList)) {
        await uploadOrderFile({ orderId: order.id, file, fileType: 'solution' }).unwrap();
      }
      refetch();
    } catch (e: any) {
      setSolutionError(e?.data?.message || e?.data?.error || 'Failed to upload solution file.');
    }
  };

  const handleRelease = async () => {
    if (!order) return;
    setSolutionError('');
    try {
      await releaseSolution(order.id).unwrap();
      refetch();
    } catch (e: any) {
      setSolutionError(e?.data?.error || e?.data?.message || 'Failed to release the solution.');
    }
  };

  const handleRequestRevision = async () => {
    if (!order) return;
    setRevisionError('');
    try {
      await requestRevision({ id: order.id, reason: revisionReason }).unwrap();
      setRevisionDialog(false);
      setRevisionReason('');
      refetch();
    } catch (e: any) {
      setRevisionError(e?.data?.error || e?.data?.message || 'Failed to request a revision.');
    }
  };

  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    price: '' as string | number,
    payment_status: 'pending',
    payment_instructions: '',
  });
  const [paymentError, setPaymentError] = useState('');
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  const openPaymentDialog = () => {
    setPaymentForm({
      price: order?.price ?? '',
      payment_status: order?.payment_status ?? 'pending',
      payment_instructions: order?.payment_instructions ?? '',
    });
    setPaymentError('');
    setPaymentDialog(true);
  };

  const handleSavePayment = async () => {
    if (!order) return;
    setPaymentError('');
    setIsSavingPayment(true);
    try {
      await updateOrder({
        id: order.id,
        data: {
          price: paymentForm.price === '' ? null : Number(paymentForm.price),
          payment_status: paymentForm.payment_status,
          payment_instructions: paymentForm.payment_instructions,
        } as any,
      }).unwrap();
      setPaymentDialog(false);
      refetch();
    } catch (e: any) {
      setPaymentError(e?.data?.message || e?.data?.error || 'Failed to save payment details.');
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleAssignWriter = async () => {
    if (!order || selectedWriterId === '') return;
    setAssignError('');
    try {
      await assignOrder({ id: order.id, writerId: selectedWriterId }).unwrap();
      setAssignDialog(false);
      setSelectedWriterId('');
      refetch();
    } catch (e: any) {
      setAssignError(e?.data?.error || e?.data?.message || 'Failed to assign writer.');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusUpdate = async () => {
    if (order && newStatus) {
      await updateOrder({
        id: order.id,
        data: { status: newStatus as any },
      });
      setStatusDialog(false);
      setNewStatus('');
      refetch();
    }
  };

  const handleDeleteOrder = async () => {
    if (order) {
      await deleteOrder(order.id);
      setDeleteDialog(false);
      router.push('/orders');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'released': return 'success';
      case 'assigned': return 'info';
      case 'in_progress': return 'info';
      case 'solution_submitted': return 'secondary';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'in_revision': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle />;
      case 'released': return <CheckCircle />;
      case 'assigned': return <Person />;
      case 'in_progress': return <Schedule />;
      case 'solution_submitted': return <Upload />;
      case 'pending': return <Warning />;
      case 'cancelled': return <Cancel />;
      case 'in_revision': return <Refresh />;
      default: return <Assignment />;
    }
  };

  const getUrgencyColor = (deadline: string) => {
    const now = new Date();
    const due = new Date(deadline);
    const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursLeft < 24) return 'error';
    if (hoursLeft < 72) return 'warning';
    return 'success';
  };

  const canEdit = () => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'student' && order?.user?.id === user.id && order?.status === 'pending') return true;
    return false;
  };

  const canDelete = () => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'student' && order?.user?.id === user.id && order?.status === 'pending') return true;
    return false;
  };

  const canSubmitWork =
    user?.role === 'writer' &&
    order?.assigned_to?.id === user.id &&
    order?.status === 'in_progress';

  const canUpdateStatus = () => {
    return user?.role === 'admin' || (user?.role === 'writer' && order?.assigned_to?.id === user.id);
  };


  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography>Loading order details...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Order not found or you don't have permission to view it.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/orders" style={{ textDecoration: 'none', color: 'inherit' }}>
          Orders
        </Link>
        <Typography color="text.primary">Order #{order.id}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton component={Link} href="/orders">
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              {order.title}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Order #{order.id}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            icon={getStatusIcon(order.status)}
            label={statusLabel(order.status)}
            color={getStatusColor(order.status) as any}
          />
          <IconButton onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      {/* Order Progress */}
      {order.status !== 'cancelled' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Progress
          </Typography>
          <Stepper activeStep={activeStep(order.status)} alternativeLabel>
            {ORDER_STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* Order Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Assignment />
                      </ListItemIcon>
                      <ListItemText
                        primary="Order Type"
                        secondary={labelFor(ORDER_TYPE_OPTIONS, order.type)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <School />
                      </ListItemIcon>
                      <ListItemText
                        primary="Academic Level"
                        secondary={labelFor(ACADEMIC_LEVEL_OPTIONS, order.level)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText
                        primary="Subject"
                        secondary={labelFor(SUBJECT_OPTIONS, order.subject)}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText
                        primary="Pages"
                        secondary={`${order.min_pages} pages`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Assignment />
                      </ListItemIcon>
                      <ListItemText
                        primary="Placed"
                        secondary={
                          order.created_at ? format(new Date(order.created_at), 'PPP') : '—'
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Schedule />
                      </ListItemIcon>
                      <ListItemText
                        primary="Deadline"
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {format(new Date(order.deadline), 'PPP p')}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color={`${getUrgencyColor(order.deadline)}.main`}
                            >
                              {formatDistanceToNow(new Date(order.deadline), { addSuffix: true })}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>

              {/* Instructions */}
              {order.instructions && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Instructions
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2">
                      {order.instructions}
                    </Typography>
                  </Paper>
                </Box>
              )}

            </CardContent>
          </Card>

          {/* The one communication thread on an order */}
          <OrderMessages orderId={order.id} isAdmin={isAdmin} />
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Solution — admin uploads & releases; owner sees it only after release */}
          {(isAdmin || isOwner) &&
            (isAdmin || isReleased || ['solution_submitted', 'in_revision'].includes(order.status)) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Solution
                </Typography>
                {solutionError && (
                  <Alert severity="error" sx={{ mb: 2 }}>{solutionError}</Alert>
                )}

                {isReleased ? (
                  <>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Solution released
                      {order.solution_released_at
                        ? ` ${formatDistanceToNow(new Date(order.solution_released_at), { addSuffix: true })}`
                        : ''}.
                    </Alert>
                    {solutionFiles.length > 0 && (
                      <List dense>
                        {solutionFiles.map((f: any) => (
                          <ListItem
                            key={f.id}
                            secondaryAction={
                              <IconButton edge="end" component="a" href={f.file} target="_blank" rel="noopener">
                                <GetApp />
                              </IconButton>
                            }
                          >
                            <ListItemIcon>
                              <AttachFile />
                            </ListItemIcon>
                            <ListItemText primary={f.fileName} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                    {order.solution_link && (
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GetApp />}
                        component="a"
                        href={order.solution_link}
                        target="_blank"
                        rel="noopener"
                        sx={{ mb: 1 }}
                      >
                        Open Solution Link
                      </Button>
                    )}
                    {isOwner && (
                      <Tooltip
                        title={
                          (order.revisions ?? 0) > 0
                            ? ''
                            : 'This order has used both included revisions.'
                        }
                      >
                        <span>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="secondary"
                            startIcon={<Refresh />}
                            disabled={(order.revisions ?? 0) <= 0}
                            onClick={() => setRevisionDialog(true)}
                          >
                            Request Revision ({order.revisions ?? 0} remaining)
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </>
                ) : isAdmin ? (
                  <>
                    {solutionFiles.length > 0 ? (
                      <List dense>
                        {solutionFiles.map((f: any) => (
                          <ListItem key={f.id}>
                            <ListItemIcon>
                              <AttachFile />
                            </ListItemIcon>
                            <ListItemText primary={f.fileName} secondary="Not visible to the student yet" />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        No solution files uploaded yet.
                      </Alert>
                    )}
                    <Button
                      fullWidth
                      variant="outlined"
                      component="label"
                      startIcon={<Upload />}
                      disabled={isUploadingSolution}
                      sx={{ mb: 1 }}
                    >
                      {isUploadingSolution ? 'Uploading…' : 'Upload Solution File'}
                      <input
                        type="file"
                        hidden
                        multiple
                        onChange={(e) => {
                          handleUploadSolution(e.target.files);
                          e.target.value = '';
                        }}
                      />
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      disabled={isReleasing || (solutionFiles.length === 0 && !order.solution_link)}
                      onClick={handleRelease}
                    >
                      {isReleasing ? 'Releasing…' : 'Release Solution to Student'}
                    </Button>
                  </>
                ) : (
                  <Alert severity="info">
                    {order.status === 'in_revision'
                      ? 'Your revision is in progress — the updated solution will appear here once released.'
                      : 'Your solution is being reviewed and will appear here once the admin releases it.'}
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment — off-site; the admin confirms cost and shares instructions */}
          {(isAdmin || isOwner) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Cost</Typography>
                  <Typography variant="subtitle1">
                    {order.price != null ? `$${order.price}` : 'Awaiting confirmation'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    size="small"
                    label={order.payment_status || 'pending'}
                    color={order.payment_status === 'paid' ? 'success' : 'warning'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
                {order.payment_instructions ? (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Payment Instructions
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {order.payment_instructions}
                      </Typography>
                    </Paper>
                  </>
                ) : (
                  <Alert severity="info">
                    Payment is handled off-site. Once the cost is confirmed, payment
                    instructions will appear here.
                  </Alert>
                )}
                {isAdmin && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={openPaymentDialog}
                    sx={{ mt: 2 }}
                  >
                    Edit Payment Details
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Requester — staff only. Showing a student their own name and
              email back on their own order is pure noise. */}
          {show.requester && order.user && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Requester
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'success.main' }}>
                    <Person />
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1">
                      {personName(order.user) || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {order.user.email}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Reply on the order's message thread — it is the record of what
                  was agreed.
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Writer — admin only. GCTS has no direct student↔writer
              relationship, so naming the writer to a requester would imply one
              and invite contact that is meant to go through the admin. Writers
              do not need it either: they see their own assignment. */}
          {show.writer && (order.assigned_to ? (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Writer
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'info.main' }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {personName(order.assigned_to) || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {order.assigned_to.email}
                    </Typography>
                  </Box>
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText primary={order.assigned_to.email} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Writer Assignment
                </Typography>
                <Alert severity="info">
                  No writer assigned yet. The admin assigns a writer once the order
                  is confirmed.
                </Alert>
                {show.assignment && (
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => setAssignDialog(true)}
                  >
                    Assign Writer
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Quick Actions — rendered only when there is at least one. For a
              student on an order already in progress every entry is gated off,
              and the card showed as an empty titled box. */}
          {(canEdit() || canUpdateStatus() || canSubmitWork) && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {canEdit() && (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    component={Link}
                    href={`/orders/${order.id}/edit`}
                  >
                    Edit Order
                  </Button>
                )}
                
                {canUpdateStatus() && (
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => setStatusDialog(true)}
                  >
                    Update Status
                  </Button>
                )}
                
                {canSubmitWork && (
                  <Button
                    variant="contained"
                    startIcon={<Upload />}
                    component={Link}
                    href={`/orders/${order.id}/submit`}
                  >
                    Submit Work
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
          )}
        </Grid>
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {canEdit() && (
          <MenuItem component={Link} href={`/orders/${order.id}/edit`}>
            <Edit sx={{ mr: 1 }} />
            Edit Order
          </MenuItem>
        )}
        
        {canUpdateStatus() && (
          <MenuItem onClick={() => { setStatusDialog(true); handleMenuClose(); }}>
            <Refresh sx={{ mr: 1 }} />
            Update Status
          </MenuItem>
        )}
        
        {canDelete() && (
          <MenuItem onClick={() => { setDeleteDialog(true); handleMenuClose(); }} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            Delete Order
          </MenuItem>
        )}
      </Menu>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              label="New Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="solution_submitted">Solution Submitted</MenuItem>
              <MenuItem value="in_revision">In Revision</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request Revision Dialog (owner) */}
      <Dialog open={revisionDialog} onClose={() => setRevisionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request a Revision</DialogTitle>
        <DialogContent>
          {revisionError && (
            <Alert severity="error" sx={{ mb: 2 }}>{revisionError}</Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Describe what needs to change. You have {order.revisions ?? 0} revision
            {(order.revisions ?? 0) === 1 ? '' : 's'} remaining on this order; the
            solution will be re-released after the revision is reviewed.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="What should be revised?"
            value={revisionReason}
            onChange={(e) => setRevisionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevisionDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRequestRevision}
            variant="contained"
            disabled={isRequestingRevision || !revisionReason.trim()}
          >
            {isRequestingRevision ? 'Submitting…' : 'Request Revision'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Details Dialog (admin) */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          {paymentError && (
            <Alert severity="error" sx={{ mb: 2 }}>{paymentError}</Alert>
          )}
          <TextField
            fullWidth
            type="number"
            label="Cost ($)"
            value={paymentForm.price}
            onChange={(e) => setPaymentForm((f) => ({ ...f, price: e.target.value }))}
            sx={{ mt: 2 }}
            inputProps={{ min: 0 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Payment Status</InputLabel>
            <Select
              value={paymentForm.payment_status}
              label="Payment Status"
              onChange={(e) => setPaymentForm((f) => ({ ...f, payment_status: e.target.value }))}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="partially paid">Partially Paid</MenuItem>
              <MenuItem value="paid">Paid (settled)</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Payment Instructions"
            placeholder="e.g. Pay $120 via M-Pesa till 123456 and reply with the confirmation code."
            value={paymentForm.payment_instructions}
            onChange={(e) => setPaymentForm((f) => ({ ...f, payment_instructions: e.target.value }))}
            sx={{ mt: 2 }}
            helperText="Shown to the student on this order; they are notified when you save changes."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button onClick={handleSavePayment} variant="contained" disabled={isSavingPayment}>
            {isSavingPayment ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Writer Dialog */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Writer</DialogTitle>
        <DialogContent>
          {assignError && (
            <Alert severity="error" sx={{ mb: 2 }}>{assignError}</Alert>
          )}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Writer</InputLabel>
            <Select
              value={selectedWriterId}
              label="Writer"
              onChange={(e) => setSelectedWriterId(e.target.value as number)}
            >
              {(writersData?.results ?? []).map((writer) => (
                <MenuItem key={writer.id} value={writer.id}>
                  {writer.firstName || writer.lastName
                    ? `${writer.firstName ?? ''} ${writer.lastName ?? ''}`.trim()
                    : writer.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {writersData && writersData.results?.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>No writers available.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAssignWriter}
            variant="contained"
            disabled={selectedWriterId === '' || isAssigning}
          >
            {isAssigning ? 'Assigning…' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this order? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteOrder} color="error" variant="contained">
            Delete Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default function OrderDetailsPageWithAuth({ params }: OrderDetailsPageProps) {
  return (
    <PrivateRoute>
      <OrderDetailsPage params={params} />
    </PrivateRoute>
  );
}