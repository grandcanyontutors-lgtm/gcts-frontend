'use client';

import { Container, Typography, Box, Grid, Card, CardContent, Chip, Stack, Button } from '@mui/material';
import {
  EditNote,
  Science,
  MenuBook,
  Slideshow,
  FactCheck,
  Calculate,
  Psychology,
  Verified,
  Schedule,
  Lock,
  Autorenew,
  SupportAgent,
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

const services = [
  {
    icon: <EditNote sx={{ fontSize: 30 }} />,
    title: 'Essays & Academic Writing',
    description:
      'Argumentative, admission, reflective, and analytical essays crafted to your prompt, level, and citation style — fully original and ready to learn from.',
  },
  {
    icon: <Science sx={{ fontSize: 30 }} />,
    title: 'Research Papers & Proposals',
    description:
      'In-depth research papers, research proposals, annotated bibliographies, and literature reviews backed by credible, properly cited sources.',
  },
  {
    icon: <MenuBook sx={{ fontSize: 30 }} />,
    title: 'Theses & Dissertations',
    description:
      'Long-form support for capstone projects, theses, and dissertations — from outline and methodology through to discussion and references.',
  },
  {
    icon: <Slideshow sx={{ fontSize: 30 }} />,
    title: 'Presentations & Reports',
    description:
      'PowerPoint presentations (with speaker notes), lab reports, case studies, business plans, and professional reports tailored to your audience.',
  },
  {
    icon: <FactCheck sx={{ fontSize: 30 }} />,
    title: 'Editing & Proofreading',
    description:
      'Polish existing drafts for clarity, grammar, structure, and citation accuracy — without changing your voice.',
  },
  {
    icon: <Calculate sx={{ fontSize: 30 }} />,
    title: 'Problem Solving & Coursework',
    description:
      'Step-by-step worked solutions for quantitative coursework, homework sets, and online assignments so you can follow the reasoning.',
  },
  {
    icon: <Psychology sx={{ fontSize: 30 }} />,
    title: 'One-on-One Tutoring',
    description:
      'Personalized tutoring and study coaching to strengthen your understanding of difficult topics before exams and submissions.',
  },
  {
    icon: <MenuBook sx={{ fontSize: 30 }} />,
    title: 'Sample Paper Library',
    description:
      'Browse our growing library of model papers to see how strong academic work is structured, argued, and referenced.',
  },
];

const subjects = [
  'Nursing', 'Psychology', 'Sociology', 'Healthcare', 'Business', 'Management',
  'Engineering', 'Education', 'Law', 'History', 'Literature', 'Biology',
  'Chemistry', 'Physics', 'Mathematics', 'Computer Science', 'Information Technology',
  'Economics', 'Finance', 'Accounting', 'Marketing', 'Political Science',
  'Philosophy', 'Religion', 'Arts', 'Architecture', 'Linguistics', 'and more',
];

const levels = ['College', "Bachelor's", "Master's", 'Doctorate'];
const styles = ['APA (6th & 7th)', 'MLA', 'Chicago/Turabian', 'Harvard', 'IEEE'];

const guarantees = [
  { icon: <Verified sx={{ fontSize: 26 }} />, title: 'Original Work', text: 'Written from scratch and checked for originality.' },
  { icon: <Autorenew sx={{ fontSize: 26 }} />, title: 'Free Revisions', text: 'Up to three rounds of revisions on every order.' },
  { icon: <Schedule sx={{ fontSize: 26 }} />, title: 'On-Time Delivery', text: 'Deadlines from urgent turnarounds to long projects.' },
  { icon: <Lock sx={{ fontSize: 26 }} />, title: 'Confidential', text: 'Private accounts and anonymous communication.' },
  { icon: <SupportAgent sx={{ fontSize: 26 }} />, title: '24/7 Support', text: 'Reach your expert and our team anytime.' },
];

export default function ServicesPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Our Services"
        title={
          <>
            Expert help for every <Mark>assignment</Mark>
          </>
        }
        subtitle="Whatever the assignment, GCTS pairs you with a qualified expert and gives you the model work, guidance, and support to understand it — across every academic level and citation style."
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button component={Link} href="/order/place" variant="contained" size="large" sx={primaryButtonSx}>
            Place your order
          </Button>
          <Button component={Link} href="/papers" variant="outlined" size="large" sx={outlineButtonSx}>
            Browse sample papers
          </Button>
        </Stack>
      </PageHero>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        {/* Service cards */}
        <SectionHeading
          eyebrow="What We Offer"
          title="A service for every stage of your work"
          align="center"
          sx={{ mb: 6 }}
        />
        <Grid container spacing={4} sx={{ mb: { xs: 8, md: 12 } }}>
          {services.map((s) => (
            <Grid item xs={12} sm={6} md={3} key={s.title}>
              <Card sx={{ ...cardSx, height: '100%' }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Box sx={iconTileSx}>{s.icon}</Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: brand.ink, mb: 1 }}>
                    {s.title}
                  </Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 500, color: brand.body, lineHeight: 1.6 }}>
                    {s.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Subjects */}
        <Box sx={{ ...cardSx, p: { xs: 3.5, md: 5 }, mb: { xs: 6, md: 8 }, '&:hover': {} }}>
          <SectionHeading
            eyebrow="Disciplines"
            title="Subjects we cover"
            subtitle="Our experts span the humanities, sciences, business, and technical disciplines. A selection of what we support:"
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3 }}>
            {subjects.map((subject) => (
              <Chip
                key={subject}
                label={subject}
                sx={{
                  bgcolor: brand.lavender,
                  color: brand.ink,
                  fontWeight: 600,
                  border: `1px solid ${brand.line}`,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Levels + styles */}
        <Grid container spacing={4} sx={{ mb: { xs: 8, md: 12 } }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ ...cardSx, p: 4, height: '100%', '&:hover': {} }}>
              <Typography sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: brand.ink, mb: 2 }}>
                Academic Levels
              </Typography>
              <Stack spacing={1.25}>
                {levels.map((l) => (
                  <Stack key={l} direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: brand.purple, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: brand.body }}>{l}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ ...cardSx, p: 4, height: '100%', '&:hover': {} }}>
              <Typography sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: brand.ink, mb: 2 }}>
                Citation Styles
              </Typography>
              <Stack spacing={1.25}>
                {styles.map((st) => (
                  <Stack key={st} direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: brand.purple, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: brand.body }}>{st}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* Guarantees */}
        <Box sx={{ mb: { xs: 8, md: 12 } }}>
          <SectionHeading
            eyebrow="Our Promise"
            title="Every order includes"
            subtitle="Standards we hold ourselves to on every single project."
            align="center"
            sx={{ mb: 6 }}
          />
          <Grid container spacing={3}>
            {guarantees.map((g) => (
              <Grid item xs={12} sm={6} md={4} key={g.title}>
                <Box sx={{ ...cardSx, p: 3, height: '100%', display: 'flex', gap: 2, alignItems: 'flex-start', '&:hover': {} }}>
                  <Box sx={{ ...iconTileSx, width: 44, height: 44, mb: 0, flexShrink: 0 }}>{g.icon}</Box>
                  <Box>
                    <Typography sx={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', color: brand.ink }}>
                      {g.title}
                    </Typography>
                    <Typography sx={{ fontSize: 14.5, fontWeight: 500, color: brand.body, lineHeight: 1.55 }}>
                      {g.text}
                    </Typography>
                  </Box>
                </Box>
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
            Find the help that <Mark>fits</Mark> your assignment
          </Typography>
          <Typography sx={{ fontSize: 17, fontWeight: 500, color: brand.body, mb: 4, maxWidth: 560, mx: 'auto', lineHeight: 1.6 }}>
            Place an order with your details and deadline, and we&apos;ll match you with the right expert.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button component={Link} href="/order/place" variant="contained" size="large" sx={primaryButtonSx}>
              Place an order
            </Button>
            <Button component={Link} href="/papers" variant="outlined" size="large" sx={outlineButtonSx}>
              Browse sample papers
            </Button>
          </Stack>
        </Box>
      </Container>
    </PageShell>
  );
}
