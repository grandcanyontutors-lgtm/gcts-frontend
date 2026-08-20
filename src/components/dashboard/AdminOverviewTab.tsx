'use client';

import { Box, Grid, Typography, Chip, Button, Skeleton, Alert } from '@mui/material';
import {
  AttachMoney,
  PersonAddAlt1,
  RateReview,
  Autorenew,
  ChevronRight,
  CheckCircleOutline,
} from '@mui/icons-material';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useGetOrdersQuery } from '@/store/api/orderApi';
import { useGetReviewsQuery } from '@/store/api/reviewApi';
import { brand, accents, panelSx } from '@/lib/brand';
import { personName } from '@/lib/orderVisibility';

/**
 * What needs the admin right now.
 *
 * This tab used to show a System Health panel and a 7-day activity chart, both
 * reading endpoints that do not exist (`/admin/system-health/`,
 * `/admin/user-activity/` — 404), and a "Key Performance Indicators" panel
 * whose four figures were hardcoded literals: 12.3% user growth, 89.5%
 * completion, $245 average order value, 4.7 satisfaction. None of it came from
 * the database, and the last of those is the worst kind of dashboard content —
 * confident, precise, and invented.
 *
 * What replaced it is the admin's actual job. GCTS runs on the admin being the
 * hinge between student and writer: they confirm the cost, share off-site
 * payment instructions, assign the writer, review the solution before it
 * reaches the requester, and approve reviews before they appear publicly.
 * Every queue below is one of those steps, counted from real order state, and
 * every one links to the filtered list that clears it.
 */

interface QueueDef {
  key: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

const QUEUES: QueueDef[] = [
  {
    key: 'cost',
    label: 'Awaiting cost',
    hint: 'Confirm the price and send payment instructions',
    icon: <AttachMoney />,
    color: accents.money,
    href: '/orders?queue=cost',
  },
  {
    key: 'assign',
    label: 'Needs a writer',
    hint: 'Priced and unassigned',
    icon: <PersonAddAlt1 />,
    color: accents.pending,
    href: '/orders?queue=assign',
  },
  {
    key: 'review',
    label: 'Solutions to review',
    hint: 'Check before releasing to the requester',
    icon: <RateReview />,
    color: accents.active,
    href: '/orders?queue=review',
  },
  {
    key: 'revision',
    label: 'In revision',
    hint: 'Requester asked for changes',
    icon: <Autorenew />,
    color: accents.pending,
    href: '/orders?queue=revision',
  },
];

function QueueCard({
  queue,
  count,
  loading,
}: {
  queue: QueueDef;
  count: number;
  loading: boolean;
}) {
  const idle = !loading && count === 0;
  return (
    <Box
      component={Link}
      href={queue.href}
      sx={{
        ...panelSx,
        display: 'block',
        p: 2.5,
        height: '100%',
        textDecoration: 'none',
        transition: 'all .2s',
        opacity: idle ? 0.65 : 1,
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: 'rgba(156,39,176,0.25)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: `${queue.color}1a`,
            color: queue.color,
            '& svg': { fontSize: 21 },
          }}
        >
          {queue.icon}
        </Box>
        {loading ? (
          <Skeleton variant="text" width={44} height={40} />
        ) : (
          <Typography
            sx={{ fontSize: 30, fontWeight: 800, lineHeight: 1, color: idle ? brand.body : brand.ink }}
          >
            {count}
          </Typography>
        )}
      </Box>
      <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: brand.ink }}>
        {queue.label}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: brand.body, mt: 0.25 }}>{queue.hint}</Typography>
    </Box>
  );
}

