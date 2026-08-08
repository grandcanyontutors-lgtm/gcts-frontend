'use client';

import { Container, Typography, Box, Divider, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import { brand, cardSx, PageShell, PageHero, Mark } from '@/lib/brand';

const LAST_UPDATED = 'May 23, 2026';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: [
      'Welcome to Grand Canyon Tutoring Services ("GCTS", "we", "us", or "our"). By accessing or using our website, services, and platform (collectively, the "Services"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the Services.',
      'These Terms apply to all visitors, registered users, students, and experts who access or use the Services.',
    ],
  },
  {
    title: '2. Eligibility & Accounts',
    body: [
      'You must be at least 18 years old, or the age of majority in your jurisdiction, to create an account and use the Services. By registering, you confirm that the information you provide is accurate and that you will keep it up to date.',
      'You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately if you suspect any unauthorized use.',
    ],
  },
  {
    title: '3. Our Services',
    body: [
      'GCTS is a safe portal to academic understanding. We connect students with qualified experts for academic writing assistance, tutoring, editing and proofreading, worked solutions, and access to a library of model sample papers.',
      'All materials we provide are intended as reference and learning aids to support your own study and to help you understand how strong academic work is researched, structured, and cited.',
    ],
  },
  {
    title: '4. Academic Integrity & Acceptable Use',
    body: [
      'GCTS supports learning, not academic dishonesty. You agree to use the work and guidance we provide responsibly and in accordance with the academic integrity policies of your institution.',
      'You agree not to use the Services for any unlawful purpose, to misrepresent authorship in violation of applicable rules, to harass experts or staff, or to upload content that infringes the rights of others.',
    ],
  },
  {
    title: '5. Orders & Payments',
    body: [
      'When you place an order, you agree to provide complete and accurate instructions, including subject, academic level, citation style, length, and deadline. Pricing is presented to you before you confirm an order and is based on these parameters.',
      'Payment status for each order may move through pending, partially paid, and paid states. Work generally begins once an order is confirmed. You are responsible for any fees associated with your chosen payment method.',
    ],
  },
  {
    title: '6. Revisions & Refunds',
    body: [
      'Every order includes up to two free revisions, provided the revision requests are consistent with the original instructions. Requests that substantially change the original scope may be treated as a new order.',
      'If we are unable to deliver work that meets the agreed instructions, you may be eligible for a partial or full refund depending on the stage and circumstances of the order. Refund requests are reviewed on a case-by-case basis by our support team.',
    ],
  },
  {
    title: '7. Intellectual Property',
    body: [
      'Upon full payment, you receive the deliverables produced for your order for your personal, reference use. GCTS retains ownership of its website, branding, templates, sample paper library, and underlying technology.',
      'You may not resell, redistribute, or publish materials provided through the Services in a manner that misrepresents their intended purpose as learning aids.',
    ],
  },
  {
    title: '8. Confidentiality & Privacy',
    body: [
      'We treat your personal information and your use of the Services as confidential. Communication between students and experts is conducted anonymously through our platform.',
      'We do not sell your personal information. Our handling of data is described in our Privacy Policy, which forms part of these Terms.',
    ],
  },
  {
    title: '9. Disclaimers',
    body: [
      'The Services are provided "as is" and "as available". While we work hard to deliver high-quality, original work on time, we do not guarantee any particular academic outcome, grade, or result.',
      'You remain responsible for how you use the materials we provide and for compliance with your institution’s policies.',
    ],
  },
  {
    title: '10. Limitation of Liability',
    body: [
      'To the maximum extent permitted by law, GCTS and its experts and staff shall not be liable for any indirect, incidental, special, or consequential damages arising out of or relating to your use of the Services. Our total liability for any claim shall not exceed the amount you paid for the order giving rise to the claim.',
    ],
  },
  {
    title: '11. Termination',
    body: [
      'We may suspend or terminate your access to the Services if you breach these Terms or use the Services in a way that harms other users, our experts, or GCTS. You may close your account at any time by contacting support.',
    ],
  },
  {
    title: '12. Changes to These Terms',
    body: [
      'We may update these Terms from time to time. When we make material changes, we will update the "Last updated" date above and, where appropriate, notify you. Your continued use of the Services after changes take effect constitutes acceptance of the revised Terms.',
    ],
  },
  {
    title: '13. Contact Us',
    body: [
      'If you have any questions about these Terms, please reach out through our Contact page and our support team will be happy to help.',
    ],
  },
];

export default function TermsPage() {
  return (
    <PageShell>
      <PageHero
        size="compact"
        eyebrow={`Last updated: ${LAST_UPDATED}`}
        title={
          <>
            Terms of <Mark>service</Mark>
          </>
        }
        subtitle="These Terms govern your use of Grand Canyon Tutoring Services — your rights, your responsibilities, and how we keep GCTS a safe portal to academic understanding."
      />

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ ...cardSx, p: { xs: 3.5, md: 6 }, '&:hover': {} }}>
          {sections.map((section) => (
            <Box key={section.title} sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: brand.ink, mb: 1.5 }}>
                {section.title}
              </Typography>
              {section.body.map((para, i) => (
                <Typography key={i} sx={{ fontSize: 15.5, fontWeight: 500, color: brand.body, mb: 1.5, lineHeight: 1.8 }}>
                  {para}
                </Typography>
              ))}
            </Box>
          ))}

          <Divider sx={{ my: 3, borderColor: brand.line }} />
          <Typography sx={{ fontSize: 15.5, fontWeight: 500, color: brand.body }}>
            Questions about these Terms? Visit our{' '}
            <MuiLink component={Link} href="/contact" sx={{ color: brand.purple, fontWeight: 700 }}>
              Contact page
            </MuiLink>
            .
          </Typography>
        </Box>
      </Container>
    </PageShell>
  );
}
