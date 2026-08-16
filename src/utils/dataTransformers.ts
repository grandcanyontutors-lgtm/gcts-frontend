/**
 * Data transformation utilities to map backend responses to frontend types
 */

import { User, Order, UserRole } from '@/types/api';

/**
 * Transform backend user data to frontend User type
 */
export function transformUser(backendUser: any): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName: backendUser.first_name || backendUser.firstName || '',
    lastName: backendUser.last_name || backendUser.lastName || '',
    role: mapUserRole(backendUser),
    isActive: backendUser.is_active ?? true,
    dateJoined: backendUser.date_joined || backendUser.dateJoined || new Date().toISOString(),
    lastLogin: backendUser.last_login || backendUser.lastLogin,
  };
}

/**
 * Map backend user permissions to frontend role.
 *
 * The login and profile endpoints already return an explicit `role`; only some
 * nested user objects (e.g. an order's `assigned_to`) come through as raw
 * Django flags. Deriving from the flags alone silently demoted every admin and
 * writer to 'student' after login, because `is_superuser`/`is_staff` are absent
 * from the serialised payload and both checks fell through.
 */
function mapUserRole(user: any): UserRole {
  if (user?.role === 'admin' || user?.role === 'writer' || user?.role === 'student') {
    return user.role;
  }
  if (user?.is_superuser) return 'admin';
  if (user?.is_staff) return 'writer';
  return 'student';
}

/**
 * Transform backend order data to frontend Order type
 */
export function transformOrder(backendOrder: any): Order {
  return {
    id: backendOrder.id,
    orderNumber: backendOrder.order_number || backendOrder.orderNumber,
    title: backendOrder.title,
    description: backendOrder.description || '',
    instructions: backendOrder.instructions || '',
    deadline: backendOrder.deadline,
    status: backendOrder.status,

    // User relationships
    user: backendOrder.user ? transformUser(backendOrder.user) : undefined,
    student: backendOrder.student ? transformUser(backendOrder.student) : backendOrder.user ? transformUser(backendOrder.user) : undefined,
    writer: backendOrder.writer ? transformUser(backendOrder.writer) : undefined,
    assigned_to: backendOrder.assigned_to ? transformUser(backendOrder.assigned_to) : undefined,

    // Order details
    subject: backendOrder.subject,
    type: backendOrder.type || backendOrder.order_type,
    order_type: backendOrder.order_type || backendOrder.type,
    orderType: backendOrder.order_type || backendOrder.type,

    level: backendOrder.level || backendOrder.academic_level,
    academic_level: backendOrder.academic_level || backendOrder.level,
    academicLevel: backendOrder.academic_level || backendOrder.level,

    citation_style: backendOrder.citation_style,
    citationStyle: backendOrder.citation_style,
    language: backendOrder.language,
    urgency: backendOrder.urgency,

    // Pages and requirements
    pages: backendOrder.pages || backendOrder.min_pages,
    min_pages: backendOrder.min_pages,
    max_pages: backendOrder.max_pages,
    sources: backendOrder.sources,

    // Pricing
    price: backendOrder.price || backendOrder.total_price,
    total_price: backendOrder.total_price || backendOrder.price,
    isPaid: backendOrder.is_paid ?? backendOrder.isPaid ?? false,
    is_paid: backendOrder.is_paid ?? backendOrder.isPaid ?? false,

    // Timestamps
    createdAt: backendOrder.created_at || backendOrder.createdAt,
    created_at: backendOrder.created_at || backendOrder.createdAt,
    updatedAt: backendOrder.updated_at || backendOrder.updatedAt,
    updated_at: backendOrder.updated_at || backendOrder.updatedAt,

    // Related data
    files: backendOrder.files || [],
    comments: backendOrder.comments || [],
    reviews: backendOrder.reviews || [],
  };
}

/**
 * Transform array of backend orders
 */
export function transformOrders(backendOrders: any[]): Order[] {
  return backendOrders.map(transformOrder);
}

/**
 * Transform backend paginated response
 */
export function transformPaginatedResponse<T>(
  backendResponse: any,
  transformFn: (item: any) => T
) {
  return {
    count: backendResponse.count,
    next: backendResponse.next,
    previous: backendResponse.previous,
    results: backendResponse.results ? backendResponse.results.map(transformFn) : [],
  };
}

/**
 * Transform frontend data to backend format for API requests
 */
export function transformToBackendOrder(frontendOrder: Partial<Order>): any {
  return {
    title: frontendOrder.title,
    instructions: frontendOrder.instructions,
    deadline: frontendOrder.deadline,
    subject: frontendOrder.subject,
    type: frontendOrder.type || frontendOrder.order_type,
    level: frontendOrder.level || frontendOrder.academic_level,
    citation_style: frontendOrder.citation_style || frontendOrder.citationStyle,
    language: frontendOrder.language,
    urgency: frontendOrder.urgency,
    min_pages: frontendOrder.min_pages || frontendOrder.pages,
    max_pages: frontendOrder.max_pages,
    sources: frontendOrder.sources,
    // Remove undefined values
    ...Object.fromEntries(
      Object.entries({
        description: frontendOrder.description,
        pages: frontendOrder.pages,
        price: frontendOrder.price || frontendOrder.total_price,
      }).filter(([_, v]) => v !== undefined)
    ),
  };
}