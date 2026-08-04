import {
  Paper,
  Typography,
  Box,
  Chip,
  Button
} from '@mui/material';
import Link from 'next/link';
import { brand, cardSx, outlineButtonSx } from '@/lib/brand';

export interface SamplePaper {
  id?: string;
  slug?: string;
  title: string;
  subject: string;
  type: string;
  level: string;
  pages: number;
  excerpt: string;
}

interface PaperCardProps {
  paper: SamplePaper;
  excerptLines?: number;
}

export function PaperCard({ paper, excerptLines = 5 }: PaperCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        ...cardSx,
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.3, color: brand.ink }}
        >
          {paper.title}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip
          label={paper.subject}
          size="small"
          sx={{
            backgroundColor: brand.purple,
            color: '#fff',
            fontWeight: 700,
          }}
        />
        <Chip
          label={paper.type}
          size="small"
          variant="outlined"
          sx={{ color: brand.ink, fontWeight: 600, borderColor: 'rgba(156,39,176,0.4)' }}
        />
      </Box>

      <Typography
        variant="body2"
        sx={{
          mb: 3,
          lineHeight: 1.6,
          color: brand.body,
          fontWeight: 500,
          display: '-webkit-box',
          WebkitLineClamp: excerptLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '120px',
          flex: 1
        }}
      >
        {paper.excerpt}
      </Typography>

      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: `1px solid ${brand.line}`,
        pt: 2,
        mt: 'auto'
      }}>
        <Typography variant="caption" sx={{ color: brand.body, fontWeight: 600 }}>
          {paper.level} • {paper.pages} pages
        </Typography>
        <Button
          size="small"
          variant="outlined"
          component={Link}
          href={`/papers/${paper.slug || paper.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
          sx={{ ...outlineButtonSx, fontSize: '0.75rem' }}
        >
          View Sample
        </Button>
      </Box>
    </Paper>
  );
}