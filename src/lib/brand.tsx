'use client';

/**
 * Shared brand design language for GCTS, extracted from the modern homepage so
 * every page reads as one system. Import the palette and primitives from here
 * rather than re-declaring hex values per page.
 */

import { Box, Container, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

/* ------------------------------------------------------------------ palette */
export const brand = {
  ink: '#1a1526', // deep purple-black — primary text / dark sections
  purple: '#9c27b0', // brand primary
  purpleDeep: '#6a1b9a', // gradient depth / hover
  lime: '#cddc39', // highlighter accent
  paper: '#faf9fc', // off-white page background (a hair of purple)
  lavender: '#f3e9f7', // soft card / icon-tile wash
  body: '#443d52', // secondary text — ~9:1 on paper, comfortable to read
  line: 'rgba(26,21,38,0.08)', // hairline borders
} as const;

/**
 * Status accents for dashboard metrics and order states.
 *
 * Deliberately muted and desaturated relative to MUI's defaults — these appear
 * as small tinted washes next to the brand purple, and stock `info.main` /
 * `success.main` are bright enough to fight it. Each is legible as a foreground
 * colour on its own 10% tint.
 */
export const accents = {
  active: '#2563a8', // in-progress / informational
  pending: '#b57314', // awaiting action
  done: '#1f7a4d', // completed
  money: '#6a1b9a', // financial figures — brand purple, deepened
} as const;

/* --------------------------------------------------------- reusable sx bits */

// A modern content card: white, soft border, gentle shadow, hover lift.
export const cardSx: SxProps<Theme> = {
  bgcolor: '#fff',
  borderRadius: 3,
  border: `1px solid ${brand.line}`,
  boxShadow: '0 20px 40px -28px rgba(26,21,38,0.3)',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 24px 44px -24px rgba(106,27,154,0.4)',
    borderColor: 'rgba(156,39,176,0.25)',
  },
};

// Primary filled CTA.
export const primaryButtonSx: SxProps<Theme> = {
  bgcolor: brand.purple,
  color: '#fff',
  fontWeight: 800,
  borderRadius: 2.5,
  boxShadow: '0 16px 30px -12px rgba(156,39,176,0.6)',
  '&:hover': { bgcolor: brand.purpleDeep, transform: 'translateY(-2px)' },
  transition: 'all 0.2s',
};

// Secondary outline CTA.
export const outlineButtonSx: SxProps<Theme> = {
  color: brand.ink,
  fontWeight: 700,
  borderRadius: 2.5,
  border: '1.5px solid rgba(26,21,38,0.15)',
  '&:hover': { borderColor: brand.purple, bgcolor: 'rgba(156,39,176,0.04)' },
};

/* ----------------------------------------------------------- primitives */

// A student's highlighter stroke behind a word — the brand's signature motif.
export function Mark({ children }: { children: React.ReactNode }) {
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
          background: brand.lime,
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

// Small uppercase section label with a lime tick.
export function Eyebrow({ children, sx }: { children: React.ReactNode; sx?: SxProps<Theme> }) {
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
        color: brand.purple,
        mb: 1.5,
        ...sx,
      }}
    >
      <Box aria-hidden sx={{ width: 22, height: 3, borderRadius: 2, background: brand.lime }} />
      {children}
    </Typography>
  );
}

// A section heading block: optional eyebrow + bold title (+ optional subtitle).
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  sx,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'left' | 'center';
  sx?: SxProps<Theme>;
}) {
  return (
    <Box sx={{ textAlign: align, maxWidth: align === 'center' ? 720 : 680, mx: align === 'center' ? 'auto' : 0, ...sx }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Typography
        component="h2"
        sx={{ fontSize: { xs: 28, md: 38 }, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: brand.ink }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ mt: 2, fontSize: { xs: 16, md: 17 }, fontWeight: 500, color: brand.body, lineHeight: 1.6 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

// Standard page header band used at the top of interior pages: a soft
// lavender→paper gradient with an eyebrow, title, and optional subtitle.
export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  align = 'left',
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  align?: 'left' | 'center';
}) {
  return (
    <Box
      sx={{
        background: `radial-gradient(1100px 500px at 80% -20%, ${brand.lavender} 0%, ${brand.paper} 60%)`,
        borderBottom: `1px solid ${brand.line}`,
        py: { xs: 6, md: 9 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: align, maxWidth: align === 'center' ? 760 : 720, mx: align === 'center' ? 'auto' : 0 }}>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <Typography
            component="h1"
            sx={{ fontSize: { xs: 34, sm: 42, md: 50 }, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, color: brand.ink }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ mt: 2.5, fontSize: { xs: 17, md: 19 }, fontWeight: 500, color: brand.body, lineHeight: 1.6, maxWidth: 620, mx: align === 'center' ? 'auto' : 0 }}>
              {subtitle}
            </Typography>
          )}
          {children && <Box sx={{ mt: 4 }}>{children}</Box>}
        </Box>
      </Container>
    </Box>
  );
}

// Page background wrapper so interior pages sit on the brand paper tone.
export function PageShell({ children }: { children: React.ReactNode }) {
  return <Box sx={{ bgcolor: brand.paper, minHeight: '100vh' }}>{children}</Box>;
}

// Header for authenticated app pages (dashboards, orders, payments).
//
// Deliberately lighter than PageHero: no gradient band, no eyebrow rule. Those
// belong to marketing pages a visitor sees once. A tool someone opens daily
// should lead with their data, so this is a title, a line of context, and the
// page's primary action — nothing that costs vertical space every visit.
export function AppPageHeader({
  title,
  subtitle,
  action,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { sm: 'center' },
        gap: 2,
        mb: { xs: 3, md: 4 },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 26, md: 32 },
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            color: brand.ink,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ mt: 0.75, fontSize: 15, fontWeight: 500, color: brand.body }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
  );
}

// A content card for app pages. Same language as cardSx but without the hover
// lift — these hold tables and lists the user is reading, not clicking through.
export const panelSx: SxProps<Theme> = {
  bgcolor: '#fff',
  borderRadius: 3,
  border: `1px solid ${brand.line}`,
  boxShadow: '0 12px 28px -22px rgba(26,21,38,0.35)',
};
