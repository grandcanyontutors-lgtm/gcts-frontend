'use client';

import { Container, Typography, Box, Grid, Card, CardContent, Stack, Button } from '@mui/material';
import {
  School,
  Verified,
  Groups,
  Lock,
  TrendingUp,
  SupportAgent,
  MenuBook,
  EmojiObjects,
} from '@mui/icons-material';
import Link from 'next/link';
import {
  brand,
  cardSx,
  primaryButtonSx,
  outlineButtonSx,
  PageShell,
  PageHero,
  SectionHeading,
  Mark,
} from '@/lib/brand';

const iconTileSx = {
  width: 56,
  height: 56,
  borderRadius: 2.5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: brand.lavender,
  color: brand.purple,
  mb: 2,
};

const values = [
  {
    icon: <Lock sx={{ fontSize: 30 }} />,
    title: 'Confidentiality First',
    description:
      'Your identity and your work stay private. We built GCTS as a safe portal to academic understanding, with strict data protection and anonymous communication between students and experts.',
  },
  {
    icon: <Verified sx={{ fontSize: 30 }} />,
    title: 'Original, Quality Work',
    description:
      'Every paper is researched and written from scratch by a qualified expert, properly cited in your required style, and checked for originality before it ever reaches you.',
  },
  {
    icon: <School sx={{ fontSize: 30 }} />,
    title: 'Learning, Not Shortcuts',
    description:
      'Our model samples, tutoring, and detailed solutions are designed to deepen your understanding so you can produce stronger work on your own.',
  },
  {
    icon: <SupportAgent sx={{ fontSize: 30 }} />,
    title: 'Always Supported',
    description:
      'From the moment you place an order to your final revision, our support team and your assigned expert are reachable around the clock.',
  },
];

const stats = [
  { icon: <Groups sx={{ fontSize: 30 }} />, value: '10,000+', label: 'Students Assisted' },
  { icon: <MenuBook sx={{ fontSize: 30 }} />, value: '25,000+', label: 'Papers Delivered' },
  { icon: <Verified sx={{ fontSize: 30 }} />, value: '500+', label: 'Expert Writers' },
  { icon: <TrendingUp sx={{ fontSize: 30 }} />, value: '98%', label: 'Satisfaction Rate' },
];

const steps = [
  {
    title: 'Tell us what you need',
    description:
      'Share your topic, subject, academic level, citation style, page count, and deadline. Upload any instructions or source material.',
  },
  {
    title: 'Get matched with an expert',
    description:
      'We assign a writer with proven background in your field. You can message them directly to clarify expectations as the work progresses.',
  },
  {
    title: 'Review and refine',
    description:
      'Receive your draft, request up to three free revisions if anything needs adjusting, and approve the final version with confidence.',
  },
];

