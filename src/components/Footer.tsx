'use client';

import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  Email,
  Phone,
} from '@mui/icons-material';
import Link from 'next/link';
import { SiteData, Contacts } from '@/lib/siteData';
import { brand } from '@/lib/brand';

// Column heading: small, uppercase, lime rule — the Eyebrow motif inverted for
// the dark section.
function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#fff',
        mb: 2,
      }}
    >
      <Box aria-hidden sx={{ width: 18, height: 3, borderRadius: 2, background: brand.lime }} />
      {children}
    </Typography>
  );
}

const footerLinkSx = {
  color: 'rgba(255,255,255,0.72)',
  fontSize: 15,
  fontWeight: 500,
  textDecoration: 'none',
  transition: 'color 0.2s',
  '&:hover': { color: brand.lime },
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'Sample Papers', href: '/papers' },
    { label: 'Services', href: '/services' },
    { label: 'About Us', href: '/about' },
    { label: 'FAQs', href: '/faqs' },
  ];

  const socials = [
    { label: 'Facebook', Icon: Facebook },
    { label: 'Twitter', Icon: Twitter },
    { label: 'Instagram', Icon: Instagram },
  ];

  return (
    <Box
      component="footer"
      sx={{
        // Brand ink with a purple bloom, replacing the legacy blue/violet
        // gradient that belonged to no part of the design system.
        background: `radial-gradient(900px 400px at 15% -30%, ${brand.purpleDeep}55 0%, transparent 60%), ${brand.ink}`,
        color: '#fff',
        pt: { xs: 6, md: 8 },
        pb: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 5, md: 4 }}>
          {/* Brand blurb */}
          <Grid item xs={12} md={4}>
            <Typography
              sx={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', mb: 1 }}
            >
              {SiteData.site_abbrev}
            </Typography>
            <Typography
              sx={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, maxWidth: 320 }}
            >
              {SiteData.site_name} — expert academic support, reviewed by our team before
              it ever reaches you.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2.5, ml: -1 }}>
              {socials.map(({ label, Icon }) => (
                <IconButton
                  key={label}
                  href="#"
                  aria-label={label}
                  sx={{
                    color: 'rgba(255,255,255,0.72)',
                    '&:hover': { color: brand.lime, backgroundColor: 'rgba(255,255,255,0.06)' },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={4}>
            <FooterHeading>Explore</FooterHeading>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {quickLinks.map((link) => (
                <MuiLink key={link.href} component={Link} href={link.href} sx={footerLinkSx}>
                  {link.label}
                </MuiLink>
              ))}
            </Box>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} sm={6} md={4}>
            <FooterHeading>Get in touch</FooterHeading>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Email fontSize="small" sx={{ color: brand.lime }} />
                <Typography sx={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.72)' }}>
                  {Contacts.email}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Phone fontSize="small" sx={{ color: brand.lime }} />
                <Typography sx={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.72)' }}>
                  +{Contacts.telephone1.code} {Contacts.telephone1.number}
                </Typography>
              </Box>
              <MuiLink
                component={Link}
                href="/contact"
                sx={{ ...footerLinkSx, color: brand.lime, fontWeight: 700, mt: 0.5 }}
              >
                Send us a message →
              </MuiLink>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.12)' }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
            © {currentYear} {SiteData.site_name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <MuiLink component={Link} href="/terms" sx={{ ...footerLinkSx, fontSize: 14 }}>
              Terms
            </MuiLink>
            <MuiLink component={Link} href="/contact" sx={{ ...footerLinkSx, fontSize: 14 }}>
              Support
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
