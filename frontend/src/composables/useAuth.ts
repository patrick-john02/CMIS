// src/composables/useAuth.ts
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '@/services/auth.service';
import type { LoginCredentials } from '@/types/auth';
import { apiClient } from '@/services/api';

// State defined outside the function makes it a global singleton across the app
const accessToken = ref<string | null>(localStorage.getItem('access_token'));
const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'));

// Initialize user from localStorage to persist session data on refresh
const user = ref(JSON.parse(localStorage.getItem('user_data') || 'null'));

export function useAuth() {
  const router = useRouter();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value);

  /**
   * Updates local state and browser storage with new tokens and user info
   */
  const setTokens = (access: string, refresh: string, userData?: any) => {
    accessToken.value = access;
    refreshToken.value = refresh;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    if (userData) {
      user.value = userData;
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
    
    // Attach token to future requests
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
  };

  /**
   * Wipes all session data
   */
  const clearTokens = () => {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  /**
   * Authenticates user and sets up the profile for the sidebar
   */
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true;
    error.value = null;
    try {
      const tokens = await AuthService.login(credentials);
      
      // Note: If your backend doesn't return user details in the token response, 
      // you would typically call a '/me/' or '/profile/' endpoint here.
      // For now, we simulate the profile data using the login credentials.
      const userProfile = {
        name: credentials.username.charAt(0).toUpperCase() + credentials.username.slice(1),
        email: `${credentials.username}@csu.edu.ph`,
        avatar: "/csulogo.png", // Default logo as avatar
      };

      setTokens(tokens.access, tokens.refresh, userProfile);
      router.push({ name: 'Dashboard' }); 
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to authenticate. Please check your credentials.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    clearTokens();
    router.push({ name: 'Login' });
  };

  const verifySession = async () => {
    if (!accessToken.value) return false;
    try {
      await AuthService.verifyToken({ token: accessToken.value });
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken.value}`;
      return true;
    } catch (err) {
      return await attemptRefresh();
    }
  };

  const attemptRefresh = async () => {
    if (!refreshToken.value) {
      clearTokens();
      return false;
    }
    try {
      const response = await AuthService.refreshToken({ refresh: refreshToken.value });
      setTokens(response.access, response.refresh || refreshToken.value);
      return true;
    } catch (err) {
      clearTokens();
      return false;
    }
  };

  return {
    user, // The sidebar now reacts to this value
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    verifySession
  };
}