import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  hasPermission: (role: UserRole | UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      
      hasPermission: (role: UserRole | UserRole[]) => {
        const { user } = get();
        if (!user) return false;
        
        if (user.role === UserRole.ADMIN) return true;
        
        if (Array.isArray(role)) {
          return role.includes(user.role);
        }
        
        return user.role === role;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