export default function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="About GCTS"
        title={
          <>
            A safe portal to academic <Mark>understanding</Mark>
          </>
        }
        subtitle="Grand Canyon Tutoring Services connects students with qualified experts for writing help, tutoring, and study resources across dozens of disciplines."
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button component={Link} href="/order/place" variant="contained" size="large" sx={primaryButtonSx}>
            Place your order
          </Button>
          <Button component={Link} href="/services" variant="outlined" size="large" sx={outlineButtonSx}>
            Explore services
          </Button>
        </Stack>
      </PageHero>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        {/* Mission */}
        <Grid container spacing={4} alignItems="center" sx={{ mb: { xs: 8, md: 12 } }}>
          <Grid item xs={12} md={7}>
            <SectionHeading
              eyebrow="Our Mission"
              title={
                <>
                  A learning partner, <Mark>not a shortcut</Mark>
                </>
              }
            />
            <Typography sx={{ mt: 2.5, fontSize: 17, fontWeight: 500, color: brand.body, lineHeight: 1.7, mb: 2 }}>
              Academic life is demanding. Between coursework, jobs, and personal responsibilities, even capable
              students run short on time. GCTS exists to level the playing field — giving every learner access to
              subject-matter experts, clear model work, and one-on-one guidance when they need it most.
            </Typography>
            <Typography sx={{ fontSize: 17, fontWeight: 500, color: brand.body, lineHeight: 1.7 }}>
              We are not a shortcut. We are a learning partner. Our goal is for every student who works with us to
              leave with a stronger grasp of their subject and the confidence to tackle the next challenge themselves.
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                p: { xs: 4, md: 5 },
                borderRadius: 3,
                bgcolor: brand.lavender,
                border: `1px solid ${brand.line}`,
                textAlign: 'center',
              }}
            >
              <Box sx={{ ...iconTileSx, mx: 'auto', bgcolor: '#fff' }}>
                <EmojiObjects sx={{ fontSize: 30 }} />
              </Box>
              <Typography sx={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: brand.ink, lineHeight: 1.3 }}>
                &ldquo;A safe portal to academic understanding.&rdquo;
              </Typography>
              <Typography sx={{ mt: 1.5, fontSize: 15, fontWeight: 500, color: brand.body }}>
                The principle behind everything we build.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: { xs: 8, md: 12 } }}>
          {stats.map((s) => (
            <Grid item xs={6} md={3} key={s.label}>
              <Card sx={{ ...cardSx, textAlign: 'center', height: '100%' }}>
                <CardContent sx={{ py: 4 }}>
                  <Box sx={{ ...iconTileSx, mx: 'auto' }}>{s.icon}</Box>
                  <Typography sx={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: brand.ink }}>
                    {s.value}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: brand.body }}>{s.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Values */}
        <Box sx={{ mb: { xs: 8, md: 12 } }}>
          <SectionHeading
            eyebrow="What We Stand For"
            title="Four commitments to every student"
            subtitle="These principles shape how we work on every single order."
            align="center"
            sx={{ mb: 6 }}
          />
          <Grid container spacing={4}>
            {values.map((v) => (
              <Grid item xs={12} sm={6} key={v.title}>
                <Card sx={{ ...cardSx, height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={iconTileSx}>{v.icon}</Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: brand.ink, mb: 1 }}>
                      {v.title}
                    </Typography>
                    <Typography sx={{ fontSize: 15.5, fontWeight: 500, color: brand.body, lineHeight: 1.65 }}>
                      {v.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* How it works */}
        <Box sx={{ mb: { xs: 8, md: 12 } }}>
          <SectionHeading
            eyebrow="How It Works"
            title="From order to finished work in three steps"
            align="center"
            sx={{ mb: 6 }}
          />
          <Grid container spacing={4}>
            {steps.map((step, i) => (
              <Grid item xs={12} md={4} key={step.title}>
                <Card sx={{ ...cardSx, height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: brand.purple,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        mb: 2,
                      }}
                    >
                      {i + 1}
                    </Box>
                    <Typography sx={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: brand.ink, mb: 1 }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ fontSize: 15.5, fontWeight: 500, color: brand.body, lineHeight: 1.65 }}>
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA */}
        <Box
          sx={{
            p: { xs: 4, md: 7 },
            borderRadius: 4,
            textAlign: 'center',
            background: `radial-gradient(900px 400px at 50% -40%, ${brand.lavender} 0%, #fff 70%)`,
            border: `1px solid ${brand.line}`,
          }}
        >
          <Typography sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 800, letterSpacing: '-0.02em', color: brand.ink, mb: 2 }}>
            Ready to get <Mark>started</Mark>?
          </Typography>
          <Typography sx={{ fontSize: 17, fontWeight: 500, color: brand.body, mb: 4, maxWidth: 560, mx: 'auto', lineHeight: 1.6 }}>
            Browse our sample papers, explore what we offer, or place your first order in minutes.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button component={Link} href="/order/place" variant="contained" size="large" sx={primaryButtonSx}>
              Place an order
            </Button>
            <Button component={Link} href="/services" variant="outlined" size="large" sx={outlineButtonSx}>
              Explore services
            </Button>
          </Stack>
        </Box>
      </Container>
    </PageShell>
  );
}
