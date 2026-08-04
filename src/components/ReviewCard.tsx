import {
  Card,
  CardContent,
  Typography,
  Box,
  Rating,
  Chip
} from '@mui/material';
import { FormatQuote } from '@mui/icons-material';
import { Review } from '@/lib/api';
import { brand, cardSx } from '@/lib/brand';

interface ReviewCardProps {
  review: Review;
  showWebkitClamp?: boolean;
}

export function ReviewCard({ review, showWebkitClamp = false }: ReviewCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        ...cardSx,
        height: '100%',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating value={review.rating} readOnly size="small" precision={0.1} />
            <Typography variant="body2" sx={{ ml: 1, fontWeight: 800, color: brand.ink }}>
              {review.rating.toFixed(1)}
            </Typography>
          </Box>
          <FormatQuote sx={{ color: brand.lavender, fontSize: 40, transform: 'scaleX(-1)' }} />
        </Box>

        {/* Order Type */}
        <Chip
          label={review.order_type}
          size="small"
          sx={{
            alignSelf: 'flex-start',
            backgroundColor: brand.purple,
            color: '#fff',
            mb: 2,
            fontWeight: 700,
            fontSize: '0.75rem'
          }}
        />

        {/* Review Text */}
        <Typography
          variant="body2"
          sx={{
            mb: 3,
            lineHeight: 1.7,
            minHeight: '120px',
            color: brand.body,
            fontWeight: 500,
            fontStyle: 'italic',
            flex: 1,
            ...(showWebkitClamp && {
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            })
          }}
        >
          &ldquo;{review.review}&rdquo;
        </Typography>

        {/* Subject and Date */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${brand.line}`,
          pt: 2,
          mt: 'auto'
        }}>
          <Chip
            label={review.subject}
            variant="outlined"
            size="small"
            sx={{ color: brand.ink, fontWeight: 600, borderColor: 'rgba(156,39,176,0.4)' }}
          />
          <Typography variant="caption" sx={{ color: brand.body, fontWeight: 600 }}>
            {review.month_year}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}