import { baseApi } from './baseApi';
import type { DashboardStats } from '@/types/api';

/**
 * Admin endpoints.
 *
 * This file declared 32 endpoints. Exactly one of them —
 * `/admin/dashboard-stats/` — is a route the backend registers. The other 31
 * (system health, server and application metrics, settings, logs, backups,
 * announcements, cache, maintenance, audit trail, security events, API usage,
 * rate limits, database stats, import/export, reports) all 404, and 26 of them
 * had no caller at all. They described an operations console nobody built.
 *
 * The five that *were* called backed the Overview health panel, the Analytics
 * tab and the Settings tab. The first lost its panel, and the last two lost
 * their tabs, so the endpoints go with them. Anything reinstated here should be
 * added back alongside the view that serves it and the route that answers it.
 */
export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/admin/dashboard-stats/',
      transformResponse: (response: any): DashboardStats =>
        response?.success && response?.data !== undefined ? response.data : response,
      providesTags: ['DashboardStats'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = adminApi;