export function AdminOverviewTab() {
  // pageSize 1 — these are counts. The total arrives in the pagination meta,
  // so there is no reason to transfer the rows themselves.
  //
  // Written out rather than wrapped in a helper: a hook called from a helper
  // is still a hook, and the rules-of-hooks guarantee comes from the call
  // order being literally visible here.
  const COUNT_ARGS = { page: 1, pageSize: 1 };
  const awaitingCost = useGetOrdersQuery({
    ...COUNT_ARGS,
    filters: { status: ['pending'], payment_status: ['pending'] },
  });
  const needsWriter = useGetOrdersQuery({
    ...COUNT_ARGS,
    filters: { status: ['pending'], unassigned: true },
  });
  const toReview = useGetOrdersQuery({
    ...COUNT_ARGS,
    filters: { status: ['solution_submitted'] },
  });
  const inRevision = useGetOrdersQuery({
    ...COUNT_ARGS,
    filters: { status: ['in_revision'] },
  });

  // The five oldest things still waiting on the admin, so the tab answers
  // "what do I do next" and not only "how much is there".
  const { data: oldest, isLoading: oldestLoading } = useGetOrdersQuery({
    page: 1,
    pageSize: 5,
    ordering: 'created_at',
    filters: { status: ['pending', 'solution_submitted', 'in_revision'] },
  });

  const { data: pendingReviews, isLoading: reviewsLoading } = useGetReviewsQuery({
    status: 'pending',
    pageSize: 5,
  });

  const counts: Record<string, { count: number; loading: boolean }> = {
    cost: { count: awaitingCost.data?.count ?? 0, loading: awaitingCost.isLoading },
    assign: { count: needsWriter.data?.count ?? 0, loading: needsWriter.isLoading },
    review: { count: toReview.data?.count ?? 0, loading: toReview.isLoading },
    revision: { count: inRevision.data?.count ?? 0, loading: inRevision.isLoading },
  };

  const totalWaiting = Object.values(counts).reduce((sum, c) => sum + c.count, 0);
  const anyLoading = Object.values(counts).some((c) => c.loading);

  const reviewRows: any[] = Array.isArray(pendingReviews)
    ? pendingReviews
    : pendingReviews?.results ?? [];

  return (
    <Box>
      <Typography sx={{ fontSize: 18, fontWeight: 800, color: brand.ink, mb: 0.5 }}>
        Needs your attention
      </Typography>
      <Typography sx={{ fontSize: 14, color: brand.body, mb: 2.5 }}>
        Each queue is a step only an admin can clear.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {QUEUES.map((queue) => (
          <Grid item xs={6} md={3} key={queue.key}>
            <QueueCard
              queue={queue}
              count={counts[queue.key].count}
              loading={counts[queue.key].loading}
            />
          </Grid>
        ))}
      </Grid>

      {!anyLoading && totalWaiting === 0 && (
        <Alert icon={<CheckCircleOutline />} severity="success" sx={{ mb: 4 }}>
          Nothing is waiting on you right now.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Box sx={{ ...panelSx, p: 3, height: '100%' }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: brand.ink }}>
                Waiting longest
              </Typography>
              <Button
                component={Link}
                href="/orders"
                endIcon={<ChevronRight />}
                sx={{ textTransform: 'none', fontWeight: 700, color: brand.purple }}
              >
                All orders
              </Button>
            </Box>

            {oldestLoading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} variant="text" height={44} />)
            ) : !oldest?.results?.length ? (
              <Typography sx={{ fontSize: 14, color: brand.body }}>
                No open orders.
              </Typography>
            ) : (
              oldest.results.map((order: any) => (
                <Box
                  key={order.id}
                  component={Link}
                  href={`/orders/${order.id}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    py: 1.25,
                    borderBottom: `1px solid ${brand.line}`,
                    textDecoration: 'none',
                    '&:last-of-type': { borderBottom: 0 },
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: brand.ink,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {order.title}
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, color: brand.body }}>
                      {personName(order.user) || 'Unknown'}
                      {order.created_at &&
                        ` · placed ${formatDistanceToNow(new Date(order.created_at), {
                          addSuffix: true,
                        })}`}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={order.price != null ? `$${order.price}` : 'No cost set'}
                    sx={{
                      flexShrink: 0,
                      bgcolor: order.price != null ? `${accents.done}1a` : `${accents.pending}1a`,
                      color: order.price != null ? accents.done : accents.pending,
                      fontWeight: 700,
                    }}
                  />
                </Box>
              ))
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box sx={{ ...panelSx, p: 3, height: '100%' }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: brand.ink, mb: 2 }}>
              Reviews to approve
            </Typography>
            {reviewsLoading ? (
              [0, 1].map((i) => <Skeleton key={i} variant="text" height={44} />)
            ) : reviewRows.length === 0 ? (
              <Typography sx={{ fontSize: 14, color: brand.body }}>
                No reviews are waiting for approval. Reviews stay hidden from the
                public site until you approve them.
              </Typography>
            ) : (
              reviewRows.slice(0, 5).map((review: any) => (
                <Box
                  key={review.id}
                  sx={{ py: 1.25, borderBottom: `1px solid ${brand.line}`, '&:last-of-type': { borderBottom: 0 } }}
                >
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: brand.ink }}>
                    {personName(review.student) || 'Unknown'} · {review.rating}★
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      color: brand.body,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {review.comment}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
