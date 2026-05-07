import axios from 'axios';

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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't globally redirect to /login.
      // Let the caller handle it or let ProtectedRoute handle it for routes.
      console.warn('Unauthorized request, but skipping global redirect.');
    }
    return Promise.reject(error);
  }
);

export interface Dispensary {
  id: number;
  title: string;
  description: string;
  estimated_price: number;
  status: 'draft' | 'published' | 'active' | 'archived';
  image_urls?: string[];
  images?: string[];
  created_at: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  hours?: string;
  rating?: number;
  categories?: string[];
  city?: string;
  website?: string;
  email?: string;
  user_id?: number;
  query_data?: string;
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
  getAll: async (page = 1, perPage = 10, userId?: string | number, all?: boolean, q?: string): Promise<PaginatedResponse<Dispensary>> => {
    const { data } = await apiClient.get<PaginatedResponse<Dispensary>>('/dispensaries', {
      params: { page, per_page: perPage, user_id: userId, all, q }
    });
    return data;
  },

  getOne: async (id: number | string): Promise<Dispensary> => {
    const { data } = await apiClient.get<{ dispensary?: Dispensary }>(`/dispensaries/${id}`);
    return data.dispensary || (data as unknown as Dispensary);
  },

  create: (payload: FormData) => {
    return apiClient.post('/dispensaries', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  publish: (id: string | number) =>
    apiClient.post(`/dispensaries/${id}/publish`),

  destroy: (id: number) =>
    apiClient.delete(`/dispensaries/${id}`),

  update: (id: number | string, payload: Record<string, unknown> | FormData) => {
    if (payload instanceof FormData) {
      return apiClient.post(`/dispensaries/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.put(`/dispensaries/${id}`, { dispensary: payload });
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

export const PlatformApi = {
  getAuthUrl: async (): Promise<string> => {
    const { data } = await apiClient.get<{ url: string }>('/platform/auth_url');
    return data.url;
  },

  checkStatus: async (): Promise<boolean> => {
    try {
      const { data } = await apiClient.get<{ connected: boolean }>('/platform/status');
      return data.connected;
    } catch {
      return false;
    }
  },

  searchProducts: async (query: string): Promise<{ products: any[] }> => {
    const { data } = await apiClient.get('/platform/search', {
      params: { query }
    });
    return data;
  }
};
