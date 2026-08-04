'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from '@/lib/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

// Versioned: the v1 key holds auto-detected values that were never a real
// user choice, so it is intentionally abandoned rather than migrated.
const THEME_KEY = 'gcts-theme-v2';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only an explicit, user-chosen theme is honoured.
    //
    // We deliberately do NOT fall back to `prefers-color-scheme` here. The site's
    // design language (see src/lib/brand.tsx) is a light one and pages hardcode
    // its tokens — white cards, ink text, lavender washes. Auto-selecting dark
    // from the OS produced a broken hybrid: MUI-defaulted elements such as text
    // fields turned dark grey inside cards that were still white. Until there is
    // a real dark pass over the brand tokens, dark mode is opt-in only.
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemeMode;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setMode(savedTheme);
    }
    setMounted(true);
  }, []);

  // Persist only on an explicit choice. The previous implementation wrote the
  // mode on every mount, which meant an auto-detected 'dark' got stored as if
  // the user had picked it — hence the versioned key above, so those stale
  // values are ignored rather than re-applied.
  const persist = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem(THEME_KEY, newMode);
  };

  const toggleTheme = () => persist(mode === 'light' ? 'dark' : 'light');

  const setTheme = (newMode: ThemeMode) => persist(newMode);

  const theme = getTheme(mode);

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}