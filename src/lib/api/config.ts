// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 15000, // 15 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Log API configuration for debugging
console.log('API Configuration:', {
  BASE_URL: API_CONFIG.BASE_URL,
  TIMEOUT: API_CONFIG.TIMEOUT,
  ENV_VAR: import.meta.env.VITE_API_BASE_URL
});

// API Endpoints - Centralized route definitions
export const API_ROUTES = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/token/refresh/',
    PASSWORD_RESET: '/auth/password/reset/',
    PASSWORD_CHANGE: '/auth/password/change/',
    VERIFY_EMAIL: '/auth/verify-email/',
  },
  
  // User Management
  USER: {
    PROFILE: '/auth/user/profile/',
    UPDATE_PROFILE: '/auth/user/profile/update/',
    AVATAR: '/auth/user/avatar/',
    PREFERENCES: '/auth/user/preferences/',
  },
  
  // Questions
  QUESTIONS: {
    LIST: '/questions/',
    CREATE: '/questions/',
    DETAIL: (id: string | number) => `/questions/${id}/`,
    UPDATE: (id: string | number) => `/questions/${id}/`,
    DELETE: (id: string | number) => `/questions/${id}/`,
    VOTE: (id: string | number) => `/questions/${id}/vote/`,
    ANSWERS: (id: string | number) => `/questions/${id}/answers/`,
  },
  
  // Answers
  ANSWERS: {
    LIST: '/answers/',
    CREATE: '/answers/',
    DETAIL: (id: string | number) => `/answers/${id}/`,
    UPDATE: (id: string | number) => `/answers/${id}/`,
    DELETE: (id: string | number) => `/answers/${id}/`,
    VOTE: (id: string | number) => `/answers/${id}/vote/`,
  },
  
  // Tags
  TAGS: {
    LIST: '/tags/',
    CREATE: '/tags/',
    DETAIL: (id: string | number) => `/tags/${id}/`,
    UPDATE: (id: string | number) => `/tags/${id}/`,
    DELETE: (id: string | number) => `/tags/${id}/`,
  },
  
  // Search
  SEARCH: {
    QUESTIONS: '/search/questions/',
    USERS: '/search/users/',
    TAGS: '/search/tags/',
  },
  
  // Admin
  ADMIN: {
    USERS: '/admin/users/',
    QUESTIONS: '/admin/questions/',
    ANSWERS: '/admin/answers/',
    REPORTS: '/admin/reports/',
    STATISTICS: '/admin/statistics/',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: Record<string, string[]> | null;
  status_code: number;
}

// Common Error Types
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]> | null;
  status_code: number;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
} 