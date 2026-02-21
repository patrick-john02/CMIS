// frontend/src/types/auth.ts

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password?: string;
}

export interface VerifyTokenPayload {
  token: string;
}

export interface RefreshTokenPayload {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
  refresh?: string; // Depending on simplejwt config, refresh token might rotate
}