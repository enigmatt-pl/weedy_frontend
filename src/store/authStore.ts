import { create } from 'zustand';
import { AuthApi, PlatformApi } from '../lib/api';
import { jwtDecode } from 'jwt-decode';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  platform_client_id?: string;
  platform_client_secret?: string;
  platform_configured?: boolean;
  city?: string;
  postcode?: string;
  province?: string;
  is_platform_connected?: boolean;
  credits: number;
}

export interface JwtPayload {
  sub: string;
  role: 'user' | 'super_admin';
  approved: boolean;
  accepted_terms_at: string | null;
  accepted_privacy_at: string | null;
  exp: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  role: 'user' | 'super_admin' | null;
  approved: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: Record<string, unknown>) => Promise<void>;
  updateProfile: (payload: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  signOut: () => void;
  initialize: () => void;
  checkPlatformStatus: () => Promise<void>;
  setCredits: (credits: number) => void;
}

const decodeAndSync = (token: string) => {
  const decoded = jwtDecode<JwtPayload>(token);
  return {
    role: decoded.role,
    approved: decoded.approved,
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('jwt_token'),
  role: null,
  approved: false,
  loading: true,

  signIn: async (email, password) => {
    try {
      const { data } = await AuthApi.login({ email, password });
      const { role, approved } = decodeAndSync(data.token);
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, role, approved, loading: false });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string, message?: string } } };
      const responseData = axiosError.response?.data;
      const errorMessage = typeof responseData === 'string' ? responseData : responseData?.error || responseData?.message || '';

      const lowerMessage = errorMessage.toLowerCase();
      if (lowerMessage.includes('invalid email or password')) throw new Error('Nieprawidłowy adres email lub hasło.');
      if (lowerMessage.includes('not approved')) throw new Error('Twoje konto oczekuje na zatwierdzenie przez administratora.');

      throw new Error('Wystąpił błąd autoryzacji. Spróbuj ponownie później.');
    }
  },

  signUp: async (payload) => {
    const { data } = await AuthApi.register(payload);
    const { role, approved } = decodeAndSync(data.token);
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ user: data.user, token: data.token, role, approved, loading: false });
  },

  updateProfile: async (payload: Partial<User>) => {
    const { data } = await AuthApi.updateProfile(payload);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, ...data.user };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  uploadAvatar: async (file: File) => {
    const { data } = await AuthApi.uploadAvatar(file);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, avatar_url: data.avatar_url };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  signOut: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    set({ user: null, token: null, role: null, approved: false, loading: false });
  },

  initialize: () => {
    const token = localStorage.getItem('jwt_token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user) {
      try {
        const { role, approved } = decodeAndSync(token);
        set({ token, user, role, approved, loading: false });
      } catch {
        localStorage.removeItem('jwt_token');
        set({ token: null, user: null, role: null, approved: false, loading: false });
      }
    } else {
      set({ loading: false });
    }
  },

  checkPlatformStatus: async () => {
    const isConnected = await PlatformApi.checkStatus();
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (currentUser) {
      const updatedUser = { ...currentUser, is_platform_connected: isConnected };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },
  
  setCredits: (credits: number) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (currentUser) {
      const updatedUser = { ...currentUser, credits };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },
}));
