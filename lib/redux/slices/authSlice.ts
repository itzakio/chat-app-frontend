import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// Cookie helper functions
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  lastLogin?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initialize from localStorage
const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');
    
    return {
      user: user ? JSON.parse(user) : null,
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
      isAuthenticated: !!accessToken,
      isLoading: false,
      error: null,
    };
  }
  
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ 
      user: User; 
      accessToken: string; 
      refreshToken: string;
    }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
      
      if (typeof window !== 'undefined') {
        // localStorage এ set
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        
        // Cookie তেও set (middleware এর জন্য)
        setCookie('token', action.payload.accessToken, 7);
      }
    },
    
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', action.payload);
        // Cookie ও update করুন
        setCookie('token', action.payload, 7);
      }
    },
    
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Cookie delete করুন
        deleteCookie('token');
      }
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setCredentials, 
  updateAccessToken, 
  clearCredentials, 
  setLoading, 
  setError 
} = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;