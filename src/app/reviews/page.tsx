'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  Alert,
  Pagination,
  Card,
  CardContent,
  Skeleton,
} from '@mui/material';
import {
  FilterList,
  Clear,
  Star,
  Reviews as ReviewsIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { useGetReviewsQuery } from '@/store/api/reviewApi';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { PageShell, PageHero, brand, cardSx, primaryButtonSx, outlineButtonSx, Mark } from '@/lib/brand';

function ReviewsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    rating: '',
    writerId: '',
    isPublic: '',
    page: 1,
    pageSize: 12,
  });

  const queryFilters = {
    ...filters,
    rating: filters.rating ? parseInt(filters.rating) : undefined,
    writerId: filters.writerId ? parseInt(filters.writerId) : undefined,
    isPublic: filters.isPublic ? filters.isPublic === 'true' : undefined,
  };
  
  const { data: reviewsData, isLoading, error, refetch } = useGetReviewsQuery(queryFilters);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      rating: '',
      writerId: '',
      isPublic: '',
      page: 1,
      pageSize: 12,
    });
  };

  const reviews = reviewsData?.results || [];
  const totalCount = reviewsData?.count || 0;
  const pageCount = Math.ceil(totalCount / filters.pageSize);

  return (
    <PageShell>
      <PageHero
        eyebrow="Reviews"
        title={<>Read what <Mark>students</Mark> say</>}
        subtitle="Honest feedback about the writers who deliver academic work our students can be proud of."
      />

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        {/* Filters */}
        <Paper elevation={0} sx={{ ...cardSx, '&:hover': {}, p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList sx={{ color: brand.purple }} />
            <Typography sx={{ fontWeight: 800, color: brand.ink, fontSize: 18 }}>Filters</Typography>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Rating</InputLabel>
              <Select
                value={filters.rating}
                label="Rating"
                onChange={(e) => handleFilterChange('rating', e.target.value)}
              >
                <MenuItem value="">All Ratings</MenuItem>
                <MenuItem value="5">5 Stars</MenuItem>
                <MenuItem value="4">4+ Stars</MenuItem>
                <MenuItem value="3">3+ Stars</MenuItem>
                <MenuItem value="2">2+ Stars</MenuItem>
                <MenuItem value="1">1+ Star</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Writer ID"
              type="number"
              value={filters.writerId}
              onChange={(e) => handleFilterChange('writerId', e.target.value)}
              placeholder="Enter writer ID"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Visibility</InputLabel>
              <Select
                value={filters.isPublic}
                label="Visibility"
                onChange={(e) => handleFilterChange('isPublic', e.target.value)}
              >
                <MenuItem value="">All Reviews</MenuItem>
                <MenuItem value="true">Public Only</MenuItem>
                <MenuItem value="false">Private Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Clear />}
              onClick={clearFilters}
              sx={{ ...outlineButtonSx, height: '40px' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        <Typography sx={{ color: brand.body, fontWeight: 500 }}>
          Showing {reviews.length} of {totalCount} reviews
        </Typography>
      </Paper>

      {/* Loading State */}
      {isLoading && (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card elevation={0} sx={{ ...cardSx, '&:hover': {} }}>
                <CardContent>
                  <Skeleton variant="rectangular" height={24} sx={{ mb: 2, borderRadius: 1 }} />
                  <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load reviews. Please try again.
        </Alert>
      )}

      {/* Reviews Grid */}
      {!isLoading && !error && (
        <>
          {reviews.length > 0 ? (
            <Grid container spacing={3}>
              {reviews.map((review: any) => (
                <Grid item xs={12} md={6} key={review.id}>
                  <ReviewCard
                    review={review}
                    currentUserRole={user?.role}
                    currentUserId={user?.id}
                    showWriter={true}
                    showStudent={user?.role === 'admin'}
                    showOrder={true}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper elevation={0} sx={{ ...cardSx, '&:hover': {}, p: 8, textAlign: 'center' }}>
              <ReviewsIcon sx={{ fontSize: 64, color: brand.purple, mb: 2, opacity: 0.7 }} />
              <Typography sx={{ fontWeight: 800, color: brand.ink, fontSize: 20, mb: 1 }}>
                No Reviews Found
              </Typography>
              <Typography sx={{ color: brand.body, fontWeight: 500 }}>
                No reviews match your current filters. Try adjusting your search criteria.
              </Typography>
            </Paper>
          )}

          {/* Pagination */}
          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pageCount}
                page={filters.page}
                onChange={(_, page) => handlePageChange(page)}
                color="primary"
                size="large"
                sx={{ '& .MuiPaginationItem-root': { borderRadius: 2, fontWeight: 700 } }}
              />
            </Box>
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
          textAlign: 'center',
        }}
      >
        <Typography sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: { xs: 26, md: 34 }, mb: 1.5 }}>
          Ready to work with our writers?
        </Typography>
        <Typography sx={{ mb: 4, fontWeight: 500, fontSize: { xs: 16, md: 18 }, color: 'rgba(255,255,255,0.85)' }}>
          Place your order and get matched with a writer students trust.
        </Typography>
        <Button
          size="large"
          component={Link}
          href="/order/place"
          sx={{ ...primaryButtonSx, px: 4, py: 1.5 }}
        >
          Place your order
        </Button>
      </Box>
      </Container>
    </PageShell>
  );
}

export default function ReviewsPageWithAuth() {
  return (
    <PrivateRoute>
      <ReviewsPage />
    </PrivateRoute>
  );
}