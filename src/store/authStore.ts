
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    username: 'admin_user',
    email: 'admin@stackit.com',
    role: 'admin',
    reputation: 5000,
    joinedAt: '2024-01-01',
    createdAt: '2024-01-01T00:00:00.000Z',
    isVerified: true,
  },
  {
    id: '2',
    name: 'John Doe',
    username: 'john_doe',
    email: 'john@example.com',
    role: 'user',
    reputation: 1250,
    joinedAt: '2024-06-15',
    createdAt: '2024-06-15T00:00:00.000Z',
    isVerified: false,
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const user = mockUsers.find(u => u.email === email);
        if (user && (password === 'admin123' || password === 'password123')) {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      register: async (name: string, email: string, password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
        
        const newUser: User = {
          id: Date.now().toString(),
          name,
          username,
          email,
          role: 'user',
          reputation: 0,
          joinedAt: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          isVerified: false,
        };
        
        set({ user: newUser, isAuthenticated: true });
        return true;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
