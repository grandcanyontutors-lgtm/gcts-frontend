'use client';

import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  Alert,
  Button,
} from '@mui/material';
import {
  Assignment,
  Schedule,
  Subject,
  Description,
  AttachFile,
  Payment,
  CheckCircle,
  Info,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { OrderFormData } from '@/app/order/place/page';
import { brand } from '@/lib/brand';
import {
  ACADEMIC_LEVEL_OPTIONS,
  CITATION_STYLE_OPTIONS,
  ORDER_TYPE_OPTIONS,
  SUBJECT_OPTIONS,
  URGENCY_OPTIONS,
  labelFor,
} from '@/lib/orderOptions';

const reviewCardSx = {
  bgcolor: '#fff',
  borderRadius: 3,
  border: `1px solid ${brand.line}`,
  boxShadow: '0 12px 28px -22px rgba(26,21,38,0.35)',
  height: '100%',
};

const cardHeadingSx = {
  display: 'flex',
  alignItems: 'center',
  fontWeight: 700,
  color: brand.ink,
  mb: 1,
  '& svg': { color: brand.purple },
};

interface ReviewStepProps {
  data: OrderFormData;
  errors: Record<string, string>;
  onChange: (data: Partial<OrderFormData>) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function ReviewStep({ data, errors }: ReviewStepProps) {
  const serviceFee = Math.round(data.budget * 0.05);
  const totalAmount = data.budget + serviceFee;
  const deadline = data.deadline ? new Date(data.deadline) : null;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'success';
    }
  };

  return (
    <Box sx={{ p: { xs: 0, sm: 1 } }}>
      <Typography gutterBottom sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 800, letterSpacing: '-0.02em', color: brand.ink, lineHeight: 1.2 }}>
        Review Your Order
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, fontSize: 15, fontWeight: 500, color: brand.body }}>
        Please review all details before placing your order
      </Typography>

      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            Please fix the following errors before proceeding:
          </Typography>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Order Details */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={reviewCardSx}>
            <CardContent>
              <Typography gutterBottom sx={cardHeadingSx}>
                <Assignment sx={{ mr: 1 }} />
                Order Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Title"
                    secondary={data.title || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Subject"
                    secondary={
                      data.subject ? labelFor(SUBJECT_OPTIONS, data.subject) : 'Not specified'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Type"
                    secondary={
                      data.type ? labelFor(ORDER_TYPE_OPTIONS, data.type) : 'Not specified'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Academic Level"
                    secondary={
                      data.academicLevel
                        ? labelFor(ACADEMIC_LEVEL_OPTIONS, data.academicLevel)
                        : 'Not specified'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Pages"
                    secondary={`${data.pages} pages`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Deadline"
                    secondary={deadline ? format(deadline, 'PPP p') : 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Urgency"
                    secondary={
                      <Chip
                        label={labelFor(URGENCY_OPTIONS, data.urgency)}
                        color={getUrgencyColor(data.urgency) as any}
                        size="small"
                      />
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Requirements */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={reviewCardSx}>
            <CardContent>
              <Typography gutterBottom sx={cardHeadingSx}>
                <Description sx={{ mr: 1 }} />
                Requirements
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Description"
                    secondary={
                      <Typography variant="body2" sx={{ 
                        maxHeight: 100, 
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        lineHeight: 1.4
                      }}>
                        {data.description || 'Not provided'}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Citation Style"
                    secondary={
                      data.citation
                        ? labelFor(CITATION_STYLE_OPTIONS, data.citation)
                        : 'Not specified'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Sources Required"
                    secondary={data.sources > 0 ? `${data.sources} sources` : 'No specific requirement'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed Instructions */}
        <Grid item xs={12}>
          <Card elevation={0} sx={reviewCardSx}>
            <CardContent>
              <Typography gutterBottom sx={{ fontWeight: 700, color: brand.ink }}>
                Detailed Instructions
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: brand.paper, border: `1px solid ${brand.line}`, borderRadius: 2, maxHeight: 200, overflow: 'auto' }}>
                <Typography variant="body2" sx={{ color: brand.body }} style={{ whiteSpace: 'pre-wrap' }}>
                  {data.instructions || 'No detailed instructions provided'}
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Uploaded Files */}
        {data.files.length > 0 && (
          <Grid item xs={12}>
            <Card elevation={0} sx={reviewCardSx}>
              <CardContent>
                <Typography gutterBottom sx={cardHeadingSx}>
                  <AttachFile sx={{ mr: 1 }} />
                  Uploaded Files ({data.files.length})
                </Typography>
                <List dense>
                  {data.files.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <AttachFile />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`${formatFileSize(file.size)} • ${file.type || 'Unknown type'}`}
                      />
                    </ListItem>
                  ))}
                </List>
                <Typography variant="caption" color="text.secondary">
                  Total: {formatFileSize(data.files.reduce((acc, file) => acc + file.size, 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Budget & Payment Summary */}
        <Grid item xs={12}>
          <Card elevation={0} sx={reviewCardSx}>
            <CardContent>
              <Typography gutterBottom sx={cardHeadingSx}>
                <Payment sx={{ mr: 1 }} />
                Budget & Payment Information
              </Typography>

              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> No payment will be processed now. This is your estimated cost based on your budget.
                  You'll receive payment instructions after our team reviews your order.
                </Typography>
              </Alert>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Estimated Cost Breakdown:
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Your Budget:</Typography>
                  <Typography>${data.budget}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Service Fee (5%):</Typography>
                  <Typography>${serviceFee}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 800, color: brand.ink }}>Estimated Total:</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: brand.purple }}>${totalAmount}</Typography>
                </Box>
                <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
                  * Final cost may vary based on order complexity and requirements
                </Typography>
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                No payment is collected now — after review, the final cost and payment
                instructions will be shared on your order page and by email.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Final Notice */}
        <Grid item xs={12}>
          <Alert severity="info" icon={<Info />} sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>What happens next?</strong><br />
              After placing your order, here's the process:
            </Typography>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li><strong>Order Review:</strong> Our team reviews your requirements and provides a final cost quote</li>
              <li><strong>Payment Instructions:</strong> You'll receive email instructions for your selected payment method</li>
              <li><strong>Writer Assignment:</strong> Once payment is confirmed, we'll assign a qualified writer</li>
              <li><strong>Order Tracking:</strong> Monitor progress, communicate with your writer, and receive updates</li>
              <li><strong>Delivery:</strong> Download your completed work and request revisions if needed</li>
            </ul>
          </Alert>
        </Grid>

        {/* Terms Agreement */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: brand.lavender, border: `1px solid ${brand.line}`, borderRadius: 3 }}>
            <Typography variant="body2" align="center" sx={{ color: brand.body, fontWeight: 500 }}>
              By placing this order, you agree to our{' '}
              <Button variant="text" size="small" sx={{ p: 0, minWidth: 'auto', color: brand.purple, fontWeight: 700 }}>
                Terms of Service
              </Button>
              {' '}and{' '}
              <Button variant="text" size="small" sx={{ p: 0, minWidth: 'auto', color: brand.purple, fontWeight: 700 }}>
                Privacy Policy
              </Button>
              . You confirm that the information provided is accurate and that you have the right to submit this work.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}