'use client';

import {
  Box,
  Typography,
  TextField,
  Grid,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Payment } from '@mui/icons-material';
import type { OrderFormData } from '@/app/order/place/page';
import { brand } from '@/lib/brand';

interface PaymentStepProps {
  data: OrderFormData;
  errors: Record<string, string>;
  onChange: (data: Partial<OrderFormData>) => void;
}

/**
 * Informational payment step — payment happens OFF-SITE. The admin reviews the
 * order, confirms the final cost, and shares payment instructions directly on
 * the order page. No payment details are collected here; the budget is an
 * optional hint for the admin's quote.
 */
export function PaymentStep({ data, errors, onChange }: PaymentStepProps) {
  return (
    <Box sx={{ p: { xs: 0, sm: 1 } }}>
      <Typography gutterBottom sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 800, letterSpacing: '-0.02em', color: brand.ink, lineHeight: 1.2 }}>
        Payment
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, fontSize: 15, fontWeight: 500, color: brand.body }}>
        You don&apos;t pay anything now. After you submit the order, our team
        reviews it, confirms the final cost, and shares payment instructions
        with you on the order page and by email.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Budget (optional)"
            value={data.budget || ''}
            onChange={(e) => onChange({ budget: Number(e.target.value) || 0 })}
            error={!!errors.budget}
            helperText={
              errors.budget ||
              'An indicative budget helps us prepare your quote faster.'
            }
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Alert severity="info" icon={<Payment />} sx={{ borderRadius: 2 }}>
            <Typography variant="body2" component="div">
              <strong>How payment works</strong>
              <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                <li>Submit your order — no payment details are collected on the site</li>
                <li>Our team reviews the requirements and confirms the final cost</li>
                <li>You receive payment instructions on your order page and by email</li>
                <li>Once payment is confirmed, your order is assigned to a writer</li>
                <li>Your solution is released after review, with up to 2 free revisions</li>
              </ul>
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
}
