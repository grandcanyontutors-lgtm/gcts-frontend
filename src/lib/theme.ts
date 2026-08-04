import { createTheme } from '@mui/material/styles';
import { designTokens } from './designTokens';

// Create light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: designTokens.colors.primary[500],
      light: designTokens.colors.primary[300],
      dark: designTokens.colors.primary[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: designTokens.colors.secondary[500],
      light: designTokens.colors.secondary[300],
      dark: designTokens.colors.secondary[700],
      contrastText: designTokens.colors.neutral[900],
    },
    error: {
      main: designTokens.colors.error[500],
      light: designTokens.colors.error[300],
      dark: designTokens.colors.error[700],
    },
    warning: {
      main: designTokens.colors.warning[500],
      light: designTokens.colors.warning[300],
      dark: designTokens.colors.warning[700],
    },
    info: {
      main: designTokens.colors.info[500],
      light: designTokens.colors.info[300],
      dark: designTokens.colors.info[700],
    },
    success: {
      main: designTokens.colors.success[500],
      light: designTokens.colors.success[300],
      dark: designTokens.colors.success[700],
    },
    grey: designTokens.colors.neutral,
    background: {
      default: designTokens.colors.neutral[50],
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1526', // brand ink — deep purple-black
      secondary: '#443d52', // darker than neutral[600] so body copy reads comfortably (~9:1 on paper)
    },
  },
  typography: {
    fontFamily: designTokens.typography.fontFamily.primary,
    h1: {
      fontSize: designTokens.typography.fontSize['5xl'],
      fontWeight: designTokens.typography.fontWeight.bold,
      lineHeight: designTokens.typography.lineHeight.tight,
    },
    h2: {
      fontSize: designTokens.typography.fontSize['4xl'],
      fontWeight: designTokens.typography.fontWeight.bold,
      lineHeight: designTokens.typography.lineHeight.tight,
    },
    h3: {
      fontSize: designTokens.typography.fontSize['3xl'],
      fontWeight: designTokens.typography.fontWeight.semibold,
      lineHeight: designTokens.typography.lineHeight.tight,
    },
    h4: {
      fontSize: designTokens.typography.fontSize['2xl'],
      fontWeight: designTokens.typography.fontWeight.semibold,
      lineHeight: designTokens.typography.lineHeight.normal,
    },
    h5: {
      fontSize: designTokens.typography.fontSize.xl,
      fontWeight: designTokens.typography.fontWeight.medium,
      lineHeight: designTokens.typography.lineHeight.normal,
    },
    h6: {
      fontSize: designTokens.typography.fontSize.lg,
      fontWeight: designTokens.typography.fontWeight.medium,
      lineHeight: designTokens.typography.lineHeight.normal,
    },
    body1: {
      fontSize: designTokens.typography.fontSize.base,
      lineHeight: designTokens.typography.lineHeight.normal,
    },
    body2: {
      fontSize: designTokens.typography.fontSize.sm,
      lineHeight: designTokens.typography.lineHeight.normal,
    },
    caption: {
      fontSize: designTokens.typography.fontSize.xs,
      lineHeight: designTokens.typography.lineHeight.normal,
    },
  },
  spacing: 8, // 8px base spacing
  shape: {
    borderRadius: parseInt(designTokens.borderRadius.md.replace('rem', '')) * 16, // Convert rem to px
  },
  shadows: [
    'none',
    designTokens.boxShadow.sm,
    designTokens.boxShadow.base,
    designTokens.boxShadow.md,
    designTokens.boxShadow.lg,
    designTokens.boxShadow.xl,
    designTokens.boxShadow['2xl'],
    // MUI expects 25 shadow variants, fill remaining with repeated values
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
    designTokens.boxShadow['2xl'],
  ],
  breakpoints: {
    values: {
      xs: parseInt(designTokens.breakpoints.xs),
      sm: parseInt(designTokens.breakpoints.sm),
      md: parseInt(designTokens.breakpoints.md),
      lg: parseInt(designTokens.breakpoints.lg),
      xl: parseInt(designTokens.breakpoints.xl),
    },
  },
  transitions: {
    duration: {
      shortest: parseInt(designTokens.transition.duration[75]),
      shorter: parseInt(designTokens.transition.duration[100]),
      short: parseInt(designTokens.transition.duration[150]),
      standard: parseInt(designTokens.transition.duration[200]),
      complex: parseInt(designTokens.transition.duration[300]),
      enteringScreen: parseInt(designTokens.transition.duration[300]),
      leavingScreen: parseInt(designTokens.transition.duration[200]),
    },
    easing: {
      easeInOut: designTokens.transition.timing['in-out'],
      easeOut: designTokens.transition.timing.out,
      easeIn: designTokens.transition.timing.in,
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  components: {
    // Button overrides
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: designTokens.typography.fontWeight.semibold,
          borderRadius: designTokens.borderRadius.lg,
          padding: `${designTokens.spacing[2]} ${designTokens.spacing[4]}`,
        },
        sizeSmall: {
          padding: `${designTokens.spacing[1]} ${designTokens.spacing[3]}`,
          fontSize: designTokens.typography.fontSize.sm,
        },
        sizeLarge: {
          padding: `${designTokens.spacing[3]} ${designTokens.spacing[6]}`,
          fontSize: designTokens.typography.fontSize.lg,
        },
      },
    },
    // Card overrides
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: '1px solid rgba(26,21,38,0.08)',
          boxShadow: '0 20px 40px -28px rgba(26,21,38,0.3)',
        },
      },
    },
    // Paper overrides
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.md,
        },
        outlined: {
          borderColor: designTokens.colors.neutral[200],
        },
      },
    },
    // ---------------------------------------------------------------
    // Form input overrides — one place that governs legibility for EVERY
    // text field, select, and textarea in the app. Colors come from the
    // palette so they stay correct in both light and dark mode.
    // ---------------------------------------------------------------
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: designTokens.borderRadius.md,
          },
        },
      },
    },
    // What the user actually types: full-strength text colour, comfortable
    // size (16px also stops iOS from zooming on focus) and medium weight.
    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: 16,
          color: theme.palette.text.primary,
        }),
        input: ({ theme }) => ({
          color: theme.palette.text.primary,
          fontWeight: 500,
          '&::placeholder': {
            color: theme.palette.text.secondary,
            opacity: 0.8,
          },
          // Chrome autofill otherwise repaints the text pale-on-pale
          '&:-webkit-autofill': {
            WebkitTextFillColor: theme.palette.text.primary,
            WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor:
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.28)' : 'rgba(26,21,38,0.22)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2,
            borderColor: theme.palette.primary.main,
          },
        }),
        input: ({ theme }) => ({
          color: theme.palette.text.primary,
          fontWeight: 500,
        }),
      },
    },
    // Labels and helper text: readable, never washed out.
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          fontWeight: 600,
          '&.Mui-focused': { color: theme.palette.primary.main },
        }),
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          fontWeight: 500,
        }),
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          fontWeight: 600,
          '&.Mui-focused': { color: theme.palette.primary.main },
        }),
      },
    },
    // Selected value in dropdowns + the options themselves.
    MuiSelect: {
      styleOverrides: {
        select: ({ theme }) => ({
          color: theme.palette.text.primary,
          fontWeight: 500,
        }),
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.primary,
        }),
      },
    },
    // Chip overrides
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.full,
          fontWeight: 600,
        },
        // Outlined chips were rendering near-invisible on light backgrounds;
        // give them a readable ink label + a real border. Filled colored chips
        // (primary/success/etc.) keep their own contrastText.
        outlined: {
          color: '#1a1526',
          borderColor: 'rgba(26,21,38,0.2)',
        },
      },
    },
    // AppBar overrides
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: designTokens.boxShadow.sm,
        },
      },
    },
    // Dialog overrides
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: designTokens.borderRadius.lg,
        },
      },
    },
    // Menu overrides
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: designTokens.borderRadius.md,
          boxShadow: designTokens.boxShadow.lg,
        },
      },
    },
  },
});

// Create dark theme
export const darkTheme = createTheme({
  ...lightTheme,
  palette: {
    ...lightTheme.palette,
    mode: 'dark',
    primary: {
      main: designTokens.colors.primary[400],
      light: designTokens.colors.primary[300],
      dark: designTokens.colors.primary[600],
      contrastText: '#ffffff',
    },
    background: {
      default: designTokens.colors.neutral[900],
      paper: designTokens.colors.neutral[800],
    },
    text: {
      primary: designTokens.colors.neutral[100],
      secondary: designTokens.colors.neutral[400],
    },
    divider: designTokens.colors.neutral[700],
  },
  components: {
    ...lightTheme.components,
    MuiPaper: {
      styleOverrides: {
        ...lightTheme.components?.MuiPaper?.styleOverrides,
        outlined: {
          borderColor: designTokens.colors.neutral[700],
        },
      },
    },
  },
});

// Theme selector function
export const getTheme = (mode: 'light' | 'dark') => {
  return mode === 'dark' ? darkTheme : lightTheme;
};