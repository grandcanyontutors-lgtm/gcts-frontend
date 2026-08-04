'use client';

import {
  Typography,
  Container,
  Box,
  Chip,
  Button,
  Breadcrumbs,
  Paper,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Home,
  Description,
  ArrowBack,
  CalendarToday,
  Person,
  Schedule,
  School,
  Download,
  Share,
  Lock
} from '@mui/icons-material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { papersApi, DetailedPaper } from '@/services/papersApi';
import PaperDetailsSkeleton from '@/components/PaperDetailsSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { PageShell, PageHero, brand, cardSx, primaryButtonSx, outlineButtonSx } from '@/lib/brand';

export default function PaperDetailsPage() {
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [paper, setPaper] = useState<DetailedPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [accessError, setAccessError] = useState('');

  const handleRequestAccess = async () => {
    if (!paper) return;
    setAccessError('');
    setRequestingAccess(true);
    try {
      const result = await papersApi.requestAccess(paper.slug);
      setPaper({ ...paper, access_status: result.access_status });
    } catch (e: any) {
      setAccessError(
        e?.response?.data?.detail || e?.response?.data?.message || 'Failed to request access.'
      );
    } finally {
      setRequestingAccess(false);
    }
  };

  useEffect(() => {
    const fetchPaper = async () => {
      if (params.id) {
        try {
          const paperData = await papersApi.getPaperBySlug(params.id as string);
          setPaper(paperData);
        } catch (error) {
          console.error('Failed to fetch paper:', error);
          setPaper(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPaper();
  }, [params.id]);

  if (loading) {
    return <PaperDetailsSkeleton />;
  }

  if (!paper) {
    return (
      <PageShell>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Paper elevation={0} sx={{ ...cardSx, '&:hover': {}, textAlign: 'center', py: 8 }}>
            <Description sx={{ fontSize: 64, color: brand.purple, mb: 2, opacity: 0.7 }} />
            <Typography sx={{ fontWeight: 800, color: brand.ink, fontSize: 20, mb: 1 }}>
              Paper Not Found
            </Typography>
            <Typography sx={{ color: brand.body, fontWeight: 500, mb: 3 }}>
              The requested paper could not be found. It may have been moved or removed.
            </Typography>
            <Button
              variant="outlined"
              component={Link}
              href="/papers"
              startIcon={<ArrowBack />}
              sx={outlineButtonSx}
            >
              Back to Papers
            </Button>
          </Paper>
        </Container>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Sample paper"
        title={paper.title}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
            {paper.created_at && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ mr: 1, fontSize: 20, color: brand.purple }} />
                <Typography sx={{ color: brand.body, fontWeight: 600 }}>
                  {new Date(paper.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Schedule sx={{ mr: 1, fontSize: 20, color: brand.purple }} />
              <Typography sx={{ color: brand.body, fontWeight: 600 }}>
                {paper.pages} pages
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <School sx={{ mr: 1, fontSize: 20, color: brand.purple }} />
              <Typography sx={{ color: brand.body, fontWeight: 600 }}>
                {paper.level}
              </Typography>
            </Box>
          </Box>

          {/* Chips for subject and type */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            <Chip
              label={paper.subject}
              sx={{
                backgroundColor: brand.purple,
                color: '#fff',
                fontWeight: 700
              }}
            />
            <Chip
              label={paper.type}
              variant="outlined"
              sx={{ color: brand.ink, fontWeight: 600, borderColor: 'rgba(156,39,176,0.4)' }}
            />
          </Box>

          {/* Keywords */}
          {paper.keywords && paper.keywords.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ mb: 1, color: brand.body, fontWeight: 700, fontSize: 14 }}>
                Keywords:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {paper.keywords.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem', color: brand.ink, fontWeight: 600, borderColor: brand.line }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              startIcon={<Download />}
              sx={{ ...primaryButtonSx, px: 3, py: 1 }}
            >
              Download PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<Share />}
              sx={outlineButtonSx}
            >
              Share Paper
            </Button>
            <Button
              variant="outlined"
              component={Link}
              href="/order/place"
              sx={outlineButtonSx}
            >
              Order Similar Paper
            </Button>
          </Box>
        </Box>
      </PageHero>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3, '& a, & p': { color: brand.body, fontWeight: 600 } }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Home sx={{ mr: 0.5, fontSize: 20 }} />
              Home
            </Box>
          </Link>
          <Link href="/papers" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Description sx={{ mr: 0.5, fontSize: 20 }} />
              Sample Papers
            </Box>
          </Link>
          <Typography sx={{ display: 'flex', alignItems: 'center', color: brand.ink, fontWeight: 700 }}>
            {paper.title}
          </Typography>
        </Breadcrumbs>

        {/* Back Button */}
        <Button
          component={Link}
          href="/papers"
          startIcon={<ArrowBack />}
          sx={{ ...outlineButtonSx, mb: 4 }}
          variant="outlined"
        >
          Back to Papers
        </Button>

      {/* Paper Content */}
      <Paper elevation={0} sx={{ ...cardSx, '&:hover': {}, p: { xs: 3, md: 4 } }}>
        <Typography sx={{ mb: 3, fontWeight: 800, letterSpacing: '-0.02em', color: brand.ink, fontSize: 24 }}>
          Paper Content
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{
          '& h1': {
            fontSize: '2rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            mt: 4,
            mb: 2,
            color: brand.ink
          },
          '& h2': {
            fontSize: '1.5rem',
            fontWeight: 800,
            mt: 3,
            mb: 2,
            color: brand.ink
          },
          '& h3': {
            fontSize: '1.25rem',
            fontWeight: 700,
            mt: 2,
            mb: 1,
            color: brand.ink
          },
          '& h4': {
            fontSize: '1.1rem',
            fontWeight: 700,
            mt: 2,
            mb: 1,
            color: brand.ink
          },
          '& p': {
            lineHeight: 1.8,
            mb: 2,
            color: brand.body,
            fontWeight: 500
          },
          '& ul, & ol': {
            pl: 3,
            mb: 2,
            color: brand.body
          },
          '& li': {
            mb: 1,
            lineHeight: 1.6,
            color: brand.body,
            fontWeight: 500
          },
          '& strong': {
            fontWeight: 800,
            color: brand.ink
          },
          '& code': {
            backgroundColor: brand.lavender,
            padding: '2px 6px',
            borderRadius: 1,
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            color: brand.purpleDeep
          },
          '& blockquote': {
            borderLeft: `4px solid ${brand.purple}`,
            pl: 2,
            ml: 0,
            fontStyle: 'italic',
            color: brand.body
          }
        }}>
          <ReactMarkdown>{paper.content}</ReactMarkdown>
        </Box>

        {/* Access gate — closed papers show only an excerpt until the admin
            grants this user's access request */}
        {paper.has_access === false && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3 }} />
            {accessError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setAccessError('')}>
                {accessError}
              </Alert>
            )}
            {paper.access_status === 'pending' ? (
              <Alert severity="info" icon={<Lock />}>
                This is a preview. Your request for full access is pending — you&apos;ll be
                notified once the admin reviews it.
              </Alert>
            ) : paper.access_status === 'rejected' ? (
              <Alert severity="warning" icon={<Lock />}>
                This is a preview. Your previous access request was declined — contact us if
                you believe this is a mistake.
              </Alert>
            ) : (
              <Alert
                severity="info"
                icon={<Lock />}
                action={
                  isAuthenticated ? (
                    <Button
                      color="inherit"
                      size="small"
                      variant="outlined"
                      disabled={requestingAccess}
                      onClick={handleRequestAccess}
                    >
                      {requestingAccess ? 'Requesting…' : 'Request Access'}
                    </Button>
                  ) : (
                    <Button
                      color="inherit"
                      size="small"
                      variant="outlined"
                      component={Link}
                      href="/login"
                    >
                      Sign in to Request
                    </Button>
                  )
                }
              >
                You&apos;re viewing a preview of this paper. Request access from the admin to
                read the full content.
              </Alert>
            )}
          </Box>
        )}
      </Paper>

      {/* Call to Action */}
      <Box
        sx={{
          mt: 10,
          p: { xs: 4, md: 6 },
          background: `linear-gradient(135deg, ${brand.purpleDeep} 0%, ${brand.ink} 100%)`,
          color: '#fff',
          borderRadius: 4,
          textAlign: 'center'
        }}
      >
        <Typography sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: { xs: 26, md: 34 }, mb: 1.5 }}>
          Need a similar paper?
        </Typography>
        <Typography sx={{ mb: 4, fontWeight: 500, fontSize: { xs: 16, md: 18 }, color: 'rgba(255,255,255,0.85)' }}>
          Get the same quality and expertise for your specific academic requirements.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            size="large"
            component={Link}
            href="/order/place"
            sx={{ ...primaryButtonSx, px: 4, py: 1.5 }}
          >
            Place your order
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            href="/papers"
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 700,
              borderRadius: 2.5,
              borderColor: 'rgba(255,255,255,0.6)',
              color: '#fff',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderColor: '#fff',
              }
            }}
          >
            Browse more papers
          </Button>
        </Box>
      </Box>
      </Container>
    </PageShell>
  );
}