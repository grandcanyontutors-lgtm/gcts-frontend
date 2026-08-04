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

const subjects = [
  'Mathematics',
  'English',
  'History',
  'Science',
  'Computer Science',
  'Business',
  'Economics',
  'Psychology',
  'Sociology',
  'Philosophy',
  'Literature',
  'Biology',
  'Chemistry',
  'Physics',
  'Engineering',
  'Medicine',
  'Law',
  'Education',
  'Art',
  'Music',
  'Other',
];

const orderTypes = [
  'Essay',
  'Research Paper',
  'Term Paper',
  'Thesis',
  'Dissertation',
  'Case Study',
  'Lab Report',
  'Book Report',
  'Assignment',
  'Homework',
  'Project',
  'Presentation',
  'Other',
];

const academicLevels = [
  'High School',
  'Undergraduate',
  'Graduate',
  'PhD',
  'Masters',
  'Professional',
];

const urgencyLevels = [
  { value: 'standard', label: 'Standard (7+ days)', multiplier: 1 },
  { value: 'urgent', label: 'Urgent (3-6 days)', multiplier: 1.5 },
  { value: 'very_urgent', label: 'Very Urgent (1-2 days)', multiplier: 2 },
];

export function OrderDetailsStep({ data, errors, onChange }: OrderDetailsStepProps) {
  const { options: subjectOptions, loading: subjectsLoading } = useDropdownOptions('subjects');
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
    const urgencyMultiplier = urgencyLevels.find(u => u.value === data.urgency)?.multiplier || 1;
    const levelMultiplier = data.academicLevel === 'PhD' ? 1.5 : 
                           data.academicLevel === 'Graduate' || data.academicLevel === 'Masters' ? 1.3 : 1;
    
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
                {subjectOptions.length > 0
                  ? subjectOptions.map((option) => (
                      <MenuItem key={option.id} value={option.name}>
                        {option.display_name}
                      </MenuItem>
                    ))
                  : subjects.map((subject) => (
                      <MenuItem key={subject} value={subject}>
                        {subject}
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
                {orderTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
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
                {academicLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
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
                {urgencyLevels.map((level) => (
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