import axios from 'axios';
import { PlatformSearchResponse } from '../types/platform';

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1` || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface GenerateDispensaryResponse {
  id: number;
  status: 'generating' | 'draft' | 'published';
  credits_remaining: number;
  reasoning?: string;
  title?: string;
  description?: string;
  estimated_price?: number;
  image_urls?: string[];
  images?: string[];
  platform_configured?: boolean;
}

export interface Dispensary {
  id: number;
  query_data: string;
  title: string;
  description: string;
  reasoning?: string;
  estimated_price: number;
  status: 'generating' | 'draft' | 'published';
  image_urls?: string[];
  images?: string[];
  platform_product_id?: string;
  created_at: string;
}

export const AuthApi = {
  register: (payload: Record<string, unknown>) =>
    apiClient.post('/users', { user: payload }),
  signUp: (payload: Record<string, unknown>) => apiClient.post('/users/sign_up', { user: payload }),
  login: (payload: Record<string, string>) =>
    apiClient.post('/users/sign_in', { user: payload }),
  updateProfile: (payload: Record<string, unknown>) =>
    apiClient.put('/users', { user: payload }),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.put('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export interface PaginatedResponse<T> {
  dispensaries: T[];
  meta: {
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
    total_pages: number;
    total_count: number;
  };
}

export const DispensariesApi = {
  generate: async (queryData: string, files: File[]): Promise<GenerateDispensaryResponse> => {
    const formData = new FormData();
    formData.append('query_data', queryData);
    Array.from(files).forEach((file) => formData.append('images[]', file));

    const { data } = await apiClient.post<{ dispensary?: GenerateDispensaryResponse; credits_remaining?: number }>('/dispensaries/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Support both direct response and { dispensary: ..., credits_remaining: ... }
    if (data.dispensary) {
      return { ...data.dispensary, credits_remaining: data.credits_remaining || 0 };
    }
    return data as unknown as GenerateDispensaryResponse;
  },

  getAll: async (page = 1, perPage = 10, userId?: string | number): Promise<PaginatedResponse<Dispensary>> => {
    const { data } = await apiClient.get<PaginatedResponse<Dispensary>>('/dispensaries', {
      params: { page, per_page: perPage, user_id: userId }
    });
    return data;
  },

  getOne: async (id: number | string): Promise<Dispensary> => {
    const { data } = await apiClient.get<{ dispensary?: Dispensary }>(`/dispensaries/${id}`);
    return data.dispensary || (data as unknown as Dispensary);
  },

  create: (payload: Record<string, unknown> | FormData) => {
    if (payload instanceof FormData) {
      return apiClient.post('/dispensaries', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.post('/dispensaries', { dispensary: payload });
  },

  publish: (id: string | number) =>
    apiClient.post(`/dispensaries/${id}/publish`),

  destroy: (id: number) =>
    apiClient.delete(`/dispensaries/${id}`),

  update: (id: number | string, payload: Record<string, unknown> | FormData) => {
    if (payload instanceof FormData) {
      return apiClient.post(`/dispensaries/${id}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return apiClient.put(`/dispensaries/${id}`, { dispensary: payload });
  },
};
export const PlatformApi = {
  getAuthUrl: async (): Promise<string> => {
    const { data } = await apiClient.get<{ url: string }>('/platform_integration/auth_url');
    return data.url;
  },

  checkStatus: async (): Promise<boolean> => {
    const { data } = await apiClient.get<{ connected: boolean }>('/platform_integration/status');
    return data.connected;
  },

  searchProducts: async (query: string): Promise<PlatformSearchResponse> => {
    const { data } = await apiClient.get<PlatformSearchResponse>('/platform/products', {
      params: { query }
    });
    return data;
  },
};

export const AdminApi = {
  getUsers: (page: number = 1, query: string = '') =>
    apiClient.get('/admin/users', { params: { page, query } }),
  approveUser: (id: string | number) => apiClient.post(`/admin/users/${id}/approve`),
  revokeUser: (id: string | number) => apiClient.post(`/admin/users/${id}/unapprove`),
  rejectUser: (id: string | number) => apiClient.delete(`/admin/users/${id}`),
  updateCredits: (id: string | number, credits: number) =>
    apiClient.patch(`/admin/users/${id}/credits`, { credits }),
  deleteUser: (id: string | number) => apiClient.delete(`/admin/users/${id}/hard_delete`),
  getPageViews: (page = 1, perPage = 50, search = '', language = '', country = '') => 
    apiClient.get(`/admin/analytics/page_views?page=${page}&per_page=${perPage}&search=${search}&language=${language}&country=${country}`),
  getAnalyticsSummary: () =>
    apiClient.get('/admin/analytics/summary'),
};
