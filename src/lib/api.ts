const API_URL = process.env.NEXT_PUBLIC_API_URL;

let accessToken: string | null = null;
let refreshingTokenPromise: Promise<string> | null = null;

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

const setTokens = (newAccessToken: string, newRefreshToken?: string) => {
  accessToken = newAccessToken;
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', newAccessToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
  }
};

const clearTokens = () => {
  accessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

const refreshToken = async (): Promise<string> => {
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: currentRefreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  const newAccessToken = data.data.tokens.accessToken;
  
  setTokens(newAccessToken);
  return newAccessToken;
};

const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> => {
  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !isRetry) {
    try {
      if (!refreshingTokenPromise) {
        refreshingTokenPromise = refreshToken();
      }
      const newAccessToken = await refreshingTokenPromise;
      refreshingTokenPromise = null;
      
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      
      return await request<T>(endpoint, { ...options, headers }, true);
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, redirect to login by clearing state
      clearTokens();
      if (typeof window !== 'undefined') {
         window.location.href = '/login';
      }
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'An API error occurred');
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }
  
  return response.json() as Promise<T>;
};

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
  setToken: (token: string | null) => {
    accessToken = token;
  },
};
