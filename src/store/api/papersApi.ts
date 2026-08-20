import { baseApi, buildQueryParams } from './baseApi';

/**
 * Sample papers.
 *
 * The types here used to describe a model that does not exist: slug, type,
 * level, pages, excerpt, author, keywords, is_published, featured,
 * download_count, meta_description. The real `Paper` has a title, a subject,
 * content, and `is_open`. Rendering the imagined fields put objects where React
 * expected strings and crashed the tab outright once it started receiving real
 * rows.
 *
 * `is_open` is the product's access rule: open papers show their full content
 * publicly, closed ones show only an excerpt until an admin accepts an access
 * request.
 */
export interface PaperSubject {
  id: string;
  title: string;
}

export interface AdminPaper {
  id: string;
  title: string;
  content: string;
  subject: PaperSubject | null;
  is_open: boolean;
  has_access?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePaperData {
  title: string;
  content: string;
  /** Writable counterpart of the read-only nested `subject`. */
  subject_id: string;
  is_open?: boolean;
}

export interface UpdatePaperData extends Partial<CreatePaperData> {
  id: string;
}

export interface PapersListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: AdminPaper[];
}

export interface PapersQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

export const papersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all papers with admin details
    getAdminPapers: builder.query<PapersListResponse, PapersQueryParams>({
      query: (params = {}) => {
        const queryString = buildQueryParams(params);
        // `/admin/papers/` is not a registered route — the papers resource is
        // flat, and staff already see everything on it.
        return `/papers/${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: any): PapersListResponse => {
        if (response?.success && response?.data && response?.meta?.pagination) {
          return {
            count: response.meta.pagination.total_items,
            next: response.meta.pagination.next_url,
            previous: response.meta.pagination.previous_url,
            results: response.data,
          };
        }
        return response;
      },
      providesTags: (result) =>
        result
          ? [
              ...(result.results ?? []).map(({ id }) => ({ type: 'AdminPaper' as const, id })),
              { type: 'AdminPaper', id: 'LIST' },
            ]
          : [{ type: 'AdminPaper', id: 'LIST' }],
    }),

    // The categories a paper can belong to. `Paper.subject` is a real FK to
    // this model — distinct from the order form's subject dropdown, which lives
    // in the dropdown-options system.
    getPaperSubjects: builder.query<PaperSubject[], void>({
      query: () => '/paper-subjects/',
      transformResponse: (response: any): PaperSubject[] => {
        const payload =
          response?.success && response?.data !== undefined ? response.data : response;
        return Array.isArray(payload) ? payload : payload?.results ?? [];
      },
      providesTags: [{ type: 'AdminPaper', id: 'SUBJECTS' }],
    }),

    // Get single paper for editing
    getAdminPaper: builder.query<AdminPaper, string>({
      query: (id) => `/papers/${id}/`,
      providesTags: (result, error, id) => [{ type: 'AdminPaper', id }],
    }),

    // Create new paper
    createPaper: builder.mutation<AdminPaper, CreatePaperData>({
      query: (data) => ({
        url: '/papers/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'AdminPaper', id: 'LIST' }],
    }),

    // Update existing paper
    updatePaper: builder.mutation<AdminPaper, UpdatePaperData>({
      query: ({ id, ...data }) => ({
        url: `/papers/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AdminPaper', id },
        { type: 'AdminPaper', id: 'LIST' },
      ],
    }),

    // Delete paper
    deletePaper: builder.mutation<void, string>({
      query: (id) => ({
        url: `/papers/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'AdminPaper', id },
        { type: 'AdminPaper', id: 'LIST' },
      ],
    }),

  }),
});

export const {
  useGetAdminPapersQuery,
  useGetPaperSubjectsQuery,
  useGetAdminPaperQuery,
  useCreatePaperMutation,
  useUpdatePaperMutation,
  useDeletePaperMutation,
} = papersApi;