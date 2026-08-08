'use client';

/**
 * Conversion-focused landing page for GCTS.
 *
 * Thesis: the product's real edge is transparency + a safety net — every
 * solution is reviewed by our team before the student sees it, 2 free
 * revisions are included, and there's no payment until we confirm the quote.
 * That trust story leads the page instead of a generic hero stat.
 *
 * Signature: a highlighter motif (a student's own marker) under the key
 * promise, plus an "order preview" card that mirrors the real quote→reviewed
 * flow so the purchase is de-risked in the hero itself.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  Rating,
  Avatar,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowForward,
  FactCheck,
  Loop,
  Schedule,
  Lock,
  CheckCircle,
  ExpandMore,
  School,
  MenuBook,
  WorkspacePremium,
  SupportAgent,
  FormatQuote,
  Bolt,
  Star,
} from '@mui/icons-material';
import { APIClient, SiteStats, ReviewsResponse, Review } from '@/lib/api';

/* ----------------------------------------------------------------- palette */
const INK = '#1a1526'; // deep purple-black
const PURPLE = '#9c27b0'; // brand primary
const PURPLE_DEEP = '#6a1b9a';
const LIME = '#cddc39'; // highlighter accent
const PAPER = '#faf9fc'; // off-white with a hair of purple
const LAVENDER = '#f3e9f7'; // soft card wash
const BODY = '#443d52'; // secondary/body text — darker than MUI text.secondary for comfortable reading (~9:1 on paper)

const ORDER_URL = '/order/place';

/* --------------------------------------------------------------- primitives */

// A student's highlighter stroke behind a word — the page's signature motif.
function Mark({ children }: { children: React.ReactNode }) {
  return (
    <Box component="span" sx={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap' }}>
      <Box
        component="span"
        aria-hidden
        sx={{
          position: 'absolute',
          left: -6,
          right: -6,
          bottom: '0.12em',
          height: '0.44em',
          background: LIME,
          borderRadius: '3px',
          transform: 'rotate(-1.4deg)',
          zIndex: 0,
        }}
      />
      <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
}

// Passthrough. Content is always rendered fully visible — no opacity/transform
// animation gates legibility, so nothing can ever be stranded invisible
// (backgrounded tabs, no-JS, throttled paint, etc.). The page's polish comes
// from layout, color, and the user-triggered hover interactions on cards.
// Kept as a wrapper so section markup stays unchanged and motion can be
// reintroduced centrally later if desired.
function Reveal({ children }: { children: React.ReactNode; delay?: number; y?: number }) {
  return <>{children}</>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: PURPLE,
        mb: 1.5,
      }}
    >
      <Box aria-hidden sx={{ width: 22, height: 3, borderRadius: 2, background: LIME }} />
      {children}
    </Typography>
  );
}

/* ------------------------------------------------------------- hero visual */

