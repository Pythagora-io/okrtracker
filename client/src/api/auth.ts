import api from './api';

// Description: Login user functionality
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { accessToken: string, refreshToken: string }
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error instanceof Error ? (error.response?.data?.message || error.message) : 'Unknown error');
  }
};

// Description: Register user functionality
// Endpoint: POST /api/auth/register
// Request: { email: string, password: string }
// Response: { email: string }
export const register = async (email: string, password: string) => {
  try {
    const response = await api.post('/api/auth/register', {email, password});
    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? (error.response?.data?.message || error.message) : 'Unknown error');
  }
};

// Description: Logout
// Endpoint: POST /api/auth/logout
// Request: {}
// Response: { success: boolean, message: string }
export const logout = async () => {
  try {
    return await api.post('/api/auth/logout');
  } catch (error) {
    throw new Error(error instanceof Error ? (error.response?.data?.message || error.message) : 'Unknown error');
  }
};

// Description: Verify invite token
// Endpoint: GET /api/auth/invite/:token
// Request: {}
// Response: { valid: boolean, email?: string, role?: string }
export const verifyInviteToken = async (token: string) => {
  try {
    const response = await api.get(`/api/auth/invite/${token}`);
    return response.data;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? (error.response?.data?.error || error.message) : 'Unknown error');
  }
};

// Description: Complete invite signup
// Endpoint: POST /api/auth/signup-invite
// Request: { token: string, password: string, name?: string }
// Response: { user: User, accessToken: string, refreshToken: string }
export const signupWithInvite = async (token: string, password: string, name?: string) => {
  try {
    const response = await api.post("/api/auth/signup-invite", { token, password, name });
    const { accessToken, refreshToken, _id, email, role } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userId", _id);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", role);

    return response.data;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? (error.response?.data?.error || error.message) : 'Unknown error');
  }
};
