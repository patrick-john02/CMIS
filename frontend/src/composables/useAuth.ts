// frontend/src/composables/useAuth.ts
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '@/services/auth.service';
import type { LoginCredentials } from '@/types/auth';
import { apiClient } from '@/services/api';

const accessToken = ref<string | null>(localStorage.getItem('access_token'));
const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'));

export function useAuth() {
  const router = useRouter();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value);

  // Helper to set tokens securely and apply to Axios
  const setTokens = (access: string, refresh: string) => {
    accessToken.value = access;
    refreshToken.value = refresh;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Attach token to future requests
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
  };

  const clearTokens = () => {
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true;
    error.value = null;
    try {
      const tokens = await AuthService.login(credentials);
      setTokens(tokens.access, tokens.refresh);
      router.push({ name: 'Dashboard' }); // Navigate on success
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
      // Apply token to axios if valid
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken.value}`;
      return true;
    } catch (err) {
      // If access token is invalid, attempt to refresh
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
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    verifySession
  };
}