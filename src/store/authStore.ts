
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api/authApi';
import type { User as ApiUser } from '@/lib/api/types';
import { getErrorMessage } from '@/lib/api/client';

// Frontend User interface (compatible with API User)
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  reputation: number;
  joinedAt: string;
  createdAt: string;
  isVerified: boolean;
}

// Convert API User to Frontend User
const convertApiUser = (apiUser: ApiUser): User => ({
  id: apiUser.id.toString(),
  name: `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.username,
  username: apiUser.username,
  email: apiUser.email,
  role: apiUser.is_staff ? 'admin' : 'user', // Adjust based on your backend logic
  avatar: apiUser.avatar || undefined,
  reputation: apiUser.reputation || 0,
  joinedAt: apiUser.date_joined ? apiUser.date_joined.split('T')[0] : new Date().toISOString().split('T')[0],
  createdAt: apiUser.date_joined || new Date().toISOString(),
  isVerified: apiUser.is_verified || false,
});

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Attempting login with:', { username, password });
          const response = await authApi.login({ username, password });
          console.log('Login response:', response);
          
          if (response && response.user) {
            const user = convertApiUser(response.user);
            console.log('Converted user:', user);
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            });
            
            return true;
          } else {
            throw new Error('Invalid login response');
          }
        } catch (error) {
          console.error('Login error:', error);
          const errorMessage = getErrorMessage(error);
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          return false;
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const [firstName, ...lastNameParts] = name.split(' ');
          const lastName = lastNameParts.join(' ') || '';
          
          const response = await authApi.register({
            username: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_'),
            email,
            password,
            first_name: firstName,
            last_name: lastName,
          });
          
          if (response && response.user) {
            const user = convertApiUser(response.user);
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            });
            
            return true;
          } else {
            throw new Error('Invalid registration response');
          }
        } catch (error) {
          console.error('Registration error:', error);
          const errorMessage = getErrorMessage(error);
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          return false;
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authApi.logout();
        } catch (error) {
          console.warn('Logout error:', error);
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: null 
          });
        }
      },
      
      updateUser: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) return;
        
        set({ isLoading: true, error: null });
        
        try {
          // Convert frontend user updates to API format
          const apiUpdates: Partial<ApiUser> = {};
          
          if (updates.name) {
            const [firstName, ...lastNameParts] = updates.name.split(' ');
            apiUpdates.first_name = firstName;
            apiUpdates.last_name = lastNameParts.join(' ') || '';
          }
          
          if (updates.email) apiUpdates.email = updates.email;
          if (updates.avatar) apiUpdates.avatar = updates.avatar;
          
          const updatedApiUser = await authApi.updateProfile(apiUpdates);
          const updatedUser = convertApiUser(updatedApiUser);
          
          set({ 
            user: updatedUser, 
            isLoading: false, 
            error: null 
          });
        } catch (error) {
          console.error('Update user error:', error);
          const errorMessage = getErrorMessage(error);
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      checkAuth: async () => {
        if (!authApi.isAuthenticated()) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        
        set({ isLoading: true });
        
        try {
          const apiUser = await authApi.getProfile();
          const user = convertApiUser(apiUser);
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          console.warn('Auth check failed:', error);
          // Clear invalid tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
