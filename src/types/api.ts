// Common API response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface APIResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

// User and Authentication types
export type UserRole = 'student' | 'writer' | 'admin';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  dateJoined: string;
  lastLogin?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: number;
  user: number;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string;
  // Student specific
  university?: string;
  major?: string;
  academicLevel?: string;
  // Writer specific
  specializations?: string[];
  rating?: number;
  totalOrders?: number;
  earnings?: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  /**
   * Proof that the address was reached, issued by POST /verify-otp/ after the
   * emailed code is entered. The backend refuses registration without it, so
   * no account can be created against an address that does not exist.
   */
  verificationToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

// Order types
// Mirrors the backend's canonical Order.ORDER_STATUS vocabulary.
export type OrderStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'solution_submitted'
  | 'released'
  | 'in_revision'
  | 'completed'
  | 'cancelled';

export type OrderType = 'essay' | 'research_paper' | 'assignment' | 'thesis' | 'dissertation' | 'other';

export type AcademicLevel = 'high_school' | 'undergraduate' | 'graduate' | 'phd';

export type CitationStyle = 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'IEEE' | 'other';

export interface Subject {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  orderNumber?: string;
  student?: User;
  user?: User; // Backend format
  writer?: User;
  assigned_to?: User; // Backend format
  subject: Subject;
  orderType?: OrderType;
  order_type?: string; // Backend format
  type?: string; // Backend format
  academicLevel?: AcademicLevel;
  academic_level?: string; // Backend format
  level?: string; // Backend format
  title: string;
  description?: string;
  instructions: string;
  pages?: number;
  min_pages?: number; // Backend format
  max_pages?: number; // Backend format
  sources?: number; // Backend format
  citationStyle?: CitationStyle;
  citation_style?: string; // Backend format
  language?: string; // Backend format
  urgency?: string; // Backend format
  deadline: string;
  status: OrderStatus;
  price?: number;
  total_price?: number; // Backend format
  isPaid?: boolean;
  is_paid?: boolean; // Backend format
  payment_status?: 'pending' | 'partially paid' | 'paid' | 'refunded'; // Backend format
  payment_instructions?: string; // Admin-authored; payment happens off-site
  revisions?: number; // Remaining revision requests (server-enforced cap)
  solution_released_at?: string | null;
  solution_link?: string | null;
  createdAt?: string;
  created_at?: string; // Backend format
  updatedAt?: string;
  updated_at?: string; // Backend format
  files?: OrderFile[];
  comments?: OrderComment[];
  reviews?: OrderReview[];
}

export interface OrderFile {
  id: string;
  order: string;
  file: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  // Matches backend OrderFile.kind (serialized as fileType)
  fileType: 'requirement' | 'solution';
}

export interface OrderComment {
  id: string;
  order: string;
  user: User;
  message: string;
  createdAt: string;
  files?: OrderFile[];
}

export interface OrderReview {
  id: string;
  order: string;
  student: User;
  writer: User;
  rating: number;
  comment?: string;
  createdAt: string;
}

// Review is an alias for OrderReview (same shape)
export type Review = OrderReview;

// Message between users on an order
export interface Message {
  id: string;
  content: string;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  order: {
    id: string;
    title: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  title: string;
  subject: string; // Backend expects choice value like 'computer science'
  type: string; // Backend expects choice value like 'essay'
  level: string; // Backend expects choice value like 'bachelors'
  min_pages: number;
  max_pages: number;
  deadline: string;
  instructions: string;
  style: string; // Backend expects choice value like 'apa7'
  urgency?: string; // 'low' | 'medium' | 'high'
  sources?: number;
  language?: string; // Default 'english US'
  files?: File[];
}

// Payment types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';

export type PaymentMethod = 'card' | 'paypal' | 'bank_transfer';

export interface Payment {
  id: string;
  order: Order;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  cardToken?: string;
  paypalToken?: string;
}

// Notification types
export type NotificationType = 
  | 'order_created' 
  | 'order_assigned' 
  | 'order_submitted' 
  | 'order_completed' 
  | 'payment_received' 
  | 'message_received'
  | 'review_received';

export interface Notification {
  id: string;
  user: User;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// Analytics types
export interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageRating: number;
  // Student specific
  totalSpent?: number;
  ordersInProgress?: number;
  // Writer specific
  totalEarnings?: number;
  successRate?: number;
  // Admin specific
  totalUsers?: number;
  monthlyRevenue?: number;
  topWriters?: User[];
}

export interface OrderAnalytics {
  period: string;
  totalOrders: number;
  revenue: number;
  averageOrderValue: number;
  completionRate: number;
}

// Error types
export interface APIError {
  message: string;
  status?: number;
  field?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// Search and filter types
export interface OrderFilters {
  status?: OrderStatus[];
  subject?: number[];
  orderType?: OrderType[];
  academicLevel?: AcademicLevel[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  assignedToMe?: boolean; // For writers
  myOrders?: boolean; // For students
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  ordering?: string;
}

// File upload types
export interface FileUploadResponse {
  id: number;
  file: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export interface FileUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}