// An order-preview card mirroring the real product flow: quote confirmed,
// writer assigned, reviewed — the purchase de-risked at a glance.
function OrderPreviewCard() {
  const stages = ['Placed', 'Quote confirmed', 'Writer assigned', 'Reviewed'];
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 420,
        bgcolor: '#fff',
        borderRadius: 4,
        p: { xs: 2.5, sm: 3 },
        boxShadow: '0 30px 60px -20px rgba(106,27,154,0.35)',
        border: '1px solid rgba(156,39,176,0.12)',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 12, color: BODY, fontWeight: 700, letterSpacing: '0.06em' }}>
            ORDER #GC-2048
          </Typography>
          <Typography sx={{ fontWeight: 800, color: INK }}>Research Paper · Nursing</Typography>
        </Box>
        <Chip
          icon={<CheckCircle sx={{ fontSize: 16 }} />}
          label="Reviewed"
          size="small"
          sx={{ bgcolor: LIME, color: INK, fontWeight: 800, '& .MuiChip-icon': { color: INK } }}
        />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
        <Chip
          label="APA · 8 pages"
          size="small"
          sx={{ bgcolor: LAVENDER, color: INK, fontWeight: 600, '& .MuiChip-label': { color: INK } }}
        />
        <Chip
          label="Due in 3 days"
          size="small"
          sx={{ bgcolor: LAVENDER, color: INK, fontWeight: 600, '& .MuiChip-label': { color: INK } }}
        />
      </Stack>

      {/* progress rail */}
      <Box sx={{ position: 'relative', mb: 1 }}>
        <Box sx={{ position: 'absolute', top: 9, left: 10, right: 10, height: 2, bgcolor: LAVENDER }} />
        <Box
          sx={{
            position: 'absolute',
            top: 9,
            left: 10,
            width: 'calc(100% - 20px)',
            height: 2,
            background: `linear-gradient(90deg, ${PURPLE}, ${LIME})`,
          }}
        />
        <Stack direction="row" justifyContent="space-between" sx={{ position: 'relative' }}>
          {stages.map((s, i) => (
            <Box key={s} sx={{ textAlign: 'center', width: 70 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  mx: 'auto',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: i === stages.length - 1 ? LIME : PURPLE,
                  color: i === stages.length - 1 ? INK : '#fff',
                  boxShadow: '0 2px 8px rgba(106,27,154,0.3)',
                }}
              >
                <CheckCircle sx={{ fontSize: 13 }} />
              </Box>
              <Typography sx={{ fontSize: 10.5, mt: 0.75, color: BODY, fontWeight: 600, lineHeight: 1.2 }}>
                {s}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography sx={{ fontSize: 12, color: BODY }}>Confirmed quote</Typography>
          <Typography sx={{ fontWeight: 800, color: INK, fontSize: 22 }}>$120</Typography>
        </Box>
        <Stack alignItems="flex-end" spacing={0.25}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Loop sx={{ fontSize: 15, color: PURPLE }} />
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: INK }}>2 free revisions left</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <WorkspacePremium sx={{ fontSize: 15, color: PURPLE }} />
            <Typography sx={{ fontSize: 12.5, color: BODY }}>Verified expert writer</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

/* ------------------------------------------------------------------ content */

const GUARANTEES = [
  { icon: <FactCheck />, title: 'Checked before you get it', body: 'Every solution passes our team’s quality review before it ever reaches you.' },
  { icon: <Loop />, title: '2 free revisions', body: 'Not quite right? Send it back twice at no extra cost until it fits.' },
  { icon: <Schedule />, title: 'On your deadline', body: 'Tell us when it’s due. We plan around your date, not ours.' },
  { icon: <Lock />, title: 'Private and secure', body: 'Your details and your order stay confidential. Always.' },
];

const STEPS = [
  { n: '01', title: 'Tell us about your assignment', body: 'Share the topic, level, citation style, deadline, and any files. Takes about two minutes.' },
  { n: '02', title: 'We confirm your quote', body: 'Our team reviews it and sends you a clear price with payment instructions. No payment until you agree.' },
  { n: '03', title: 'An expert writer gets to work', body: 'We match your order to a verified writer in your subject and keep you posted on progress.' },
  { n: '04', title: 'Review, revise, done', body: 'We quality-check the work, then release it to you — with 2 free revisions if anything needs tuning.' },
];

const FEATURES = [
  { icon: <School />, title: 'Experts in your subject', body: 'Nursing, business, psychology, literature and more — matched to someone who knows the field.' },
  { icon: <FactCheck />, title: 'A second set of eyes', body: 'Nothing reaches you unchecked. Our team reviews every solution before it’s released.' },
  { icon: <MenuBook />, title: 'Original, cited work', body: 'Written for your brief from scratch, in the citation style you need.' },
  { icon: <Bolt />, title: 'Any deadline', body: 'From two weeks out to a tight turnaround, we build the plan around your due date.' },
  { icon: <SupportAgent />, title: 'Talk to a human', body: 'Message us on your order page anytime — questions, updates, or changes.' },
  { icon: <WorkspacePremium />, title: 'Quality you can trust', body: 'Thousands of students come back because the work holds up.' },
];

const FAQS = [
  { q: 'How does payment work?', a: 'You never pay upfront. Place your order, we review it and send you a confirmed quote with payment instructions, and you decide from there. Payment is handled off the platform for your security.' },
  { q: 'Is my information confidential?', a: 'Yes. Your identity, your order details, and your files stay private. We never share them.' },
  { q: 'What if the work needs changes?', a: 'Every order includes 2 free revisions. After we release your solution, you can request changes and your writer will revise it.' },
  { q: 'Will it be original?', a: 'Every solution is written from scratch for your specific brief and cited in your required style — then reviewed by our team before you receive it.' },
];

/* -------------------------------------------------------------------- page */

export default function HomePage() {
  const [stats, setStats] = useState<SiteStats>({
    happy_students: '10,000+',
    papers_delivered: '25,000+',
    expert_writers: '500+',
    success_rate: '98%',
    source: 'fallback',
  });
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await APIClient.getStats();
        if (alive && s) setStats(s);
      } catch {
        /* keep fallback */
      }
      try {
        const r: ReviewsResponse = await APIClient.getReviews();
        if (alive && r?.reviews?.length) setReviews(r.reviews.slice(0, 3));
      } catch {
        /* section hides itself */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const statItems = [
    { value: stats.happy_students, label: 'Students helped' },
    { value: stats.papers_delivered, label: 'Solutions delivered' },
    { value: stats.expert_writers, label: 'Verified writers' },
    { value: stats.success_rate, label: 'On-time rate' },
  ];

  return (
    <Box sx={{ bgcolor: PAPER, color: INK, overflowX: 'hidden' }}>
      {/* ============================================================ HERO */}
      <Box
        sx={{
          position: 'relative',
          background: `radial-gradient(1200px 600px at 85% -10%, ${LAVENDER} 0%, ${PAPER} 55%)`,
          pt: { xs: 6, md: 10 },
          pb: { xs: 7, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6.5}>
              <Reveal y={16}>
                <Chip
                  icon={<Star sx={{ fontSize: 16 }} />}
                  label="Rated 4.9/5 by students"
                  sx={{
                    mb: 3,
                    bgcolor: '#fff',
                    color: INK,
                    border: '1px solid rgba(156,39,176,0.28)',
                    fontWeight: 700,
                    '& .MuiChip-label': { color: INK },
                    '& .MuiChip-icon': { color: PURPLE },
                  }}
                />
              </Reveal>
              <Reveal delay={0.05}>
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: 40, sm: 52, md: 60 },
                    fontWeight: 800,
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                    mb: 2.5,
                  }}
                >
                  Turn in your <Mark>best work</Mark>, every time.
                </Typography>
              </Reveal>
              <Reveal delay={0.1}>
                <Typography sx={{ fontSize: { xs: 17, md: 19 }, fontWeight: 500, color: BODY, maxWidth: 560, mb: 4, lineHeight: 1.6 }}>
                  Expert help with essays, research papers, and assignments — every solution reviewed
                  by our team before you get it. Includes 2 free revisions, and there’s no payment
                  until we confirm your quote.
                </Typography>
              </Reveal>
              <Reveal delay={0.15}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    component={Link}
                    href={ORDER_URL}
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: PURPLE,
                      color: '#fff',
                      px: 4,
                      py: 1.6,
                      fontSize: 17,
                      fontWeight: 800,
                      borderRadius: 2.5,
                      boxShadow: '0 16px 30px -12px rgba(156,39,176,0.6)',
                      '&:hover': { bgcolor: PURPLE_DEEP, transform: 'translateY(-2px)' },
                      transition: 'all 0.2s',
                    }}
                  >
                    Place your order
                  </Button>
                  <Button
                    component={Link}
                    href="#how"
                    size="large"
                    sx={{
                      color: INK,
                      px: 3,
                      py: 1.6,
                      fontSize: 16,
                      fontWeight: 700,
                      borderRadius: 2.5,
                      border: '1.5px solid rgba(26,21,38,0.15)',
                      '&:hover': { borderColor: PURPLE, bgcolor: 'rgba(156,39,176,0.04)' },
                    }}
                  >
                    See how it works
                  </Button>
                </Stack>
              </Reveal>
              <Reveal delay={0.2}>
                <Stack direction="row" flexWrap="wrap" gap={2.5} sx={{ mt: 4 }}>
                  {['No payment until you approve the quote', 'Confidential', '2 free revisions'].map((t) => (
                    <Stack key={t} direction="row" spacing={0.75} alignItems="center">
                      <CheckCircle sx={{ fontSize: 18, color: PURPLE }} />
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: BODY }}>{t}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Reveal>
            </Grid>
            <Grid item xs={12} md={5.5}>
              <Reveal delay={0.15} y={30}>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                  <OrderPreviewCard />
                </Box>
              </Reveal>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ==================================================== GUARANTEE STRIP */}
      <Container maxWidth="lg" sx={{ mt: { xs: -2, md: -6 }, position: 'relative', zIndex: 2 }}>
        <Reveal>
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: 4,
              p: { xs: 2.5, md: 3.5 },
              boxShadow: '0 20px 50px -24px rgba(26,21,38,0.25)',
              border: '1px solid rgba(26,21,38,0.06)',
            }}
          >
            <Grid container spacing={{ xs: 2.5, md: 2 }}>
              {GUARANTEES.map((g, i) => (
                <Grid key={g.title} item xs={12} sm={6} md={3}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start"
                    sx={{ borderLeft: { md: i === 0 ? 'none' : '1px solid rgba(26,21,38,0.08)' }, pl: { md: i === 0 ? 0 : 2.5 } }}>
                    <Box sx={{ color: PURPLE, mt: 0.25, '& svg': { fontSize: 26 } }}>{g.icon}</Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 0.25 }}>{g.title}</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: BODY, lineHeight: 1.5 }}>{g.body}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Reveal>
      </Container>

      {/* ============================================================ HOW IT WORKS */}
      <Container maxWidth="lg" id="how" sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: 80 }}>
        <Reveal>
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
            <Eyebrow>How it works</Eyebrow>
            <Typography component="h2" sx={{ fontSize: { xs: 30, md: 40 }, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Four steps from stuck to <Mark>submitted</Mark>
            </Typography>
          </Box>
        </Reveal>
        <Grid container spacing={{ xs: 3, md: 3 }}>
          {STEPS.map((step, i) => (
            <Grid key={step.n} item xs={12} sm={6} md={3}>
              <Reveal delay={i * 0.08}>
                <Box sx={{ height: '100%' }}>
                  <Typography
                    sx={{
                      fontSize: 40,
                      fontWeight: 800,
                      color: 'transparent',
                      WebkitTextStroke: `1.5px ${PURPLE}`,
                      lineHeight: 1,
                      mb: 1.5,
                    }}
                  >
                    {step.n}
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 1 }}>{step.title}</Typography>
                  <Typography sx={{ fontSize: 14.5, fontWeight: 500, color: BODY, lineHeight: 1.6 }}>{step.body}</Typography>
                </Box>
              </Reveal>
            </Grid>
          ))}
        </Grid>
        <Reveal delay={0.1}>
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              component={Link}
              href={ORDER_URL}
              size="large"
              endIcon={<ArrowForward />}
              sx={{ bgcolor: INK, color: '#fff', px: 4, py: 1.5, fontWeight: 800, borderRadius: 2.5, '&:hover': { bgcolor: '#000' } }}
            >
              Start your order
            </Button>
          </Box>
        </Reveal>
      </Container>

      {/* ============================================================ FEATURES */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Reveal>
            <Box sx={{ maxWidth: 640, mb: { xs: 5, md: 7 } }}>
              <Eyebrow>Why students choose us</Eyebrow>
              <Typography component="h2" sx={{ fontSize: { xs: 30, md: 40 }, fontWeight: 800, letterSpacing: '-0.02em' }}>
                Help you can actually trust with your grade
              </Typography>
            </Box>
          </Reveal>
          <Grid container spacing={3}>
            {FEATURES.map((f, i) => (
              <Grid key={f.title} item xs={12} sm={6} md={4}>
                <Reveal delay={(i % 3) * 0.08}>
                  <Box
                    sx={{
                      height: '100%',
                      p: 3,
                      borderRadius: 3,
                      bgcolor: PAPER,
                      border: '1px solid rgba(26,21,38,0.06)',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 40px -24px rgba(106,27,154,0.4)', borderColor: 'rgba(156,39,176,0.25)' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: LAVENDER,
                        color: PURPLE,
                        mb: 2,
                        '& svg': { fontSize: 24 },
                      }}
                    >
                      {f.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 17, mb: 0.75 }}>{f.title}</Typography>
                    <Typography sx={{ fontSize: 14.5, fontWeight: 500, color: BODY, lineHeight: 1.6 }}>{f.body}</Typography>
                  </Box>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ============================================================ STATS BAND */}
      <Box sx={{ background: `linear-gradient(135deg, ${PURPLE_DEEP} 0%, ${INK} 100%)`, py: { xs: 7, md: 9 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {statItems.map((s, i) => (
              <Grid key={s.label} item xs={6} md={3} sx={{ textAlign: 'center' }}>
                <Reveal delay={i * 0.08}>
                  <Typography sx={{ fontSize: { xs: 34, md: 46 }, fontWeight: 800, color: LIME, lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {s.value}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', mt: 1, fontWeight: 600 }}>{s.label}</Typography>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ============================================================ TESTIMONIALS */}
      {reviews.length > 0 && (
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Reveal>
            <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
              <Eyebrow>Student stories</Eyebrow>
              <Typography component="h2" sx={{ fontSize: { xs: 30, md: 40 }, fontWeight: 800, letterSpacing: '-0.02em' }}>
                Real orders, <Mark>real relief</Mark>
              </Typography>
            </Box>
          </Reveal>
          <Grid container spacing={3}>
            {reviews.map((r, i) => (
              <Grid key={r.id} item xs={12} md={4}>
                <Reveal delay={i * 0.08}>
                  <Box
                    sx={{
                      height: '100%',
                      p: 3.5,
                      borderRadius: 3,
                      bgcolor: '#fff',
                      border: '1px solid rgba(26,21,38,0.06)',
                      boxShadow: '0 20px 40px -28px rgba(26,21,38,0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <FormatQuote sx={{ fontSize: 34, color: LIME, transform: 'scaleX(-1)' }} />
                    <Rating value={r.rating} precision={0.1} readOnly size="small" sx={{ mb: 1.5 }} />
                    <Typography sx={{ fontSize: 15, color: INK, lineHeight: 1.6, flexGrow: 1 }}>
                      {r.review}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: LAVENDER, color: PURPLE, fontWeight: 800, width: 38, height: 38 }}>
                        {(r.subject || 'G').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 800 }}>{r.subject || 'Verified order'}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: BODY }}>
                          {r.order_type}{r.month_year ? ` · ${r.month_year}` : ''}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {/* ============================================================ RISK REVERSAL */}
      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
        <Reveal>
          <Box
            sx={{
              borderRadius: 5,
              p: { xs: 3.5, md: 6 },
              background: `linear-gradient(120deg, ${LAVENDER} 0%, #fff 100%)`,
              border: '1px solid rgba(156,39,176,0.15)',
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Eyebrow>No surprises</Eyebrow>
                <Typography component="h2" sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 800, letterSpacing: '-0.02em', mb: 2 }}>
                  You see the price before you commit a cent
                </Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 500, color: BODY, lineHeight: 1.7, maxWidth: 520 }}>
                  Place your order and we’ll confirm a clear quote with payment instructions first.
                  Nothing is charged automatically, your work is quality-checked before it reaches
                  you, and 2 free revisions are always included.
                </Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <Stack spacing={1.5}>
                  {[
                    'Confirmed quote before any payment',
                    'Reviewed by our team before delivery',
                    '2 free revisions on every order',
                    'Confidential from start to finish',
                  ].map((t) => (
                    <Stack key={t} direction="row" spacing={1.5} alignItems="center">
                      <CheckCircle sx={{ color: PURPLE }} />
                      <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{t}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Reveal>
      </Container>

      {/* ============================================================ FAQ */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <Reveal>
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
              <Eyebrow>Good to know</Eyebrow>
              <Typography component="h2" sx={{ fontSize: { xs: 30, md: 40 }, fontWeight: 800, letterSpacing: '-0.02em' }}>
                Questions students ask first
              </Typography>
            </Box>
          </Reveal>
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05}>
              <Accordion
                disableGutters
                elevation={0}
                sx={{
                  bgcolor: PAPER,
                  border: '1px solid rgba(26,21,38,0.07)',
                  borderRadius: '12px !important',
                  mb: 1.5,
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore sx={{ color: PURPLE }} />} sx={{ px: 3, py: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 16, color: INK }}>{f.q}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 2.5, pt: 0 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 500, color: BODY, lineHeight: 1.7 }}>{f.a}</Typography>
                </AccordionDetails>
              </Accordion>
            </Reveal>
          ))}
        </Container>
      </Box>

      {/* ============================================================ FINAL CTA */}
      <Box sx={{ background: `linear-gradient(135deg, ${PURPLE} 0%, ${PURPLE_DEEP} 100%)`, py: { xs: 9, md: 13 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Reveal>
            <Typography component="h2" sx={{ fontSize: { xs: 32, md: 46 }, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', mb: 2, lineHeight: 1.1 }}>
              Your deadline’s coming. Get ahead of it.
            </Typography>
            <Typography sx={{ fontSize: { xs: 16, md: 18 }, color: 'rgba(255,255,255,0.85)', mb: 4, maxWidth: 560, mx: 'auto', lineHeight: 1.6 }}>
              Place your order in about two minutes. We’ll confirm your quote and take it from there.
            </Typography>
            <Button
              component={Link}
              href={ORDER_URL}
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: LIME,
                color: INK,
                px: 5,
                py: 1.75,
                fontSize: 18,
                fontWeight: 800,
                borderRadius: 2.5,
                boxShadow: '0 18px 40px -14px rgba(0,0,0,0.4)',
                '&:hover': { bgcolor: '#dce85a', transform: 'translateY(-2px)' },
                transition: 'all 0.2s',
              }}
            >
              Place your order
            </Button>
            <Typography sx={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', mt: 2.5 }}>
              No upfront payment · Confidential · 2 free revisions
            </Typography>
          </Reveal>
        </Container>
      </Box>
    </Box>
  );
}
