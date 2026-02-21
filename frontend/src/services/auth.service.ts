// frontend/src/services/auth.service.ts
import { apiClient } from './api';
import type { 
  LoginCredentials, 
  TokenResponse, 
  VerifyTokenPayload, 
  RefreshTokenPayload,
  RefreshTokenResponse 
} from '@/types/auth';

export const AuthService = {
  /**
   * Obtain a pair of access and refresh tokens
   */
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/token/', credentials);
    return response.data;
  },

  /**
   * Refresh the access token
   */
  async refreshToken(payload: RefreshTokenPayload): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/token/refresh/', payload);
    return response.data;
  },

  /**
   * Verify if a token is still valid
   */
  async verifyToken(payload: VerifyTokenPayload): Promise<void> {
    await apiClient.post('/token/verify/', payload);
  }
};