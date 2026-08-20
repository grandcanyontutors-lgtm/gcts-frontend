import { baseApi, buildQueryParams, transformPaginatedResponse } from './baseApi';
import type { FilterableQuery } from './baseApi';
import type { 
  User, 
  PaginatedResponse
} from '@/types/api';

/**
 * Mirrors `UserFilterSet` in the backend (`api/filters.py`).
 *
 * snake_case, because these are sent as query parameters verbatim: a camelCase
 * key is accepted by the server and silently discarded, which looks exactly
 * like "no results". `role` is derived from the Django permission flags
 * server-side rather than being a column.
 */
export interface UserFilters {
  role?: string[];
  is_active?: boolean;
  joined_after?: string;
  joined_before?: string;
  search?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  usersByRole: Record<string, number>;
  newUsersThisMonth: number;
  averageOrdersPerUser: number;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // User management
    getUsers: builder.query<
      PaginatedResponse<User>,
      FilterableQuery<UserFilters>
    >({
      query: (params = {}) => {
        const { filters, ...pagination } = params;
        const queryParams = { ...pagination, ...filters };
        const queryString = buildQueryParams(queryParams);
        return `/users/${queryString ? `?${queryString}` : ''}`;
      },
      // Without this the raw {success, data, meta} envelope is returned, so
      // `result.results` is undefined and the admin user table renders no rows
      // at all — even on a 200 with twelve users in the payload.
      transformResponse: (response: any): PaginatedResponse<User> => {
        if (response?.success && response?.data && response?.meta?.pagination) {
          return {
            count: response.meta.pagination.total_items,
            next: response.meta.pagination.next_url || null,
            previous: response.meta.pagination.previous_url || null,
            results: response.data,
          };
        }
        return response;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    getUser: builder.query<User, number>({
      query: (id) => `/users/${id}/`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    updateUser: builder.mutation<User, { id: number; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
        'DashboardStats',
      ],
    }),

    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
        'DashboardStats',
      ],
    }),

