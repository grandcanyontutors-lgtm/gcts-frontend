'use client';

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Skeleton,
  IconButton,
  Pagination,
  Tooltip,
} from '@mui/material';
import { Visibility, Edit, Assignment } from '@mui/icons-material';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { brand, accents } from '@/lib/brand';
import { orderVisibility, personName, type OrderViewerRole } from '@/lib/orderVisibility';
import { labelFor, SUBJECT_OPTIONS } from '@/lib/orderOptions';
import { statusLabel, statusTone } from '@/lib/orderStatus';

interface OrderTableProps {
  orders: any[];
  isLoading: boolean;
  userRole?: OrderViewerRole;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalCount: number;
}

export function OrderTable({
  orders,
  isLoading,
  userRole,
  onPageChange,
  currentPage,
  totalCount,
}: OrderTableProps) {
  const show = orderVisibility(userRole);

  // Built from the same visibility rules as the cards, so the two views cannot
  // disagree about what a student is allowed to see.
  const columns = [
    { key: 'order', label: 'Order' },
    { key: 'status', label: 'Status' },
    ...(show.requester ? [{ key: 'requester', label: 'Requester' }] : []),
    ...(show.writer ? [{ key: 'writer', label: 'Writer' }] : []),
    { key: 'subject', label: 'Subject' },
    ...(show.costInList ? [{ key: 'cost', label: 'Cost' }] : []),
    { key: 'deadline', label: 'Deadline' },
    { key: 'actions', label: '', align: 'right' as const },
  ];

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
      <TableContainer component={Paper} sx={{ borderRadius: 3, border: `1px solid ${brand.line}` }}>
        <Table>
          <TableBody>
            {Array.from({ length: 6 }).map((_, row) => (
              <TableRow key={row}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Paper sx={{ p: 6, borderRadius: 3, border: `1px solid ${brand.line}`, textAlign: 'center' }}>
        <Assignment sx={{ fontSize: 56, color: brand.body, opacity: 0.4, mb: 2 }} />
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: brand.ink, mb: 0.5 }}>
          No orders found
        </Typography>
        <Typography sx={{ fontSize: 15, color: brand.body }}>
          {userRole === 'student'
            ? "You haven't placed any orders yet."
            : 'Nothing matches the current filters.'}
        </Typography>
      </Paper>
    );
  }

  const pageCount = Math.ceil(totalCount / 12);

  return (
    <Box>
      <TableContainer
        component={Paper}
        // Narrow viewports scroll the table rather than the page — a table that
        // widens the document body breaks every other section on the screen.
        sx={{ borderRadius: 3, border: `1px solid ${brand.line}`, overflowX: 'auto' }}
      >
        <Table sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: brand.paper }}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align}
                  sx={{ fontWeight: 700, color: brand.ink, whiteSpace: 'nowrap' }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              const tone = statusTone(order?.status);
              return (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: brand.ink }}>
                      {order.title}
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, color: brand.body }}>
                      {order?.min_pages ?? 0} {order?.min_pages === 1 ? 'page' : 'pages'}
                      {order?.level ? ` · ${order.level}` : ''}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={statusLabel(order?.status)}
                      size="small"
                      sx={{ bgcolor: `${tone}1a`, color: tone, fontWeight: 700 }}
                    />
                  </TableCell>

                  {show.requester && (
                    <TableCell>
                      <Typography sx={{ fontSize: 13.5, color: brand.ink }}>
                        {personName(order?.user) || '—'}
                      </Typography>
                    </TableCell>
                  )}

                  {show.writer && (
                    <TableCell>
                      <Typography sx={{ fontSize: 13.5, color: brand.body }}>
                        {personName(order?.assigned_to) || 'Unassigned'}
                      </Typography>
                    </TableCell>
                  )}

                  <TableCell>
                    <Typography sx={{ fontSize: 13.5, color: brand.body }}>
                      {labelFor(SUBJECT_OPTIONS, order?.subject)}
                    </Typography>
                  </TableCell>

                  {show.costInList && (
                    <TableCell>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: accents.money }}>
                        {order?.price != null ? `$${order.price}` : '—'}
                      </Typography>
                    </TableCell>
                  )}

                  <TableCell>
                    {order?.deadline ? (
                      <>
                        <Typography sx={{ fontSize: 13.5, color: brand.ink }}>
                          {format(new Date(order.deadline), 'MMM d, yyyy')}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: deadlineTone(order.deadline),
                          }}
                        >
                          {formatDistanceToNow(new Date(order.deadline), { addSuffix: true })}
                        </Typography>
                      </>
                    ) : (
                      <Typography sx={{ fontSize: 13.5, color: brand.body }}>—</Typography>
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="View details">
                      <IconButton
                        component={Link}
                        href={`/orders/${order.id}`}
                        size="small"
                        sx={{ color: brand.purple }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canEdit(order) && (
                      <Tooltip title="Edit order">
                        <IconButton
                          component={Link}
                          href={`/orders/${order.id}/edit`}
                          size="small"
                          sx={{ color: brand.body }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

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
    </Box>
  );
}
