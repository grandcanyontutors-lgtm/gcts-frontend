'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Container,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Home,
  Article,
  Assignment,
  Dashboard,
  Login,
  Logout,
  Menu as MenuIcon,
  Person,
  RateReview,
} from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SiteData } from '@/lib/siteData';
import { brand, primaryButtonSx } from '@/lib/brand';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/components/auth/RoleGuard';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function Navbar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();

  // Use auth context
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { isStudent, isWriter, isAdmin } = useRoleAccess();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  type MenuItem = {
    label: string;
    icon: React.ReactElement;
    href?: string;
    onClick?: () => Promise<void>;
  };

  const menuItems: MenuItem[] = [
    { label: 'Home', href: '/', icon: <Home /> },
    { label: 'Papers', href: '/papers', icon: <Article /> },
    { label: 'Reviews', href: '/public-reviews', icon: <RateReview /> },
    ...(isAuthenticated ? [{ label: 'Orders', href: '/orders', icon: <Assignment /> }] : []),
  ];

  const handleLogout = async () => {
    try {
      await logout();
      handleMenuClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const authItems: MenuItem[] = isAuthenticated 
    ? [
        { label: 'Dashboard', href: '/dashboard', icon: <Dashboard /> },
        { label: 'Logout', onClick: handleLogout, icon: <Logout /> },
      ]
    : [
        { label: 'Login', href: '/login', icon: <Login /> },
      ];

  // Exact match for '/', prefix match elsewhere, so /papers/[id] still lights
  // up the Papers link.
  const isActive = (href?: string) =>
    !!href && (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        // Translucent paper rather than solid purple: the bar now sits on the
        // light pages instead of fighting them, and the blur keeps it legible
        // over the hero gradient as the page scrolls beneath it.
        backgroundColor: 'rgba(250,249,252,0.82)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${brand.line}`,
        color: brand.ink,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
          {/* Logo and Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Image
                src="/assets/logos/logo.png"
                alt={SiteData.site_name}
                width={40}
                height={40}
                style={{ marginRight: '10px' }}
              />
              <Typography
                noWrap
                sx={{
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: brand.ink,
                  textDecoration: 'none',
                }}
              >
                {SiteData.site_abbrev}
              </Typography>
            </Link>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                {menuItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Button
                      key={item.label}
                      component={Link}
                      href={item.href}
                      startIcon={item.icon}
                      sx={{
                        position: 'relative',
                        px: 2,
                        color: active ? brand.purpleDeep : brand.body,
                        fontWeight: active ? 800 : 600,
                        '& .MuiButton-startIcon svg': { fontSize: 20 },
                        '&:hover': { color: brand.purpleDeep, backgroundColor: brand.lavender },
                        // The lime highlighter motif, reused as the active marker.
                        '&::after': active
                          ? {
                              content: '""',
                              position: 'absolute',
                              left: 16,
                              right: 16,
                              bottom: 6,
                              height: 3,
                              borderRadius: 2,
                              background: brand.lime,
                            }
                          : undefined,
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Notification Bell for authenticated users */}
                {isAuthenticated && user && (
                  <Box sx={{ color: brand.body }}>
                    <NotificationBell userId={user.id} />
                  </Box>
                )}

                {authItems.map((item) => {
                  const isPrimary = item.label === 'Login';
                  return (
                    <Button
                      key={item.label}
                      component={item.href ? Link : 'button'}
                      href={item.href}
                      onClick={item.onClick}
                      startIcon={item.icon}
                      variant={isPrimary ? 'contained' : 'text'}
                      sx={
                        isPrimary
                          ? { ...primaryButtonSx, px: 2.5 }
                          : {
                              px: 2,
                              color: brand.body,
                              fontWeight: 600,
                              '&:hover': { color: brand.purpleDeep, backgroundColor: brand.lavender },
                            }
                      }
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>
            </>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="mobile-menu"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                sx={{ color: brand.ink }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="mobile-menu"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {[...menuItems, ...authItems].map((item) => {
                  const active = isActive(item.href);
                  return (
                    <MenuItem
                      key={item.label}
                      component={item.href ? Link : 'button'}
                      href={item.href}
                      onClick={() => {
                        handleMenuClose();
                        item.onClick?.();
                      }}
                      sx={{
                        minWidth: 190,
                        py: 1.25,
                        color: active ? brand.purpleDeep : brand.ink,
                        fontWeight: active ? 700 : 500,
                        '& svg': { color: active ? brand.purple : brand.body, fontSize: 20 },
                        '&:hover': { backgroundColor: brand.lavender },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {item.icon}
                        <Typography sx={{ fontWeight: 'inherit', color: 'inherit' }}>
                          {item.label}
                        </Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </Menu>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}