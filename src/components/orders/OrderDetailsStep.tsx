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
  InputAdornment,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useState, useEffect } from 'react';
import type { OrderFormData } from '@/app/order/place/page';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { brand } from '@/lib/brand';
import {
  ACADEMIC_LEVEL_OPTIONS,
  ORDER_TYPE_OPTIONS,
  SUBJECT_OPTIONS,
  URGENCY_OPTIONS,
  optionsFromApi,
} from '@/lib/orderOptions';

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

interface OrderDetailsStepProps {
  data: OrderFormData;
  errors: Record<string, string>;
  onChange: (data: Partial<OrderFormData>) => void;
}


export function OrderDetailsStep({ data, errors, onChange }: OrderDetailsStepProps) {
  // Admin-managed options, falling back to the canonical lists when the API is
  // unreachable. Both carry backend choice values, so what the user picks is
  // what gets submitted.
  const { options: apiSubjects, loading: subjectsLoading } = useDropdownOptions('subjects');
  const { options: apiTypes } = useDropdownOptions('order-types');
  const { options: apiLevels } = useDropdownOptions('academic-levels');

  const subjects = optionsFromApi(apiSubjects, SUBJECT_OPTIONS);
  const orderTypes = optionsFromApi(apiTypes, ORDER_TYPE_OPTIONS);
  const academicLevels = optionsFromApi(apiLevels, ACADEMIC_LEVEL_OPTIONS);

  const [deadline, setDeadline] = useState<Date | null>(
    data.deadline ? new Date(data.deadline) : null
  );

  const handleDeadlineChange = (newValue: Date | null) => {
    setDeadline(newValue);
    onChange({
      deadline: newValue?.toISOString() || '',
    });
  };

  const calculateEstimatedPrice = () => {
    const basePrice = 15; // Base price per page
    const urgencyMultiplier = URGENCY_OPTIONS.find(u => u.value === data.urgency)?.multiplier || 1;
    // Keyed on backend level values now that the Select stores those.
    const levelMultiplier = data.academicLevel === 'doctorate' ? 1.5 :
                           data.academicLevel === 'masters' ? 1.3 : 1;


    return Math.round(data.pages * basePrice * urgencyMultiplier * levelMultiplier);
  };

  useEffect(() => {
    const estimatedBudget = calculateEstimatedPrice();
    if (estimatedBudget !== data.budget) {
      onChange({ budget: estimatedBudget });
    }
  }, [data.pages, data.urgency, data.academicLevel]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: { xs: 0, sm: 1 } }}>
        <Typography gutterBottom sx={stepTitleSx}>
          Order Details
        </Typography>
        <Typography sx={stepSubtitleSx}>
          Provide basic information about your order
        </Typography>

        <Grid container spacing={3}>
          {/* Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Order Title"
              value={data.title}
              onChange={(e) => onChange({ title: e.target.value })}
              error={!!errors.title}
              helperText={errors.title || 'Brief title describing your order'}
              placeholder="e.g., Research Paper on Climate Change"
            />
          </Grid>

          {/* Subject — driven by the admin-managed dropdown-options API, with
              the static list as a fallback if the API is unavailable */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.subject} disabled={subjectsLoading}>
              <InputLabel>Subject</InputLabel>
              <Select
                value={data.subject}
                label="Subject"
                onChange={(e) => onChange({ subject: e.target.value })}
              >
                {subjects.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.subject && <FormHelperText>{errors.subject}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Order Type */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.type}>
              <InputLabel>Order Type</InputLabel>
              <Select
                value={data.type}
                label="Order Type"
                onChange={(e) => onChange({ type: e.target.value })}
              >
                {orderTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Academic Level */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.academicLevel}>
              <InputLabel>Academic Level</InputLabel>
              <Select
                value={data.academicLevel}
                label="Academic Level"
                onChange={(e) => onChange({ academicLevel: e.target.value })}
              >
                {academicLevels.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.academicLevel && <FormHelperText>{errors.academicLevel}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Urgency */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Urgency</InputLabel>
              <Select
                value={data.urgency}
                label="Urgency"
                onChange={(e) => onChange({ urgency: e.target.value as any })}
              >
                {URGENCY_OPTIONS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Pages */}
          <Grid item xs={12} md={6}>
            <Box sx={{ px: 2 }}>
              <Typography gutterBottom sx={{ fontWeight: 600, color: brand.ink }}>
                Number of Pages: {data.pages}
              </Typography>
              <Slider
                value={data.pages}
                onChange={(_, newValue) => onChange({ pages: newValue as number })}
                min={1}
                max={50}
                step={1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 10, label: '10' },
                  { value: 25, label: '25' },
                  { value: 50, label: '50' },
                ]}
                valueLabelDisplay="auto"
                sx={{ color: brand.purple }}
              />
              {errors.pages && (
                <Typography color="error" variant="caption">
                  {errors.pages}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Deadline */}
          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="Deadline"
              value={deadline}
              onChange={handleDeadlineChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.deadline,
                  helperText: errors.deadline || 'When do you need this completed?',
                },
              }}
              minDateTime={new Date()}
            />
          </Grid>

          {/* Estimated Price */}
          <Grid item xs={12}>
            <Box sx={{
              background: `linear-gradient(135deg, ${brand.lavender} 0%, ${brand.paper} 100%)`,
              border: `1px solid ${brand.line}`,
              borderRadius: 3,
              p: 3,
              mt: 2,
            }}>
              <Typography sx={{ fontWeight: 700, color: brand.ink, mb: 0.5 }}>
                Estimated Price
              </Typography>
              <Typography sx={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', color: brand.purple, lineHeight: 1.1 }}>
                ${calculateEstimatedPrice()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: brand.body, fontWeight: 500 }}>
                Base: ${15}/page × {data.pages} pages × Urgency multiplier × Academic level multiplier
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}