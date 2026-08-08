'use client';

import {
  Typography,
  Container,
  Box,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Paper,
  Rating
} from '@mui/material';
import {
  FilterList,
  Star,
  RateReview
} from '@mui/icons-material';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { APIClient, Review, ReviewsResponse } from '@/lib/api';
import { ReviewCard } from '@/components/ReviewCard';
import { PageShell, PageHero, brand, cardSx, primaryButtonSx, outlineButtonSx, Mark } from '@/lib/brand';

export default function PublicReviewsPage() {
  const [reviews, setReviews] = useState<ReviewsResponse>({
    reviews: [],
    total_count: 0,
    source: 'fallback'
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const reviewsPerPage = 12;

  // Extract unique subjects from reviews
  const [subjects, setSubjects] = useState<string[]>(['all']);

  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4+ Stars' },
    { value: '3', label: '3+ Stars' }
  ];

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const reviewsData = await APIClient.getReviews();
        setReviews(reviewsData);

        // Extract unique subjects
        const uniqueSubjects = ['all', ...Array.from(new Set(
          reviewsData.reviews.map(review => review.subject.toLowerCase())
        ))];
        setSubjects(uniqueSubjects);
      } catch (error) {
        console.warn('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Filter reviews based on subject and rating
  const filteredReviews = reviews.reviews.filter(review => {
    const subjectMatch = subjectFilter === 'all' ||
      review.subject.toLowerCase() === subjectFilter;

    const ratingMatch = ratingFilter === 'all' ||
      (ratingFilter === '5' && review.rating === 5) ||
      (ratingFilter === '4' && review.rating >= 4) ||
      (ratingFilter === '3' && review.rating >= 3);

    return subjectMatch && ratingMatch;
  });

  // Paginate filtered reviews
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const startIndex = (page - 1) * reviewsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + reviewsPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getAverageRating = () => {
    if (filteredReviews.length === 0) return '0';
    const sum = filteredReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / filteredReviews.length).toFixed(1);
  };

  const statCardSx = {
    px: 3,
    py: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    borderRadius: 2.5,
    bgcolor: '#fff',
    border: `1px solid ${brand.line}`,
    boxShadow: '0 16px 32px -26px rgba(26,21,38,0.35)',
  };

  return (
    <PageShell>
      <PageHero
        size="compact"
        eyebrow="Student reviews"
        title={<>What our <Mark>students</Mark> say</>}
        align="center"
      >
        {!loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={statCardSx}>
              <RateReview sx={{ color: brand.purple }} />
              <Typography sx={{ fontWeight: 800, fontSize: 20, color: brand.ink }}>
                {filteredReviews.length}
              </Typography>
              <Typography sx={{ color: brand.body, fontWeight: 600 }}>
                Reviews
              </Typography>
            </Box>

            <Box sx={statCardSx}>
              <Star sx={{ color: brand.purple }} />
              <Typography sx={{ fontWeight: 800, fontSize: 20, color: brand.ink }}>
                {getAverageRating()}
              </Typography>
              <Rating
                value={parseFloat(getAverageRating())}
                readOnly
                precision={0.1}
                size="small"
              />
            </Box>
          </Box>
        )}
      </PageHero>

      <Container maxWidth="lg" sx={{ py: { xs: 3.5, md: 5 } }}>
        {/* No breadcrumbs: reached from the navbar's "Reviews" link, which is
            already marked active. "Home / Student Reviews" only restated the
            heading above it. */}

        {/* Filters */}
        <Paper elevation={0} sx={{ ...cardSx, '&:hover': {}, p: { xs: 2, md: 2.5 }, mb: { xs: 2.5, md: 4 } }}>
          <Typography
            sx={{ display: 'flex', alignItems: 'center', mb: 2, fontWeight: 800, color: brand.ink, fontSize: 15 }}
          >
            <FilterList sx={{ mr: 1, color: brand.purple, fontSize: 20 }} />
            Filter reviews
          </Typography>
          <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={subjectFilter}
                label="Subject"
                onChange={(e) => {
                  setSubjectFilter(e.target.value);
                  setPage(1);
                }}
              >
                {subjects.map(subject => (
                  <MenuItem key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject.charAt(0).toUpperCase() + subject.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Rating</InputLabel>
              <Select
                value={ratingFilter}
                label="Rating"
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setPage(1);
                }}
              >
                {ratingOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSubjectFilter('all');
                setRatingFilter('all');
                setPage(1);
              }}
              sx={{ ...outlineButtonSx, height: 56 }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        <Typography sx={{ mt: 2.5, color: brand.body, fontWeight: 500 }}>
          Showing {paginatedReviews.length} of {filteredReviews.length} reviews
        </Typography>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} sx={{ color: brand.purple }} />
        </Box>
      )}

      {/* Reviews Grid */}
      {!loading && (
        <>
          {paginatedReviews.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {paginatedReviews.map((review) => (
                  <Grid item xs={12} md={6} lg={4} key={review.id}>
                    <ReviewCard review={review} />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: 2,
                        fontWeight: 700,
                      }
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            <Paper elevation={0} sx={{ ...cardSx, '&:hover': {}, textAlign: 'center', py: 8 }}>
              <RateReview sx={{ fontSize: 64, color: brand.purple, mb: 2, opacity: 0.7 }} />
              <Typography sx={{ fontWeight: 800, color: brand.ink, fontSize: 20, mb: 1 }}>
                No reviews found
              </Typography>
              <Typography sx={{ color: brand.body, fontWeight: 500, mb: 3 }}>
                No reviews match your selected filters. Try adjusting your criteria.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setSubjectFilter('all');
                  setRatingFilter('all');
                  setPage(1);
                }}
                sx={outlineButtonSx}
              >
                Clear All Filters
              </Button>
            </Paper>
          )}
        </>
      )}

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
          Ready to join our successful students?
        </Typography>
        <Typography sx={{ mb: 4, fontWeight: 500, fontSize: { xs: 16, md: 18 }, color: 'rgba(255,255,255,0.85)' }}>
          Experience the same quality and success that these students have achieved.
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
            href="/contact"
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
            Contact us
          </Button>
        </Box>
      </Box>
      </Container>
    </PageShell>
  );
}