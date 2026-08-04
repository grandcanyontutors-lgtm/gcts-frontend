'use client';

import { useEffect, useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { AutoAwesome, History } from '@mui/icons-material';
import ModernHomePage from '@/components/home/ModernHomePage';
import ClassicHomePage from '@/components/home/ClassicHomePage';

type HomeVariant = 'modern' | 'classic';
const STORAGE_KEY = 'gcts_home_variant';

/**
 * Landing page with a compare toggle between the new modern homepage and the
 * previous ("classic") one. The choice is remembered locally and reflected in
 * the URL (?home=classic) so it can be shared for side-by-side review.
 */
export default function HomePage() {
  const [variant, setVariant] = useState<HomeVariant>('modern');

  // Resolve initial variant from URL or localStorage (client-only).
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('home');
    const stored = localStorage.getItem(STORAGE_KEY) as HomeVariant | null;
    const initial: HomeVariant =
      fromUrl === 'classic' || fromUrl === 'modern'
        ? (fromUrl as HomeVariant)
        : stored === 'classic'
        ? 'classic'
        : 'modern';
    setVariant(initial);
  }, []);

  const handleChange = (_: unknown, next: HomeVariant | null) => {
    if (!next) return;
    setVariant(next);
    localStorage.setItem(STORAGE_KEY, next);
    const url = new URL(window.location.href);
    url.searchParams.set('home', next);
    window.history.replaceState({}, '', url);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Compare toggle — fixed, unobtrusive, keyboard-accessible */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1300,
          bgcolor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          borderRadius: 999,
          boxShadow: '0 10px 30px -8px rgba(26,21,38,0.35)',
          border: '1px solid rgba(26,21,38,0.08)',
          px: 0.75,
          py: 0.75,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', pl: 1.25, display: { xs: 'none', sm: 'block' } }}>
          Homepage:
        </Typography>
        <ToggleButtonGroup
          value={variant}
          exclusive
          onChange={handleChange}
          size="small"
          aria-label="Choose homepage version"
          sx={{
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: '999px !important',
              px: 2,
              py: 0.5,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 13,
              color: 'text.secondary',
              '&.Mui-selected': { bgcolor: '#9c27b0', color: '#fff', '&:hover': { bgcolor: '#7b1fa2' } },
            },
          }}
        >
          <ToggleButton value="modern" aria-label="Modern homepage">
            <AutoAwesome sx={{ fontSize: 16, mr: 0.5 }} /> Modern
          </ToggleButton>
          <ToggleButton value="classic" aria-label="Classic homepage">
            <History sx={{ fontSize: 16, mr: 0.5 }} /> Classic
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {variant === 'modern' ? <ModernHomePage /> : <ClassicHomePage />}
    </Box>
  );
}
