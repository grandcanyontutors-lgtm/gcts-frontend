'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  TextField,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Skeleton,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Search,
  Clear,
  FilterList,
  BookmarkBorder,
  Bookmark,
  Share,
  OpenInNew,
  Assignment,
  Person,
  Payment,
  Star,
  Message,
  TrendingUp,
  History,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { AdvancedFilters } from '@/components/search/AdvancedFilters';
import {
  useGlobalSearchQuery,
  useGetSearchSuggestionsQuery,
  useGetRecentSearchesQuery,
  useGetPopularSearchesQuery,
  useGetSavedSearchesQuery,
  useSaveSearchMutation,
  useDeleteSavedSearchMutation,
  useRecordSearchInteractionMutation,
} from '@/store/api/searchApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function SearchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [searchTypes, setSearchTypes] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    userId: 0,
    limit: 50,
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<number[]>([]);

  // API hooks
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useGlobalSearchQuery({
    query: searchQuery,
    types: searchTypes.length > 0 ? searchTypes as any : undefined,
    ...filters,
  }, {
    skip: !searchQuery.trim(),
  });

  const { data: suggestions } = useGetSearchSuggestionsQuery({
    query: searchQuery,
  }, {
    skip: searchQuery.length < 2,
  });

  const { data: recentSearches } = useGetRecentSearchesQuery({ limit: 10 });
  const { data: popularSearches } = useGetPopularSearchesQuery({ limit: 10 });
  const { data: savedSearchList } = useGetSavedSearchesQuery();

  const [saveSearch] = useSaveSearchMutation();
  const [deleteSavedSearch] = useDeleteSavedSearchMutation();
  const [recordInteraction] = useRecordSearchInteractionMutation();

  useEffect(() => {
    const query = searchParams?.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('q', query);
      router.push(newUrl.toString());
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Update search types based on tab selection
    switch (newValue) {
      case 0: // All
        setSearchTypes([]);
        break;
      case 1: // Orders
        setSearchTypes(['order']);
        break;
      case 2: // Users
        setSearchTypes(['user']);
        break;
      case 3: // Payments
        setSearchTypes(['payment']);
        break;
      case 4: // Reviews
        setSearchTypes(['review']);
        break;
      case 5: // Messages
        setSearchTypes(['message']);
        break;
    }
  };

  const handleResultClick = async (result: any) => {
    await recordInteraction({
      query: searchQuery,
      resultId: result.id,
      resultType: result.type,
      action: 'click',
    });
  };

  const handleSaveSearch = async () => {
    if (searchQuery.trim()) {
      await saveSearch({
        query: searchQuery,
        filters,
        name: `Search: ${searchQuery}`,
        isPublic: false,
      });
    }
  };

  const handleDeleteSavedSearch = async (searchId: number) => {
    await deleteSavedSearch(searchId);
  };

  const filterConfig = [
    {
      key: 'dateFrom',
      label: 'From Date',
      type: 'date' as const,
    },
    {
      key: 'dateTo',
      label: 'To Date',
      type: 'date' as const,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
  ];

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'order': return <Assignment />;
      case 'user': return <Person />;
      case 'payment': return <Payment />;
      case 'review': return <Star />;
      case 'message': return <Message />;
      default: return <Search />;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'order': return 'primary.main';
      case 'user': return 'info.main';
      case 'payment': return 'success.main';
      case 'review': return 'warning.main';
      case 'message': return 'secondary.main';
      default: return 'grey.500';
    }
  };

  const results = searchResults?.results || [];
  const stats = searchResults?.stats;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Search
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find orders, users, payments, and more across the platform
        </Typography>
      </Box>

      {/* Search Input */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              size="medium"
              placeholder="Search for anything..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: searchQuery && (
                  <IconButton onClick={() => handleSearch('')}>
                    <Clear />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showAdvancedFilters}
                    onChange={(e) => setShowAdvancedFilters(e.target.checked)}
                  />
                }
                label="Advanced"
              />
              
              {searchQuery.trim() && (
                <Button
                  variant="outlined"
                  startIcon={<BookmarkBorder />}
                  onClick={handleSaveSearch}
                  size="small"
                >
                  Save
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <AdvancedFilters
          title="Search Filters"
          filters={filterConfig}
          values={filters}
          onChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
          onApply={() => {}}
          onReset={() => setFilters({ dateFrom: '', dateTo: '', status: '', userId: 0, limit: 50 })}
          showApplyButton={false}
          collapsible={false}
        />
      )}

      {/* Search Stats */}
      {stats && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {stats.totalResults} results found in {stats.searchTime}ms
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {Object.entries(stats.resultsByType).map(([type, count]) => (
                <Chip
                  key={type}
                  label={`${type}: ${count}`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        </Paper>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        {/* Scrollable: six tabs overflow a phone viewport, and a fixed Tabs bar
            clips the overflow rather than scrolling it — "Messages" was simply
            unreachable below ~600px. */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="All" />
          <Tab label="Orders" />
          <Tab label="Users" />
          <Tab label="Payments" />
          <Tab label="Reviews" />
          <Tab label="Messages" />
        </Tabs>
      </Box>

      {/* Search Results */}
      {searchQuery.trim() ? (
        <>
          {/* Loading State */}
          {searchLoading && (
            <Box sx={{ mb: 3 }}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="40%" />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* Error State */}
          {searchError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Failed to search. Please try again.
            </Alert>
          )}

          {/* No Results */}
          {!searchLoading && !searchError && results.length === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Search sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Results Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Try different keywords or check spelling
              </Typography>
              
              {suggestions && suggestions.length > 0 && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Did you mean:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {suggestions.map((suggestion) => (
                      <Chip
                        key={suggestion.text}
                        label={suggestion.text}
                        onClick={() => handleSearch(suggestion.text)}
                        clickable
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          )}

          {/* Results List */}
          {!searchLoading && !searchError && results.length > 0 && (
            <List>
              {results.map((result) => (
                <Card key={`${result.type}-${result.id}`} sx={{ mb: 2 }}>
                  <ListItem
                    component={Link}
                    href={result.url}
                    onClick={() => handleResultClick(result)}
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          bgcolor: getResultColor(result.type),
                          width: 40,
                          height: 40,
                        }}
                      >
                        {getResultIcon(result.type)}
                      </Avatar>
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {result.title}
                          </Typography>
                          <Chip
                            label={result.type}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.75rem' }}
                          />
                          {result.status && (
                            <Chip
                              label={result.status}
                              size="small"
                              color="primary"
                              sx={{ height: 20, fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          {result.subtitle && (
                            <Typography variant="body2" color="text.secondary">
                              {result.subtitle}
                            </Typography>
                          )}
                          {result.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {result.description}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {format(new Date(result.createdAt), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        </Box>
                      }
                    />

                    <ListItemSecondaryAction>
                      <IconButton size="small">
                        <OpenInNew />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Card>
              ))}
            </List>
          )}
        </>
      ) : (
        /* Search Suggestions and History */
        <Grid container spacing={3}>
          {/* Recent Searches */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <History />
                  Recent Searches
                </Typography>
                
                {recentSearches && recentSearches.length > 0 ? (
                  <List dense>
                    {recentSearches.map((search, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={() => handleSearch(search)}
                      >
                        <ListItemText primary={search} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent searches
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Popular Searches */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp />
                  Popular Searches
                </Typography>
                
                {popularSearches && popularSearches.length > 0 ? (
                  <List dense>
                    {popularSearches.map((search, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={() => handleSearch(search.term)}
                      >
                        <ListItemText
                          primary={search.term}
                          secondary={`${search.count} searches`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No popular searches available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Saved Searches */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Bookmark />
                  Saved Searches
                </Typography>
                
                {savedSearchList && savedSearchList.length > 0 ? (
                  <List dense>
                    {savedSearchList.map((search) => (
                      <ListItem key={search.id}>
                        <ListItemText
                          primary={search.name}
                          secondary={`"${search.query}" - ${format(new Date(search.createdAt), 'MMM dd, yyyy')}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleSearch(search.query)}
                            size="small"
                          >
                            <Search />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteSavedSearch(search.id)}
                            size="small"
                          >
                            <Clear />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No saved searches
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default function SearchPageWithAuth() {
  return (
    <PrivateRoute>
      <SearchPage />
    </PrivateRoute>
  );
}