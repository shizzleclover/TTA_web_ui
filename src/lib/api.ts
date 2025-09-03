const API_URL = process.env.NEXT_PUBLIC_API_URL;

let accessToken: string | null = null;
// Initialize token from storage on module load (client-side)
if (typeof window !== 'undefined') {
  try {
    accessToken = localStorage.getItem('accessToken');
  } catch {
    accessToken = null;
  }
}
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
    console.log('API request with token:', { endpoint, hasToken: !!accessToken, tokenLength: accessToken.length });
  } else {
    console.log('API request without token:', { endpoint });
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Don't try to refresh token for auth endpoints (login, register, refresh)
  const isAuthEndpoint = endpoint.includes('/auth/');
  
  if (response.status === 401 && !isRetry && !isAuthEndpoint) {
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
      // If refresh fails, clear tokens and let caller handle UI navigation
      clearTokens();
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) {
    let errorMessage = 'An API error occurred';
    let errorData: any = null;
    
    try {
      const responseText = await response.text();
      console.log('Raw error response:', responseText);
      
      if (responseText.trim()) {
        errorData = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError);
    }
    
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      url: `${API_URL}${endpoint}`,
      error: errorData || 'Empty or invalid response',
      hasErrorData: !!errorData
    });
    
    if (errorData) {
      errorMessage = errorData.error?.message || errorData.message || errorMessage;
    } else {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
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
