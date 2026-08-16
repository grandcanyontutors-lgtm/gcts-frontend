'use client';

import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge,
  Collapse,
  InputAdornment,
  Fab,
} from '@mui/material';
import {
  Add,
  Search,
  Close,
  TuneRounded,
  ViewList,
  ViewModule,
  Refresh,
} from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderTable } from '@/components/orders/OrderTable';
import { useGetOrdersQuery } from '@/store/api/orderApi';
import type { OrderFilters } from '@/store/api/orderApi';
import {
  SUBJECT_OPTIONS,
  ORDER_TYPE_OPTIONS,
  ACADEMIC_LEVEL_OPTIONS,
  URGENCY_OPTIONS,
  labelFor,
  type OrderOption,
} from '@/lib/orderOptions';
import { brand, panelSx, primaryButtonSx, AppPageHeader, PageShell } from '@/lib/brand';

const PAGE_SIZE = 12;

/**
 * Tabs are the status filter.
 *
 * Previously the page carried a status `Select` *and* a tab bar, which meant
 * two controls for one concept and no defined behaviour when they disagreed —
 * and the tabs did nothing for admins anyway, because the filter-building code
 * only branched on `role === 'writer'`. Each tab now declares the exact filter
 * payload it stands for, so adding one is a data change rather than another
 * arm on a switch over tab indices.
 *
 * Status values are the backend's canonical lifecycle vocabulary (see
 * `Order.ORDER_STATUS`): pending → assigned → in_progress →
 * solution_submitted → released → (in_revision → released)* → completed.
 */
interface OrderTab {
  label: string;
  filters: OrderFilters;
}

const TABS_BY_ROLE: Record<string, OrderTab[]> = {
  student: [
    { label: 'All', filters: {} },
    {
      label: 'Active',
      filters: {
        status: ['pending', 'assigned', 'in_progress', 'solution_submitted', 'in_revision'],
      },
    },
    { label: 'Delivered', filters: { status: ['released'] } },
    { label: 'Completed', filters: { status: ['completed'] } },
    { label: 'Cancelled', filters: { status: ['cancelled'] } },
  ],
  writer: [
    { label: 'Assigned to me', filters: { assigned_to_me: true } },
    { label: 'Available', filters: { status: ['pending'], unassigned: true } },
    { label: 'All', filters: {} },
  ],
  admin: [
    { label: 'All', filters: {} },
    { label: 'Needs a writer', filters: { status: ['pending'], unassigned: true } },
    { label: 'In progress', filters: { status: ['assigned', 'in_progress', 'in_revision'] } },
    { label: 'Awaiting review', filters: { status: ['solution_submitted'] } },
    { label: 'Completed', filters: { status: ['released', 'completed'] } },
  ],
};

// Only fields in the backend's `ordering_fields` allow-list — anything else is
// rejected server-side and silently falls back to the default order.
const SORT_OPTIONS: OrderOption[] = [
  { value: '-created_at', label: 'Newest first' },
  { value: 'created_at', label: 'Oldest first' },
  { value: 'deadline', label: 'Deadline: soonest' },
  { value: '-deadline', label: 'Deadline: latest' },
  { value: '-price', label: 'Price: highest' },
  { value: 'price', label: 'Price: lowest' },
  { value: 'title', label: 'Title: A–Z' },
];

// The optional facets, behind the "Filters" toggle. Each key is a real
// `OrderFilterSet` parameter.
const FACETS: { key: keyof OrderFilters; label: string; options: OrderOption[] }[] = [
  { key: 'subject', label: 'Subject', options: SUBJECT_OPTIONS },
  { key: 'type', label: 'Paper type', options: ORDER_TYPE_OPTIONS },
  { key: 'level', label: 'Academic level', options: ACADEMIC_LEVEL_OPTIONS },
  { key: 'urgency', label: 'Urgency', options: URGENCY_OPTIONS },
];

type FacetKey = 'subject' | 'type' | 'level' | 'urgency';
type FacetState = Record<FacetKey, string[]>;

const EMPTY_FACETS: FacetState = { subject: [], type: [], level: [], urgency: [] };

