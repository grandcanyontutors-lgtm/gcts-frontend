'use client';

import {
  Typography,
  Container,
  Box,
  Button,
  Alert,
  Grid,
  Paper,
  Rating,
  Chip,
  Card
} from '@mui/material';
import {
  School,
  Assignment,
  Support,
  Api,
  TrendingUp,
  Verified,
  Speed,
  Star,
  CheckCircle,
  Timeline,
  Groups,
  BookmarkBorder
} from '@mui/icons-material';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { testAPIConnection } from '@/lib/test-api';
import config from '@/lib/config';
import { APIClient, SiteStats, ReviewsResponse } from '@/lib/api';
import { ReviewCard } from '@/components/ReviewCard';
import { ReviewCardSkeleton } from '@/components/ReviewCardSkeleton';
import { PaperCard } from '@/components/PaperCard';
import {motion} from "framer-motion";


export default function ClassicHomePage() {
  const [apiStatus, setApiStatus] = useState<'testing' | 'connected' | 'disconnected'>('testing');
  const [stats, setStats] = useState<SiteStats>({
    happy_students: '10,000+',
    papers_delivered: '25,000+',
    expert_writers: '500+',
    success_rate: '98%',
    source: 'fallback'
  });
  const [reviews, setReviews] = useState<ReviewsResponse>({
    reviews: [],
    total_count: 0,
    source: 'fallback'
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Grand Canyon Tutoring Services",
    "alternateName": "GCTS",
    "url": "https://gcts.com",
    "logo": "https://gcts.com/logo.png",
    "description": "Professional academic writing help and tutoring services from PhD-qualified experts",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Grand Canyon",
      "addressRegion": "AZ",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-123-4567",
      "contactType": "customer service",
      "availableLanguage": "English",
      "areaServed": "Worldwide"
    },
    "sameAs": [
      "https://facebook.com/gcts",
      "https://twitter.com/gcts",
      "https://linkedin.com/company/gcts"
    ],
    "offers": {
      "@type": "Offer",
      "category": "Academic Services",
      "description": "Academic writing and tutoring services",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "2500"
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Check API connection
      const isConnected = await testAPIConnection();
      setApiStatus(isConnected ? 'connected' : 'disconnected');

      // Fetch site statistics
      try {
        const siteStats = await APIClient.getStats();
        setStats(siteStats);
      } catch (error) {
        console.warn('Failed to fetch stats, using fallback values:', error);
      }

      // Fetch reviews
      try {
        const reviewsData = await APIClient.getReviews();
        setReviews(reviewsData);
      } catch (error) {
        console.warn('Failed to fetch reviews, using fallback values:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    // Delay to ensure client-side execution after hydration
    const timeoutId = setTimeout(fetchData, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* API Status Alert */}
      {config.isDevelopment() && (
        <Container maxWidth="lg">
          <Alert
            severity={apiStatus === 'connected' ? 'success' : apiStatus === 'disconnected' ? 'warning' : 'info'}
            icon={<Api />}
            sx={{ mt: 2, mb: 2, maxWidth: '600px', mx: 'auto' }}
          >
            API Status: {apiStatus === 'testing' ? 'Testing connection...' :
              apiStatus === 'connected' ? `Connected to ${config.getApiUrl()}` :
                `Disconnected from ${config.getApiUrl()} (Backend not running)`}
          </Alert>
        </Container>
      )}

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Chip
                  label="🎓 #1 Academic Platform"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    mb: 3,
                    fontWeight: 'bold'
                  }}
                />
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                    mb: 3,
                  }}
                >
                  Excel in Your Studies with
                  <Box component="span" sx={{ color: '#FFD700' }}> Expert Guidance</Box>
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.9,
                    mb: 4,
                    fontSize: '1.2rem',
                    lineHeight: 1.6,
                  }}
                >
                  Join thousands of students who have achieved academic success with our professional tutoring,
                  high-quality papers, and 24/7 expert support.
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    mb: 4,
                    flexWrap: 'wrap', // ✅ prevent overflow on in-between screen sizes
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Assignment />}
                    component={Link}
                    href="/order/place"
                    sx={{
                      width: { xs: '100%', md: 'auto' }, // ✅ stack = full width, desktop = natural width
                      backgroundColor: '#FFD700',
                      color: '#333',
                      fontWeight: 'bold',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: '#FFC700',
                      }
                    }}
                  >
                    Place Order Now
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<School />}
                    component={Link}
                    href="/papers"
                    sx={{
                      width: { xs: '100%', md: 'auto' }, // ✅ same treatment
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderColor: 'white',
                      }
                    }}
                  >
                    Browse Papers
                  </Button>
                </Box>


                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Rating value={5} readOnly size="small" />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    4.9/5 from 2,500+ satisfied students
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', mt: { xs: 4, md: 0 } }}>
                <Paper
                  elevation={8}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    color: 'text.primary',
                    maxWidth: 400,
                    mx: 'auto'
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    🚀 Quick Order Process
                  </Typography>
                  <Box sx={{ textAlign: 'left', mt: 2 }}>
                    {[
                      '1. Submit your requirements',
                      '2. Admin review & writer assignment',
                      '3. Complete payment process',
                      '4. Download your paper'
                    ].map((step, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircle sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">{step}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ backgroundColor: '#f9f9fb', py: 8 }}>
        <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Trusted by Students Worldwide
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Our platform has helped thousands of students achieve their academic goals
          </Typography>
        </Box>

        <Grid container spacing={4} alignItems="center" justifyContent="center">
          {[
            { icon: Groups, value: stats.happy_students, label: 'Happy Students' },
            { icon: Assignment, value: stats.papers_delivered, label: 'Papers Delivered' },
            { icon: Verified, value: stats.expert_writers, label: 'Expert Writers' },
            { icon: TrendingUp, value: stats.success_rate, label: 'Success Rate' }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <stat.icon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        </Container>
      </Box>

      {/* Reviews Section */}
      <Box sx={{
        py: 8
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              What Our Students Say
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Real reviews from students who have achieved success with our academic services
            </Typography>
          </Box>

          {reviewsLoading ? (
            <Grid container spacing={4}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <ReviewCardSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : reviews.reviews.length > 0 ? (
            <Grid container spacing={4}>
              {reviews.reviews.slice(0, 6).map((review) => (
                <Grid item xs={12} md={6} lg={4} key={review.id}>
                  <ReviewCard review={review} showWebkitClamp={true} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No reviews available
              </Typography>
            </Box>
          )}

          {/* View More Reviews Button */}
          {reviews.reviews.length > 6 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/public-reviews"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                View More Reviews
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ backgroundColor: '#f9f9fb', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Why Choose GCTS?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              We provide comprehensive academic support with features designed for your success
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                icon: School,
                title: 'Expert Tutors',
                description: 'Work with PhD-qualified tutors and writers with years of academic experience',
                color: '#1976d2'
              },
              {
                icon: Speed,
                title: 'Fast Delivery',
                description: 'Get your papers delivered on time, every time. Rush orders available 24/7',
                color: '#388e3c'
              },
              {
                icon: Verified,
                title: 'Plagiarism-Free',
                description: 'All papers are 100% original with free plagiarism reports and citations',
                color: '#f57c00'
              },
              {
                icon: Support,
                title: '24/7 Support',
                description: 'Round-the-clock customer support via chat, email, and phone',
                color: '#7b1fa2'
              },
              {
                icon: Timeline,
                title: 'Real-Time Tracking',
                description: 'Monitor your order progress and communicate directly with your writer',
                color: '#d32f2f'
              },
              {
                icon: BookmarkBorder,
                title: 'Free Revisions',
                description: 'Up to 2 free revisions to ensure your paper meets all requirements and expectations',
                color: '#0288d1'
              }
            ].map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: feature.color,
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <feature.icon sx={{ fontSize: 48, color: feature.color, mb: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 193, 7, 0.12) 100%)',
        py: 8
      }}>
        <Container maxWidth="lg">
        {/* Section Heading */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            How It Works
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Getting academic help has never been easier. Follow these simple steps
          </Typography>
        </Box>

        {/* Steps */}
        <Grid container spacing={4} alignItems="stretch">
          {[
            {
              step: '01',
              title: 'Place Your Order',
              description: 'Submit your assignment details, requirements, and deadline',
              icon: Assignment,
            },
            {
              step: '02',
              title: 'Complete Payment',
              description: 'After admin review and writer assignment, receive payment instructions',
              icon: CheckCircle,
            },
            {
              step: '03',
              title: 'Track Progress',
              description: 'Monitor your order in real-time and communicate with your assigned writer',
              icon: Timeline,
            },
            {
              step: '04',
              title: 'Get Your Paper',
              description: 'Download your completed, plagiarism-free paper on time',
              icon: Star,
            },
          ].map((step, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              {/* Animate each card */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                style={{ height: "100%" }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 4,
                    height: '100%',
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(255,193,7,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.35)',
                      boxShadow: '0 12px 40px rgba(255,193,7,0.3)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  {/* Step Number Circle */}
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    {step.step}
                  </Box>

                  {/* Icon */}
                  <step.icon sx={{ fontSize: 42, color: '#FFD700', mb: 2 }} />

                  {/* Title */}
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                  >
                    {step.title}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {step.description}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to Excel in Your Studies?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of successful students who trust GCTS for their academic needs
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Assignment />}
              component={Link}
              href="/order/place"
              sx={{
                backgroundColor: '#FFD700',
                color: '#333',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: '#FFC700',
                }
              }}
            >
              Start Your Order
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Support />}
              component={Link}
              href="/contact"
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              Contact Support
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Sample Papers Section */}
      <Box sx={{  py: 8 }}>
        <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Sample Papers
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Browse our collection of high-quality academic papers to see the standard of work we deliver
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              id: "climate-change-marine-ecosystems",
              slug: "climate-change-marine-ecosystems",
              title: "The Impact of Climate Change on Marine Ecosystems",
              subject: "Environmental Science",
              type: "Research Paper",
              level: "Master's",
              pages: 15,
              excerpt: "This comprehensive research paper examines the multifaceted effects of climate change on marine biodiversity, ocean acidification, and ecosystem stability..."
            },
            {
              id: "digital-marketing-post-covid",
              slug: "digital-marketing-post-covid",
              title: "Digital Marketing Strategies in the Post-COVID Era",
              subject: "Business",
              type: "Case Study",
              level: "Bachelor's",
              pages: 12,
              excerpt: "An in-depth analysis of how businesses adapted their digital marketing approaches during the pandemic, featuring real-world case studies and strategic insights..."
            },
            {
              id: "neural-networks-healthcare",
              slug: "neural-networks-healthcare",
              title: "Neural Networks in Healthcare Diagnostics",
              subject: "Computer Science",
              type: "Thesis",
              level: "Doctorate",
              pages: 45,
              excerpt: "This doctoral thesis explores the application of deep learning algorithms in medical imaging and diagnostic systems, presenting novel approaches to AI-assisted healthcare..."
            }
          ].map((paper, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <PaperCard paper={paper} excerptLines={5} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/papers"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2
            }}
          >
            View More Papers
          </Button>
        </Box>
        </Container>
      </Box>
    </>
  );
}