    // User role management
    promoteToWriter: builder.mutation<User, number>({
      query: (userId) => ({
        url: `/users/${userId}/promote-to-writer/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
        'DashboardStats',
      ],
    }),

    promoteToAdmin: builder.mutation<User, number>({
      query: (userId) => ({
        url: `/users/${userId}/promote-to-admin/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
        'DashboardStats',
      ],
    }),

    demoteUser: builder.mutation<User, { userId: number; newRole: string }>({
      query: ({ userId, newRole }) => ({
        url: `/users/${userId}/demote/`,
        method: 'POST',
        body: { role: newRole },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
        'DashboardStats',
      ],
    }),

    // User status management
    activateUser: builder.mutation<User, number>({
      query: (userId) => ({
        url: `/users/${userId}/activate/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
        'DashboardStats',
      ],
    }),

    deactivateUser: builder.mutation<User, { userId: number; reason?: string }>({
      query: ({ userId, reason }) => ({
        url: `/users/${userId}/deactivate/`,
        method: 'POST',
        body: reason ? { reason } : {},
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
        'DashboardStats',
      ],
    }),

    suspendUser: builder.mutation<
      User,
      { userId: number; reason: string; duration?: number }
    >({
      query: ({ userId, reason, duration }) => ({
        url: `/users/${userId}/suspend/`,
        method: 'POST',
        body: { reason, duration },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
        'DashboardStats',
      ],
    }),

    unsuspendUser: builder.mutation<User, number>({
      query: (userId) => ({
        url: `/users/${userId}/unsuspend/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
        'DashboardStats',
      ],
    }),

    // Writer-specific endpoints
    getWriters: builder.query<
      PaginatedResponse<User>,
      FilterableQuery<UserFilters & { specialization?: string[]; rating?: number }>
    >({
      query: (params = {}) => {
        const { filters, ...pagination } = params;
        const queryParams = { ...pagination, ...filters };
        const queryString = buildQueryParams(queryParams);
        return `/writers/${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'WRITERS' },
            ]
          : [{ type: 'User', id: 'WRITERS' }],
    }),

    getWriterStats: builder.query<{
      totalOrders: number;
      completedOrders: number;
      averageRating: number;
      totalEarnings: number;
      pendingOrders: number;
      onTimeDeliveryRate: number;
    }, number>({
      query: (writerId) => `/writers/${writerId}/stats/`,
      providesTags: (result, error, writerId) => [
        { type: 'User', id: writerId },
        'DashboardStats',
      ],
    }),

    updateWriterProfile: builder.mutation<
      User,
      {
        userId: number;
        data: {
          bio?: string;
          specializations?: string[];
          hourlyRate?: number;
          availability?: boolean;
          portfolio?: string;
          qualifications?: string[];
        };
      }
    >({
      query: ({ userId, data }) => ({
        url: `/writers/${userId}/profile/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'WRITERS' },
      ],
    }),

    // User statistics
    getUserStats: builder.query<UserStats, void>({
      query: () => '/users/stats/',
      providesTags: ['DashboardStats'],
    }),

    // User preferences
    getUserPreferences: builder.query<{
      theme: 'light' | 'dark' | 'system';
      language: string;
      timezone: string;
      emailNotifications: boolean;
      pushNotifications: boolean;
      smsNotifications: boolean;
    }, number>({
      query: (userId) => `/users/${userId}/preferences/`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    updateUserPreferences: builder.mutation<
      void,
      {
        userId: number;
        preferences: {
          theme?: 'light' | 'dark' | 'system';
          language?: string;
          timezone?: string;
          emailNotifications?: boolean;
          pushNotifications?: boolean;
          smsNotifications?: boolean;
        };
      }
    >({
      query: ({ userId, preferences }) => ({
        url: `/users/${userId}/preferences/`,
        method: 'PATCH',
        body: preferences,
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }],
    }),

    // Bulk operations
    bulkUpdateUsers: builder.mutation<
      { updated: number; errors: Array<{ id: number; error: string }> },
      {
        userIds: number[];
        data: Partial<User>;
      }
    >({
      query: ({ userIds, data }) => ({
        url: '/users/bulk-update/',
        method: 'POST',
        body: { user_ids: userIds, data },
      }),
      invalidatesTags: [
        { type: 'User', id: 'LIST' },
        'DashboardStats',
      ],
    }),

    bulkDeleteUsers: builder.mutation<
      { deleted: number; errors: Array<{ id: number; error: string }> },
      number[]
    >({
      query: (userIds) => ({
        url: '/users/bulk-delete/',
        method: 'DELETE',
        body: { user_ids: userIds },
      }),
      invalidatesTags: [
        { type: 'User', id: 'LIST' },
        'DashboardStats',
      ],
    }),

    // User verification
    verifyUserEmail: builder.mutation<User, number>({
      query: (userId) => ({
        url: `/users/${userId}/verify-email/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),

    sendVerificationEmail: builder.mutation<{ message: string }, number>({
      query: (userId) => ({
        url: `/users/${userId}/send-verification/`,
        method: 'POST',
      }),
    }),

    // User impersonation (admin only)
    impersonateUser: builder.mutation<{ token: string }, number>({
      query: (userId) => ({
        url: `/users/${userId}/impersonate/`,
        method: 'POST',
      }),
    }),

    stopImpersonation: builder.mutation<void, void>({
      query: () => ({
        url: '/users/stop-impersonation/',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // Dashboard endpoint
    getDashboard: builder.query<{
      user: User;
      totalOrders: number;
      activeOrders: number;
      completedOrders: number;
      totalSpent?: number;
      totalRevenue?: number;
      totalUsers?: number;
      myOrders?: any[];
    }, void>({
      query: () => '/dashboard/',
      transformResponse: (response: any) => {
        // Handle the backend response format
        if (response.success !== undefined) {
          return response;
        }
        // Direct response (legacy format)
        return response;
      },
      providesTags: ['DashboardStats'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  usePromoteToWriterMutation,
  usePromoteToAdminMutation,
  useDemoteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
  useGetWritersQuery,
  useGetWriterStatsQuery,
  useUpdateWriterProfileMutation,
  useGetUserStatsQuery,
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
  useBulkUpdateUsersMutation,
  useBulkDeleteUsersMutation,
  useVerifyUserEmailMutation,
  useSendVerificationEmailMutation,
  useImpersonateUserMutation,
  useStopImpersonationMutation,
  useGetDashboardQuery,
} = userApi;