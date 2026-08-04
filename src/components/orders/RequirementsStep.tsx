'use client';

import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  FormHelperText,
  Slider,
} from '@mui/material';
import type { OrderFormData } from '@/app/order/place/page';
import { brand } from '@/lib/brand';

const stepTitleSx = {
  fontSize: { xs: 22, md: 26 },
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: brand.ink,
  lineHeight: 1.2,
};

const stepSubtitleSx = {
  mb: 3,
  fontSize: 15,
  fontWeight: 500,
  color: brand.body,
};

interface RequirementsStepProps {
  data: OrderFormData;
  errors: Record<string, string>;
  onChange: (data: Partial<OrderFormData>) => void;
}

const citationStyles = [
  'APA',
  'MLA',
  'Chicago',
  'Harvard',
  'IEEE',
  'Vancouver',
  'AMA',
  'ASA',
  'APSA',
  'Turabian',
  'Other',
  'Not Required',
];

export function RequirementsStep({ data, errors, onChange }: RequirementsStepProps) {
  return (
    <Box sx={{ p: { xs: 0, sm: 1 } }}>
      <Typography gutterBottom sx={stepTitleSx}>
        Requirements & Instructions
      </Typography>
      <Typography sx={stepSubtitleSx}>
        Provide detailed information about your requirements
      </Typography>

      <Grid container spacing={3}>
        {/* Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Order Description"
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            error={!!errors.description}
            helperText={errors.description || 'Provide a clear overview of what you need'}
            placeholder="Describe the main topic, scope, and purpose of your order..."
          />
        </Grid>

        {/* Detailed Instructions */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Detailed Instructions"
            value={data.instructions}
            onChange={(e) => onChange({ instructions: e.target.value })}
            error={!!errors.instructions}
            helperText={errors.instructions || 'Include specific requirements, formatting guidelines, and any special requests'}
            placeholder="Provide detailed instructions including:
- Specific topics to cover
- Structure requirements
- Formatting guidelines
- Any specific sources to use or avoid
- Writing style preferences
- Additional requirements..."
          />
        </Grid>

        {/* Citation Style */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.citation}>
            <InputLabel>Citation Style</InputLabel>
            <Select
              value={data.citation}
              label="Citation Style"
              onChange={(e) => onChange({ citation: e.target.value })}
            >
              {citationStyles.map((style) => (
                <MenuItem key={style} value={style}>
                  {style}
                </MenuItem>
              ))}
            </Select>
            {errors.citation && <FormHelperText>{errors.citation}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Number of Sources */}
        <Grid item xs={12} md={6}>
          <Box sx={{ px: 2 }}>
            <Typography gutterBottom sx={{ fontWeight: 600, color: brand.ink }}>
              Number of Sources: {data.sources}
            </Typography>
            <Slider
              value={data.sources}
              onChange={(_, newValue) => onChange({ sources: newValue as number })}
              min={0}
              max={50}
              step={1}
              marks={[
                { value: 0, label: '0' },
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 25, label: '25' },
                { value: 50, label: '50' },
              ]}
              valueLabelDisplay="auto"
              sx={{ color: brand.purple }}
            />
            <Typography variant="caption" color="text.secondary">
              Minimum number of sources required (0 = no specific requirement)
            </Typography>
          </Box>
        </Grid>

        {/* Additional Information */}
        <Grid item xs={12}>
          <Box sx={{
            bgcolor: brand.lavender,
            border: `1px solid ${brand.line}`,
            borderRadius: 3,
            p: 3,
            mt: 2,
          }}>
            <Typography sx={{ fontWeight: 700, color: brand.ink, mb: 1 }}>
              Tips for Better Results
            </Typography>
            <Typography variant="body2" component="div" sx={{ color: brand.body, fontWeight: 500 }}>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Be as specific as possible in your instructions</li>
                <li>Include any rubrics or assignment guidelines if available</li>
                <li>Mention your professor's preferences if known</li>
                <li>Specify if you need drafts or progress updates</li>
                <li>Include any materials that should be referenced</li>
                <li>Mention if there are topics or sources to avoid</li>
              </ul>
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}