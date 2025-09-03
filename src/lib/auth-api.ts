import { api } from './api';

interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface MeResponse {
    message: string;
    data: {
        user: User;
        tokens?: { accessToken: string; refreshToken?: string };
    }
}

interface RegisterResponse {
    message: string;
    user: User;
    accessToken: string;
    refreshToken: string;
}

// Normalizer function
const normalizeAuthResponse = (data: any): AuthResponse => {
    // If wrapped under data
    if (data?.data) {
        const d = data.data;
        // /me shape
        if (d.user) {
            return {
                message: data.message ?? 'ok',
                user: d.user,
                accessToken: d.tokens?.accessToken || localStorage.getItem('accessToken') || '',
                refreshToken: d.tokens?.refreshToken || localStorage.getItem('refreshToken') || undefined,
            };
        }
        // login/refresh under data.tokens
        if (d.tokens?.accessToken) {
            return {
                message: data.message ?? 'ok',
                user: d.user ?? ({} as User),
                accessToken: d.tokens.accessToken,
                refreshToken: d.tokens.refreshToken,
            };
        }
    }

    // Flat shape (login/register legacy)
    if (data?.accessToken || data?.refreshToken || data?.user) {
        return {
            message: data.message ?? 'ok',
            user: data.user,
            accessToken: data.accessToken || localStorage.getItem('accessToken') || '',
            refreshToken: data.refreshToken,
        };
    }

    return data as AuthResponse;
};

export const login = async (identifier: string, password: string): Promise<AuthResponse> => {
  // Try to determine if identifier is email or username
  const isEmail = identifier.includes('@');
  const body = isEmail 
    ? { email: identifier, password }
    : { username: identifier, password };
  
  console.log('Login request body:', body);
  try {
    const responseData = await api.post<AuthResponse>('/api/auth/login', body);
    return normalizeAuthResponse(responseData);
  } catch (error: any) {
    console.error('Login API error details:', error);
    throw error;
  }
};

export const register = async (username: string, password: string, email: string): Promise<RegisterResponse> => {
  return await api.post<RegisterResponse>('/api/auth/register', { username, password, email });
};

export const getMe = async (): Promise<AuthResponse> => {
  const responseData = await api.get<MeResponse>('/api/auth/me');
  return normalizeAuthResponse(responseData);
};

export const refreshAccessToken = async (): Promise<AuthResponse> => {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  if (!refreshToken) {
    throw new Error('No refresh token');
  }
  const responseData = await api.post<any>('/api/auth/refresh', { refreshToken });
  return normalizeAuthResponse(responseData);
};

export const logout = async (): Promise<{ message: string }> => {
  try {
    return await api.post<{ message: string }>('/api/auth/logout', {});
  } catch (error) {
    // Logout should succeed even if the server call fails.
    console.log("Server logout failed, proceeding with client-side logout.");
    return { message: "Logged out locally." };
  }
};

