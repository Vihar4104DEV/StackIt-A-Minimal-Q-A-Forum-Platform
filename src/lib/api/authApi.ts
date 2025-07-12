import { api } from './client';
import { API_ROUTES } from './config';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User, 
  PasswordChangeData, 
  PasswordResetData 
} from './types';

// Authentication API functions
export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, credentials);
    
    // Store tokens in localStorage
    if (response && response.tokens) {
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
    }
    
    return response;
  },

  // Register new user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(API_ROUTES.AUTH.REGISTER, userData);
    
    // Store tokens in localStorage
    if (response && response.tokens) {
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
    }
    
    return response;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post(API_ROUTES.AUTH.LOGOUT);
    } catch (error) {
      console.warn('Logout API call failed, but clearing local storage:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>(API_ROUTES.USER.PROFILE);
    return response;
  },

  // Update user profile
  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const response = await api.patch<User>(API_ROUTES.USER.UPDATE_PROFILE, profileData);
    return response;
  },

  // Change password
  changePassword: async (passwordData: PasswordChangeData): Promise<void> => {
    await api.post(API_ROUTES.AUTH.PASSWORD_CHANGE, passwordData);
  },

  // Request password reset
  requestPasswordReset: async (emailData: PasswordResetData): Promise<void> => {
    await api.post(API_ROUTES.AUTH.PASSWORD_RESET, emailData);
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },

  // Get stored tokens
  getTokens: () => {
    return {
      access: localStorage.getItem('access_token'),
      refresh: localStorage.getItem('refresh_token'),
    };
  },
}; 