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
    if (data.data?.user) { // /me response
        return {
            ...data,
            user: data.data.user,
            accessToken: localStorage.getItem('accessToken') || '', // Assuming token is already set
        };
    }
    if (data.data?.tokens) { // /refresh response
        return {
            ...data,
            user: {} as User, // User data not present in refresh response
            accessToken: data.data.tokens.accessToken,
        }
    }
    return data;
};

export const login = async (identifier: string, password: string): Promise<AuthResponse> => {
  const responseData = await api.post<AuthResponse>('/api/auth/login', { username: identifier, password });
  return normalizeAuthResponse(responseData);
};

export const register = async (username: string, password: string, email: string): Promise<RegisterResponse> => {
  return await api.post<RegisterResponse>('/api/auth/register', { username, password, email });
};

export const getMe = async (): Promise<AuthResponse> => {
  const responseData = await api.get<MeResponse>('/api/auth/me');
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
