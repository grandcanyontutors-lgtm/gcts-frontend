'use client';

import {
  Typography,
  Container,
  Box,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Paper,
  Collapse,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  FilterList,
  Description,
  School,
  MenuBook,
  ExpandMore,
} from '@mui/icons-material';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PaperCard } from '@/components/PaperCard';
import PaperCardSkeleton from '@/components/PaperCardSkeleton';
import { papersApi, SamplePaper } from '@/services/papersApi';
import { PageShell, PageHero, brand, cardSx, primaryButtonSx, outlineButtonSx, Mark } from '@/lib/brand';

export default function PapersPage() {
  const [papers, setPapers] = useState<SamplePaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [totalPapers, setTotalPapers] = useState(0);
  const [allPapers, setAllPapers] = useState<SamplePaper[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const papersPerPage = 9;

  // Safe to branch on: ThemeProvider gates render on mount, so there is no
  // server-rendered markup for this to disagree with (same pattern as Navbar).
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const showFilters = !isPhone || filtersOpen;
  const activeFilterCount =
    (subjectFilter !== 'all' ? 1 : 0) +
    (typeFilter !== 'all' ? 1 : 0) +
    (levelFilter !== 'all' ? 1 : 0);

  // Extract unique values for filters from all papers
  const subjects = ['all', ...Array.from(new Set(allPapers.map(p => p.subject)))].sort();
  const types = ['all', ...Array.from(new Set(allPapers.map(p => p.type)))].sort();
  const levels = ['all', ...Array.from(new Set(allPapers.map(p => p.level)))].sort();

  // Fetch all papers once to get filter options
  useEffect(() => {
    const fetchAllPapers = async () => {
      try {
        const response = await papersApi.getPapers({ page_size: 100 });
        setAllPapers(response.papers);
      } catch (error) {
        console.error('Failed to fetch all papers:', error);
      }
    };

    fetchAllPapers();
  }, []);

  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true);
      try {
        const params: any = {
          page,
          page_size: papersPerPage,
        };

        if (subjectFilter !== 'all') {
          params.subject = subjectFilter;
        }
        if (typeFilter !== 'all') {
          params.type = typeFilter;
        }
        if (levelFilter !== 'all') {
          params.level = levelFilter;
        }

        const response = await papersApi.getPapers(params);
        setPapers(response.papers);
        setTotalPapers(response.total);
      } catch (error) {
        console.error('Failed to fetch papers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [page, subjectFilter, typeFilter, levelFilter]);

  // Calculate total pages from API response
  const totalPages = Math.ceil(totalPapers / papersPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSubjectFilter('all');
    setTypeFilter('all');
    setLevelFilter('all');
    setPage(1);
  };

  // The library's size, inline under the subtitle. This used to be two large
  // stat cards, but the same two numbers are already on the page — the filter
  // bar reports "Showing X of Y" and the Subject dropdown lists the subjects —
  // so as cards they cost ~90px of the fold to repeat what follows them.
  const libraryStatSx = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    fontSize: 14,
    fontWeight: 700,
    color: brand.body,
  };

  return (
    <PageShell>
      <PageHero
        size="compact"
        eyebrow="Sample library"
        title={<>Sample <Mark>academic</Mark> papers</>}
        subtitle="See the standard we deliver, across every subject and academic level."
      >
        {!loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
            <Box sx={libraryStatSx}>
              <MenuBook sx={{ color: brand.purple, fontSize: 18 }} />
              {totalPapers} papers
            </Box>
            <Box sx={libraryStatSx}>
              <School sx={{ color: brand.purple, fontSize: 18 }} />
              {new Set(papers.map(p => p.subject)).size} subjects
            </Box>
          </Box>
        )}
      </PageHero>

      {/* No breadcrumbs: /papers is a top-level destination reached from the
          navbar, which already marks "Papers" as the active link. "Home /
          Sample Papers" only restated the heading directly above it. */}
      <Container maxWidth="lg" sx={{ py: { xs: 3.5, md: 5 } }}>
        {/* Filters. Full-width controls stack one per row on a phone, which is
            correct but tall — so on xs the panel collapses to a single row and
            the papers start near the top of the screen. The badge keeps a
            collapsed panel honest about how many filters are narrowing the
            list. */}
        <Paper elevation={0} sx={{ ...cardSx, '&:hover': {}, p: { xs: 2, md: 2.5 }, mb: { xs: 2.5, md: 4 } }}>
          <Box
            component={isPhone ? 'button' : 'div'}
            onClick={isPhone ? () => setFiltersOpen((o) => !o) : undefined}
            aria-expanded={isPhone ? filtersOpen : undefined}
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: showFilters ? 2 : 0,
              p: 0,
              border: 'none',
              bgcolor: 'transparent',
              font: 'inherit',
              textAlign: 'left',
              cursor: isPhone ? 'pointer' : 'default',
              minHeight: isPhone ? 36 : undefined,
            }}
          >
            <FilterList sx={{ color: brand.purple, fontSize: 20 }} />
            <Typography sx={{ fontWeight: 800, color: brand.ink, fontSize: 15 }}>
              Filter papers
            </Typography>
            {activeFilterCount > 0 && (
              <Box
                sx={{
                  px: 1,
                  borderRadius: 999,
                  bgcolor: brand.purple,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {activeFilterCount}
              </Box>
            )}
            {isPhone && (
              <ExpandMore
                sx={{
                  ml: 'auto',
                  color: brand.body,
                  transition: 'transform 0.2s',
                  transform: filtersOpen ? 'rotate(180deg)' : 'none',
                }}
              />
            )}
          </Box>
          <Collapse in={showFilters}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={subjectFilter}
                  label="Subject"
                  onChange={(e) => {
                    setSubjectFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  {subjects.map(subject => (
                    <MenuItem key={subject} value={subject}>
                      {subject === 'all' ? 'All Subjects' : subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  {types.map(type => (
                    <MenuItem key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Academic Level</InputLabel>
                <Select
                  value={levelFilter}
                  label="Academic Level"
                  onChange={(e) => {
                    setLevelFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  {levels.map(level => (
                    <MenuItem key={level} value={level}>
                      {level === 'all' ? 'All Levels' : level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
                sx={{ ...outlineButtonSx, height: 56 }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>

          </Collapse>

          <Typography sx={{ mt: showFilters ? 1.75 : 1.25, fontSize: 14, color: brand.body, fontWeight: 500 }}>
            Showing {papers.length} of {totalPapers} papers
          </Typography>
        </Paper>

        {/* Loading State with Skeletons */}
        {loading && (
          <Grid container spacing={3}>
            {Array.from({ length: papersPerPage }).map((_, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <PaperCardSkeleton />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Papers Grid */}
        {!loading && (
          <>
            {papers.length > 0 ? (
              <>
                <Grid container spacing={3}>
                  {papers.map((paper) => (
                    <Grid item xs={12} md={6} lg={4} key={paper.id}>
                      <PaperCard paper={paper} excerptLines={4} />
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          borderRadius: 2,
                          fontWeight: 700,
                        }
                      }}
                    />
                  </Box>
                )}
              </>
            ) : (
              <Paper elevation={0} sx={{ ...cardSx, '&:hover': {}, textAlign: 'center', py: 8 }}>
                <Description sx={{ fontSize: 64, color: brand.purple, mb: 2, opacity: 0.7 }} />
                <Typography sx={{ fontWeight: 800, color: brand.ink, fontSize: 20, mb: 1 }}>
                  No papers found
                </Typography>
                <Typography sx={{ color: brand.body, fontWeight: 500, mb: 3 }}>
                  No papers match your selected filters. Try adjusting your criteria.
                </Typography>
                <Button variant="outlined" onClick={clearFilters} sx={outlineButtonSx}>
                  Clear All Filters
                </Button>
              </Paper>
            )}
          </>
        )}

        {/* Call to Action */}
        <Box
          sx={{
            mt: 10,
            p: { xs: 4, md: 6 },
            background: `linear-gradient(135deg, ${brand.purpleDeep} 0%, ${brand.ink} 100%)`,
            color: '#fff',
            borderRadius: 4,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: { xs: 26, md: 34 }, mb: 1.5 }}>
            Need a custom paper written?
          </Typography>
          <Typography sx={{ mb: 4, fontWeight: 500, fontSize: { xs: 16, md: 18 }, color: 'rgba(255,255,255,0.85)' }}>
            Get the same quality and professionalism for your specific requirements.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              size="large"
              component={Link}
              href="/order/place"
              sx={{ ...primaryButtonSx, px: 4, py: 1.5 }}
            >
              Place your order
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              href="/services"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2.5,
                borderColor: 'rgba(255,255,255,0.6)',
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  borderColor: '#fff',
                },
              }}
            >
              View our services
            </Button>
          </Box>
        </Box>
      </Container>
    </PageShell>
  );
}
