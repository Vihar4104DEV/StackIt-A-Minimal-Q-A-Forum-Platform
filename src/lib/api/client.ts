import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, HTTP_STATUS, ApiResponse, ApiError } from './config';

// Extend AxiosRequestConfig to include custom properties
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  metadata?: { startTime: Date };
  _retry?: boolean;
}

// Create axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - Add auth token and common headers
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add auth token if available
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request timestamp for debugging
      (config as any).metadata = { startTime: new Date() };

      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });

      return config;
    },
    (error) => {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle common responses and errors
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const endTime = new Date();
      const startTime = (response.config as any).metadata?.startTime;
      const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        duration: `${duration}ms`,
        data: response.data,
      });

      return response;
    },
    async (error: AxiosError<ApiError>) => {
      const endTime = new Date();
      const startTime = (error.config as any)?.metadata?.startTime;
      const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        duration: `${duration}ms`,
        error: error.response?.data,
      });

      // Handle token refresh
      if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken && error.config && !(error.config as any)._retry) {
          (error.config as any)._retry = true;
          
          try {
            const refreshResponse = await axios.post(
              `${API_CONFIG.BASE_URL}/auth/token/refresh/`,
              { refresh: refreshToken }
            );
            
            const newAccessToken = refreshResponse.data.access;
            localStorage.setItem('access_token', newAccessToken);
            
            // Retry original request with new token
            if (error.config.headers) {
              error.config.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            
            return client(error.config);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Create the main API client instance
export const apiClient = createApiClient();

// Common API request handler with retry logic
export const apiRequest = async <T = any>(
  config: CustomAxiosRequestConfig,
  retryCount = 0
): Promise<T> => {
  try {
    console.log('Making API request:', config.method, config.url);
    console.log('Request config:', {
      baseURL: config.baseURL || API_CONFIG.BASE_URL,
      data: config.data,
      params: config.params
    });
    
    const response = await apiClient(config);
    console.log('Raw API response:', response);
    console.log('Response data:', response.data);
    
    // Handle both wrapped and unwrapped response structures
    // If the response has a 'data' property and follows our ApiResponse structure
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      console.log('Detected wrapped response structure');
      return response.data as T;
    }
    
    // If the response is the data directly (unwrapped)
    console.log('Detected unwrapped response structure');
    return response.data as T;
  } catch (error) {
    console.error('API request failed:', error);
    const axiosError = error as AxiosError<ApiError>;
    
    // Log detailed error information
    if (axiosError.response) {
      console.error('Response error:', {
        status: axiosError.response.status,
        statusText: axiosError.response.statusText,
        data: axiosError.response.data,
        headers: axiosError.response.headers
      });
    } else if (axiosError.request) {
      console.error('Request error:', axiosError.request);
    } else {
      console.error('Error message:', axiosError.message);
    }
    
    // Retry logic for network errors
    if (
      retryCount < API_CONFIG.RETRY_ATTEMPTS &&
      (!axiosError.response || axiosError.response.status >= 500)
    ) {
      console.log(`🔄 Retrying request (${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS})`);
      
      await new Promise(resolve => 
        setTimeout(resolve, API_CONFIG.RETRY_DELAY * (retryCount + 1))
      );
      
      return apiRequest<T>(config, retryCount + 1);
    }

    // Handle different error types
    if (axiosError.response) {
      // Server responded with error status
      const errorData = axiosError.response.data;
      throw {
        success: false,
        message: errorData?.message || `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`,
        errors: errorData?.errors || null,
        status_code: axiosError.response.status,
      } as ApiError;
    } else if (axiosError.request) {
      // Network error
      throw {
        success: false,
        message: 'Network error. Please check your connection and try again.',
        errors: null,
        status_code: 0,
      } as ApiError;
    } else {
      // Other error
      throw {
        success: false,
        message: axiosError.message || 'An unexpected error occurred',
        errors: null,
        status_code: 0,
      } as ApiError;
    }
  }
};

// HTTP method helpers
export const api = {
  get: <T = any>(url: string, config?: CustomAxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),
  
  post: <T = any>(url: string, data?: any, config?: CustomAxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),
  
  put: <T = any>(url: string, data?: any, config?: CustomAxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),
  
  patch: <T = any>(url: string, data?: any, config?: CustomAxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),
  
  delete: <T = any>(url: string, config?: CustomAxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),
};

// Utility functions
export const isApiError = (error: any): error is ApiError => {
  return error && typeof error === 'object' && 'success' in error && error.success === false;
};

export const getErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    return error.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const getFieldErrors = (error: any): Record<string, string[]> => {
  if (isApiError(error) && error.errors) {
    return error.errors;
  }
  return {};
}; 