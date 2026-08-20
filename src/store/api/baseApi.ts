import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TokenManager } from '@/lib/api';
import config from '@/lib/config';
import type { 
  PaginatedResponse, 
  APIError,
  User,
  AuthTokens 
} from '@/types/api';

// Define base query with auth headers
const baseQuery = fetchBaseQuery({
  baseUrl: config.getApiUrl(),
  prepareHeaders: (headers, { getState }) => {
    // Add auth token if available
    const token = TokenManager.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Add content type for JSON requests
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    return headers;
  },
});

// Enhanced base query with token refresh logic
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // If we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    const refreshToken = TokenManager.getRefreshToken();
    
    if (refreshToken) {
      // Try to get a new token
      const refreshResult = await baseQuery(
        {
          url: '/auth/token/refresh/',
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      );
      
      if (refreshResult.data) {
        const { access, refresh } = refreshResult.data as AuthTokens;
        
        // Store the new tokens
        TokenManager.setTokens(access, refresh);
        
        // Retry the original query
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, clear tokens and redirect to login
        TokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } else {
      // No refresh token, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }
  
  return result;
};

// Create the base API slice
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Order',
    'Payment',
    'Notification',
    'Subject',
    'Review',
    'OrderComment',
    'OrderFile',
    'Message',
    'DashboardStats',
    'SystemHealth',
    'AdminPaper',
    'SearchResults',
    'SearchSuggestions',
    'RecentSearches',
    'PopularSearches',
    'SavedSearches',
    'SearchAnalytics',
  ],
  endpoints: () => ({}),
});

// Enhanced error handling
export const handleApiError = (error: any): string => {
  if (error?.data) {
    if (typeof error.data === 'string') {
      return error.data;
    }
    
    if (error.data.message) {
      return error.data.message;
    }
    
    if (error.data.detail) {
      return error.data.detail;
    }
    
    if (error.data.error) {
      return error.data.error;
    }
    
    // Handle field-specific errors
    if (error.data.errors && typeof error.data.errors === 'object') {
      const firstField = Object.keys(error.data.errors)[0];
      if (firstField && error.data.errors[firstField]) {
        const fieldError = error.data.errors[firstField];
        return Array.isArray(fieldError) ? fieldError[0] : fieldError;
      }
    }
  }
  
  if (error?.error) {
    return error.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Utility function for transforming paginated responses
export const transformPaginatedResponse = <T>(response: PaginatedResponse<T>) => {
  return {
    data: response.results,
    total: response.count,
    hasMore: !!response.next,
    next: response.next,
    previous: response.previous,
  };
};

// Generic query types for reuse
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  ordering?: string;
}

export interface FilterableQuery<TFilters = {}> extends PaginationParams {
  filters?: TFilters;
}

// Utility function to build query parameters
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  // Two paginators are in play: StandardPagination reads `page_size`, while
  // DefaultPagination reads `pageSize`. Sending only the camelCase form meant
  // every StandardPagination endpoint silently ignored the requested size and
  // returned its default 20. Emitting both lets each paginator find its own
  // parameter; the other is simply unused.
  if (params.pageSize !== undefined && params.page_size === undefined) {
    params = { ...params, page_size: params.pageSize };
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};