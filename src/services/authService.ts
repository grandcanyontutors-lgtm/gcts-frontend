import { APIClient } from '@/lib/api';
import {
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  User,
  UserRole
} from '@/types/api';
import { transformUser } from '@/utils/dataTransformers';

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  static async login(credentials: LoginRequest): Promise<AuthTokens> {
    console.log('🔐 AuthService.login called with:', credentials);
    console.log('🔗 Will call URL:', '/auth/login/');

    const response = await APIClient.post<any>('/auth/login/', credentials);

    // Map backend response to frontend AuthTokens type
    return {
      access: response.access,
      refresh: response.refresh,
      user: transformUser(response.user)
    };
  }

  /**
   * Register a new user
   */
  static async register(userData: RegisterRequest): Promise<AuthTokens> {
    // Backend RegisterView expects: email, password, firstName, lastName
    // and returns { user, access, refresh } (user serialized in camelCase).
    const response = await APIClient.post<any>('/auth/register/', {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      verificationToken: userData.verificationToken,
    });

    // Map backend response to frontend AuthTokens type (mirror login()).
    return {
      access: response.access,
      refresh: response.refresh,
      user: transformUser(response.user),
    };
  }

  /**
   * Logout user and invalidate tokens
   */
  static async logout(refreshToken: string): Promise<void> {
    return APIClient.post<void>('/auth/logout/', { 
      refresh: refreshToken 
    });
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return APIClient.post<AuthTokens>('/auth/token/refresh/', { 
      refresh: refreshToken 
    });
  }

  /**
   * Get current authenticated user profile
   */
  static async getCurrentUser(): Promise<User> {
    const response = await APIClient.get<any>('/auth/user/');
    return transformUser(response);
  }

  /**
   * Map backend user permissions to frontend role
   */
  private static mapUserRole(user: any): UserRole {
    if (user.is_superuser) return 'admin';
    if (user.is_staff) return 'writer';
    return 'student';
  }

  /**
   * Update user profile
   */
  static async updateProfile(userData: Partial<User>): Promise<User> {
    return APIClient.patch<User>('/auth/user/', userData);
  }

  /**
   * Change user password
   */
  static async changePassword(data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<void> {
    return APIClient.post<void>('/auth/change-password/', {
      old_password: data.oldPassword,
      new_password: data.newPassword,
    });
  }

  /**
   * Request password reset email
   */
  static async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    return APIClient.post<void>('/auth/password-reset/', data);
  }

  /**
   * Confirm password reset with token
   */
  static async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    return APIClient.post<void>('/auth/password-reset/confirm/', data);
  }

  /**
   * Verify email address
   */
  static async verifyEmail(token: string): Promise<void> {
    return APIClient.post<void>('/auth/verify-email/', { token });
  }

  /**
   * Resend email verification
   */
  static async resendEmailVerification(): Promise<void> {
    return APIClient.post<void>('/auth/resend-verification/');
  }

  /**
   * Check if email is available
   */
  static async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
    return APIClient.post<{ available: boolean }>('/auth/check-email/', { email });
  }

  /**
   * Get user by ID (for admin/writer purposes)
   */
  static async getUserById(userId: number): Promise<User> {
    return APIClient.get<User>(`/users/${userId}/`);
  }

  /**
   * Upload user avatar
   */
  static async uploadAvatar(file: File): Promise<{ avatar: string }> {
    return APIClient.uploadFile<{ avatar: string }>('/auth/upload-avatar/', file);
  }
}