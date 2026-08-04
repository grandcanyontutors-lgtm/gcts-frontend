'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  VerifiedUserOutlined,
  ReplayOutlined,
  LockOutlined,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { brand, cardSx, primaryButtonSx, outlineButtonSx, Mark, PageShell } from '@/lib/brand';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { OrderDetailsStep } from '@/components/orders/OrderDetailsStep';
import { RequirementsStep } from '@/components/orders/RequirementsStep';
import { FilesStep } from '@/components/orders/FilesStep';
import { PaymentStep } from '@/components/orders/PaymentStep';
import { ReviewStep } from '@/components/orders/ReviewStep';
import { useCreateOrderMutation, useUploadOrderFileMutation } from '@/store/api/orderApi';
import type { CreateOrderRequest } from '@/types/api';

const steps = [
  'Order Details',
  'Requirements',
  'Files',
  'Payment',
  'Review',
];

export interface OrderFormData {
  // Order Details
  title: string;
  subject: string; // Will be converted to subject ID
  type: string; // Will be converted to OrderType enum
  academicLevel: string; // Will be converted to AcademicLevel enum
  pages: number;
  deadline: string;
  urgency: 'standard' | 'urgent' | 'very_urgent';
  
  // Requirements
  description: string;
  instructions: string;
  citation: string; // Will be converted to CitationStyle enum
  sources: number;
  
  // Files
  files: File[];
  
  // Payment (informational — payment happens off-site via admin instructions)
  budget: number;
}

const initialFormData: OrderFormData = {
  title: '',
  subject: '',
  type: '',
  academicLevel: '',
  pages: 1,
  deadline: '',
  urgency: 'standard',
  description: '',
  instructions: '',
  citation: '',
  sources: 0,
  files: [],
  budget: 0,
};

function PlaceOrderPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();
  const { user } = useAuth();
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const [uploadOrderFile, { isLoading: isUploading }] = useUploadOrderFileMutation();
  const [uploadWarning, setUploadWarning] = useState<{ orderId: string; failed: string[] } | null>(null);

  const updateFormData = (stepData: Partial<OrderFormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    // Clear errors for updated fields
    const updatedFields = Object.keys(stepData);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => delete newErrors[field]);
      return newErrors;
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Order Details
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.subject) newErrors.subject = 'Subject is required';
        if (!formData.type) newErrors.type = 'Order type is required';
        if (!formData.academicLevel) newErrors.academicLevel = 'Academic level is required';
        if (formData.pages < 1) newErrors.pages = 'Pages must be at least 1';
        if (!formData.deadline) newErrors.deadline = 'Deadline is required';
        break;
      
      case 1: // Requirements
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.instructions) newErrors.instructions = 'Instructions are required';
        if (!formData.citation) newErrors.citation = 'Citation style is required';
        break;
      
      case 2: // Files (optional)
        // Files are optional, no validation needed
        break;
      
      case 3: // Payment info (informational — payment happens off-site,
              // the admin confirms the cost and shares instructions)
        if (formData.budget < 0) newErrors.budget = 'Budget cannot be negative';
        break;
      
      case 4: // Review (final validation)
        // Validate all required fields
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.subject) newErrors.subject = 'Subject is required';
        if (!formData.type) newErrors.type = 'Order type is required';
        if (!formData.academicLevel) newErrors.academicLevel = 'Academic level is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.instructions) newErrors.instructions = 'Instructions are required';
        if (formData.budget < 0) newErrors.budget = 'Budget cannot be negative';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      return;
    }

    try {
      // Helper function to map UI values to API enum values
      const mapOrderType = (type: string): any => {
        const mapping: Record<string, string> = {
          'Essay': 'essay',
          'Research Paper': 'research paper',
          'Term Paper': 'research paper',
          'Thesis': 'thesis',
          'Dissertation': 'dissertation',
          'Assignment': 'assignment',
          'Case Study': 'other',
          'Lab Report': 'other',
          'Book Report': 'other',
          'Homework': 'assignment',
          'Project': 'other',
          'Presentation': 'other',
          'Other': 'other',
        };
        return mapping[type] || 'other';
      };

      const mapAcademicLevel = (level: string): any => {
        const mapping: Record<string, string> = {
          'High School': 'college',
          'Undergraduate': 'bachelors',
          'Graduate': 'masters',
          'PhD': 'doctorate',
          'Masters': 'masters',
          'Professional': 'masters',
        };
        return mapping[level] || 'bachelors';
      };

      const mapCitationStyle = (style: string): any => {
        const mapping: Record<string, string> = {
          'APA': 'apa7',
          'MLA': 'mla',
          'Chicago': 'chicago',
          'Harvard': 'harvard',
          'IEEE': 'ieee',
          'Vancouver': 'other',
          'AMA': 'other',
          'ASA': 'other',
          'APSA': 'other',
          'Turabian': 'chicago',
          'Other': 'other',
          'Not Required': 'other',
        };
        return mapping[style] || 'other';
      };

      // Convert form data to API format (using backend field names)
      const orderRequest: CreateOrderRequest = {
        title: formData.title,
        // Option values come from the dropdown-options API (already backend
        // choice values); lowercase only to tolerate the static fallback list.
        subject: formData.subject.toLowerCase(),
        type: mapOrderType(formData.type),
        level: mapAcademicLevel(formData.academicLevel),
        min_pages: formData.pages,
        max_pages: formData.pages,
        deadline: formData.deadline,
        instructions: formData.description + '\n\n' + formData.instructions, // Combine description and instructions
        style: mapCitationStyle(formData.citation),
        sources: formData.sources || 0,
        urgency: formData.urgency === 'very_urgent' ? 'high' : formData.urgency === 'urgent' ? 'medium' : 'low',
        language: 'english US',
        // Note: files will be handled separately as the backend expects multipart upload
      };

      const result = await createOrder(orderRequest).unwrap();

      // Upload attachments one by one. The order already exists, so a failed
      // upload must not lose the order — collect failures and let the user
      // retry from the order page instead.
      const failedUploads: string[] = [];
      for (const file of formData.files) {
        try {
          await uploadOrderFile({ orderId: result.id, file }).unwrap();
        } catch {
          failedUploads.push(file.name);
        }
      }

      if (failedUploads.length > 0) {
        setUploadWarning({ orderId: result.id, failed: failedUploads });
        return;
      }

      // Redirect to order details page
      router.push(`/orders/${result.id}`);
    } catch (err) {
      console.error('Failed to create order:', err);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <OrderDetailsStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        );
      case 1:
        return (
          <RequirementsStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        );
      case 2:
        return (
          <FilesStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        );
      case 3:
        return (
          <PaymentStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        );
      case 4:
        return (
          <ReviewStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  const trustItems = [
    { icon: <VerifiedUserOutlined sx={{ fontSize: 18 }} />, label: 'Reviewed before delivery' },
    { icon: <ReplayOutlined sx={{ fontSize: 18 }} />, label: '2 free revisions' },
    { icon: <LockOutlined sx={{ fontSize: 18 }} />, label: 'Confidential' },
  ];

  return (
    <PageShell>
      <Box
        sx={{
          background: `radial-gradient(1100px 500px at 80% -20%, ${brand.lavender} 0%, ${brand.paper} 60%)`,
          borderBottom: `1px solid ${brand.line}`,
          py: { xs: 5, md: 7 },
        }}
      >
        <Container maxWidth="md">
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 30, md: 40 },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: brand.ink,
            }}
          >
            <Mark>Place your order</Mark>
          </Typography>
          <Typography
            sx={{
              mt: 2,
              fontSize: { xs: 15, md: 17 },
              fontWeight: 500,
              color: brand.body,
              lineHeight: 1.6,
            }}
          >
            No payment until we confirm your quote · 2 free revisions
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Trust strip */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 1.5, sm: 3 },
            justifyContent: 'center',
            mb: 3,
          }}
        >
          {trustItems.map((item) => (
            <Box
              key={item.label}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                color: brand.body,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <Box sx={{ color: brand.purple, display: 'inline-flex' }}>{item.icon}</Box>
              {item.label}
            </Box>
          ))}
        </Box>

        <Box sx={{ ...cardSx, p: { xs: 2.5, md: 4 }, '&:hover': { transform: 'none' } }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              mb: 4,
              '& .MuiStepConnector-line': { borderColor: brand.line },
              '& .MuiStepLabel-label': {
                fontWeight: 600,
                color: brand.body,
                fontSize: { xs: 12, sm: 14 },
                '&.Mui-active': { color: brand.ink, fontWeight: 700 },
                '&.Mui-completed': { color: brand.ink },
              },
              '& .MuiStepIcon-root': {
                color: brand.line,
                '&.Mui-active': { color: brand.purple },
                '&.Mui-completed': { color: brand.purpleDeep },
              },
              '& .MuiStepIcon-text': { fontWeight: 700 },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              Failed to create order. Please try again.
            </Alert>
          )}

          {uploadWarning && (
            <Alert
              severity="warning"
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => router.push(`/orders/${uploadWarning.orderId}`)}
                >
                  Go to order
                </Button>
              }
            >
              Your order was created, but {uploadWarning.failed.length} file
              {uploadWarning.failed.length > 1 ? 's' : ''} failed to upload
              ({uploadWarning.failed.join(', ')}). You can add them from the order page.
            </Alert>
          )}

          <Box sx={{ minHeight: 400 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${brand.line}`,
            }}
          >
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              sx={outlineButtonSx}
            >
              Back
            </Button>

            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isLoading || isUploading}
                  startIcon={isLoading || isUploading ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={primaryButtonSx}
                >
                  {isLoading ? 'Creating Order...' : isUploading ? 'Uploading Files...' : 'Place Order'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={primaryButtonSx}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </PageShell>
  );
}

export default function PlaceOrderPageWithAuth() {
  return (
    <PrivateRoute roles={['student']}>
      <PlaceOrderPage />
    </PrivateRoute>
  );
}