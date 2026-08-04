'use client';

import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Schedule,
  Send,
} from '@mui/icons-material';
import { useState } from 'react';
import { axiosInstance } from '@/lib/api';
import {
  brand,
  cardSx,
  primaryButtonSx,
  Mark,
  Eyebrow,
  PageHero,
  PageShell,
} from '@/lib/brand';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      // The Inquiry resource stores email + message; fold name/subject into
      // the message body so the admin gets the full context.
      await axiosInstance.post('/inquiries/', {
        email: formData.email,
        message:
          `From: ${formData.name || 'Anonymous'}\n` +
          (formData.subject ? `Subject: ${formData.subject}\n\n` : '\n') +
          formData.message,
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 8000);
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message ||
          'Failed to send your message. Please try again or email us directly.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const contactItems = [
    {
      icon: Email,
      title: 'Email Support',
      content: 'support@gcts.com',
      description: 'Get help via email',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      content: '+1 (555) 123-4567',
      description: 'Call us for immediate help',
    },
    {
      icon: Schedule,
      title: 'Support Hours',
      content: '24/7 Available',
      description: "We're always here to help",
    },
    {
      icon: LocationOn,
      title: 'Location',
      content: 'Grand Canyon, AZ',
      description: 'United States',
    },
  ];

  const faqs = [
    {
      question: 'How quickly can you complete my order?',
      answer:
        'We offer flexible deadlines from 3 hours to 30 days. Rush orders are available for urgent assignments.',
    },
    {
      question: 'Is my personal information secure?',
      answer:
        'Yes, we use advanced encryption and never share your personal information with third parties.',
    },
    {
      question: "What if I'm not satisfied with my paper?",
      answer:
        "We offer up to 2 free revisions to ensure your paper meets all requirements and a money-back guarantee if you're not satisfied.",
    },
    {
      question: 'Do you provide plagiarism reports?',
      answer:
        'Yes, every order comes with a free plagiarism report to ensure 100% originality.',
    },
  ];

  return (
    <PageShell>
      <PageHero
        eyebrow="Contact Us"
        title={<>We're here to <Mark>help</Mark></>}
        subtitle="Have questions? Reach out to our support team and we'll get back to you within 24 hours."
      />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }}>
          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Box sx={{ ...cardSx, p: { xs: 3, md: 4 }, '&:hover': { transform: 'none' } }}>
              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: 22, md: 26 },
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: brand.ink,
                  mb: 3,
                }}
              >
                Send us a message
              </Typography>

              {submitted && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Thank you for your message! We'll get back to you within 24 hours.
                </Alert>
              )}

              {submitError && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError('')}>
                  {submitError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<Send />}
                      sx={{ ...primaryButtonSx, px: 4, py: 1.3, fontSize: 16 }}
                      disabled={submitting}
                    >
                      {submitting ? 'Sending…' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={5}>
            <Eyebrow>Get in touch</Eyebrow>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              {contactItems.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    ...cardSx,
                    p: 3,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    '&:hover': { transform: 'none' },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: brand.lavender,
                      color: brand.purple,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <item.icon />
                  </Box>
                  <Box>
                    <Typography
                      sx={{ fontSize: 16, fontWeight: 800, color: brand.ink, mb: 0.25 }}
                    >
                      {item.title}
                    </Typography>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: brand.purpleDeep }}>
                      {item.content}
                    </Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 500, color: brand.body }}>
                      {item.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* FAQ Section */}
        <Box sx={{ mt: { xs: 7, md: 10 } }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: 26, md: 34 },
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: brand.ink,
              }}
            >
              Frequently asked <Mark>questions</Mark>
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {faqs.map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box sx={{ ...cardSx, p: 3, height: '100%', '&:hover': { transform: 'none' } }}>
                  <Typography
                    sx={{ fontSize: 17, fontWeight: 800, color: brand.ink, mb: 1 }}
                  >
                    {faq.question}
                  </Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 500, color: brand.body, lineHeight: 1.6 }}>
                    {faq.answer}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </PageShell>
  );
}