function OrdersPage() {
  const { user } = useAuth();
  const role = user?.role ?? 'student';
  const tabs = TABS_BY_ROLE[role] ?? TABS_BY_ROLE.student;

  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');
  const [facets, setFacets] = useState<FacetState>(EMPTY_FACETS);
  const [showFacets, setShowFacets] = useState(false);
  const [page, setPage] = useState(1);

  // Debounced search: the field fires a request per keystroke otherwise, and
  // each one invalidates the previous result so the list flickers empty.
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const activeFacetCount = Object.values(facets).reduce((total, values) => total + values.length, 0);

  const filters: OrderFilters = useMemo(() => {
    const selected: OrderFilters = { ...tabs[tabValue]?.filters };

    if (searchTerm) selected.search = searchTerm;
    for (const { key } of FACETS) {
      const values = facets[key as FacetKey];
      if (values.length) (selected as Record<string, unknown>)[key] = values;
    }

    return selected;
  }, [tabs, tabValue, searchTerm, facets]);

  // Any change to what is being asked for invalidates the page number — page 5
  // of an unfiltered list is usually past the end of a filtered one, which
  // renders as an empty result the user reads as "nothing matched".
  useEffect(() => {
    setPage(1);
  }, [filters, sortBy]);

  const { data: ordersResponse, isLoading, isFetching, refetch } = useGetOrdersQuery({
    page,
    pageSize: PAGE_SIZE,
    ordering: sortBy,
    filters,
  });

  const orders = ordersResponse?.results ?? [];
  const totalCount = ordersResponse?.count ?? 0;

  const clearFacet = (key: FacetKey, value: string) => {
    setFacets((current) => ({ ...current, [key]: current[key].filter((v) => v !== value) }));
  };

  const subtitle =
    role === 'admin'
      ? 'Every order in the system, newest first.'
      : role === 'writer'
      ? 'Your assignments and the work available to pick up.'
      : 'Track the papers you have ordered.';

  const canCreateOrder = role === 'student';

  return (
    <PageShell>
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
        <AppPageHeader
          title={role === 'admin' ? 'Order management' : 'Orders'}
          subtitle={subtitle}
          action={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tooltip title="Refresh">
                <IconButton onClick={() => refetch()} sx={{ color: brand.body }}>
                  <Refresh />
                </IconButton>
              </Tooltip>

              <Tooltip title={viewMode === 'grid' ? 'Switch to table' : 'Switch to cards'}>
                <IconButton
                  onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                  sx={{ color: brand.body }}
                >
                  {viewMode === 'grid' ? <ViewList /> : <ViewModule />}
                </IconButton>
              </Tooltip>

              {canCreateOrder && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  component={Link}
                  href="/order/place"
                  sx={{ ...primaryButtonSx, display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  New order
                </Button>
              )}
            </Box>
          }
        />

        {/* One control surface: status tabs, then a single row of search / sort
            / optional facets. This replaced two stacked filter panels, one of
            which called an endpoint that does not exist. */}
        <Paper sx={{ ...panelSx, mb: 3, overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={(_, next) => setTabValue(next)}
            aria-label="Filter orders by status"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              px: 1,
              borderBottom: `1px solid ${brand.line}`,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 14,
                minHeight: 52,
                color: brand.body,
              },
              '& .Mui-selected': { color: `${brand.purple} !important` },
              '& .MuiTabs-indicator': { backgroundColor: brand.purple, height: 3 },
            }}
          >
            {tabs.map((tab) => (
              <Tab key={tab.label} label={tab.label} />
            ))}
          </Tabs>

          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'center',
              flexWrap: 'wrap',
              px: 2,
              py: 1.5,
            }}
          >
            <TextField
              size="small"
              placeholder="Search titles and instructions"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              sx={{ flex: '1 1 260px', minWidth: 200 }}
              // On the input itself — a bare `aria-label` prop lands on
              // TextField's wrapper div, where no screen reader looks for it.
              inputProps={{ 'aria-label': 'Search orders' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: brand.body, fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="Clear search"
                      onClick={() => setSearchInput('')}
                    >
                      <Close sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="orders-sort-label">Sort by</InputLabel>
              <Select
                labelId="orders-sort-label"
                value={sortBy}
                label="Sort by"
                onChange={(event) => setSortBy(event.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Badge badgeContent={activeFacetCount} color="secondary">
              <Button
                startIcon={<TuneRounded />}
                onClick={() => setShowFacets((open) => !open)}
                aria-expanded={showFacets}
                sx={{ textTransform: 'none', fontWeight: 700, color: brand.purple }}
              >
                Filters
              </Button>
            </Badge>

            <Box sx={{ flexGrow: 1 }} />

            <Typography sx={{ fontSize: 14, fontWeight: 600, color: brand.body }}>
              {isLoading ? 'Loading…' : `${totalCount} ${totalCount === 1 ? 'order' : 'orders'}`}
            </Typography>
          </Box>

          <Collapse in={showFacets} unmountOnExit>
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexWrap: 'wrap',
                px: 2,
                pb: 2,
                borderTop: `1px solid ${brand.line}`,
                pt: 2,
              }}
            >
              {FACETS.map(({ key, label, options }) => {
                const facetKey = key as FacetKey;
                return (
                  <FormControl key={facetKey} size="small" sx={{ minWidth: 190, flex: '1 1 190px' }}>
                    <InputLabel id={`orders-facet-${facetKey}`}>{label}</InputLabel>
                    <Select
                      multiple
                      labelId={`orders-facet-${facetKey}`}
                      value={facets[facetKey]}
                      input={<OutlinedInput label={label} />}
                      onChange={(event) =>
                        setFacets((current) => ({
                          ...current,
                          [facetKey]:
                            typeof event.target.value === 'string'
                              ? event.target.value.split(',')
                              : event.target.value,
                        }))
                      }
                      renderValue={(selected) =>
                        selected.map((value) => labelFor(options, value)).join(', ')
                      }
                      MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                    >
                      {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Checkbox
                            size="small"
                            checked={facets[facetKey].includes(option.value)}
                            sx={{ color: brand.purple, '&.Mui-checked': { color: brand.purple } }}
                          />
                          <ListItemText primary={option.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );
              })}
            </Box>
          </Collapse>

          {activeFacetCount > 0 && (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                alignItems: 'center',
                px: 2,
                pb: 2,
              }}
            >
              {FACETS.flatMap(({ key, options }) =>
                facets[key as FacetKey].map((value) => (
                  <Chip
                    key={`${key}:${value}`}
                    size="small"
                    label={labelFor(options, value)}
                    onDelete={() => clearFacet(key as FacetKey, value)}
                    sx={{ bgcolor: brand.lavender, color: brand.ink, fontWeight: 600 }}
                  />
                ))
              )}
              <Button
                size="small"
                onClick={() => setFacets(EMPTY_FACETS)}
                sx={{ textTransform: 'none', fontWeight: 700, color: brand.body }}
              >
                Clear all
              </Button>
            </Box>
          )}
        </Paper>

        {viewMode === 'grid' ? (
          <OrderCard
            orders={orders}
            isLoading={isLoading || isFetching}
            userRole={role}
            onPageChange={setPage}
            currentPage={page}
            totalCount={totalCount}
          />
        ) : (
          <OrderTable
            orders={orders}
            isLoading={isLoading || isFetching}
            userRole={role}
            onPageChange={setPage}
            currentPage={page}
            totalCount={totalCount}
          />
        )}

        {canCreateOrder && (
          <Fab
            color="primary"
            aria-label="New order"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              display: { xs: 'flex', sm: 'none' },
              bgcolor: brand.purple,
              '&:hover': { bgcolor: brand.purpleDeep },
            }}
            component={Link}
            href="/order/place"
          >
            <Add />
          </Fab>
        )}
      </Container>
    </PageShell>
  );
}

export default function OrdersPageWithAuth() {
  return (
    <PrivateRoute>
      <OrdersPage />
    </PrivateRoute>
  );
}
