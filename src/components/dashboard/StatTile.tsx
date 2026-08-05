'use client';

import { ReactNode } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { brand, panelSx } from '@/lib/brand';

interface StatTileProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  /** Accent for the icon tile. Accepts a hex; defaults to the brand purple. */
  color?: string;
  loading?: boolean;
}

/**
 * Compact single-metric tile used across the role dashboards.
 * Intentionally minimal — one icon, one number, one label — to keep the
 * dashboards focused on essential information.
 *
 * The icon sits on a tinted wash rather than a saturated filled Avatar: at four
 * tiles across, solid circles of four different colours read as decoration and
 * pull attention away from the numbers, which are the point.
 */
export function StatTile({ icon, label, value, color = brand.purple, loading }: StatTileProps) {
  return (
    <Box
      sx={{
        ...panelSx,
        height: '100%',
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: 2,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${color}1a`, // 10% tint of the accent
          color,
          '& svg': { fontSize: 24 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="div"
          sx={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: brand.ink }}
        >
          {loading ? <Skeleton width={56} /> : value}
        </Typography>
        <Typography noWrap sx={{ fontSize: 14, fontWeight: 600, color: brand.body }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}
