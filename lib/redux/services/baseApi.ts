import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { clearCredentials, updateAccessToken } from '../slices/authSlice';

// Base URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/';

// Base query without token
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Refresh token mutation interface
interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  refreshToken?: string;
}

// Custom base query with refresh token logic
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // If got 401 error, try to refresh token
  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken;
    
    // Try to refresh the token
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh-token',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );
      
      const refreshData = refreshResult.data as RefreshTokenResponse;
      
      if (refreshData?.success && refreshData?.accessToken) {
        // Store the new access token
        api.dispatch(updateAccessToken(refreshData.accessToken));
        
        // Retry the original request with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed - logout user
        api.dispatch(clearCredentials());
        
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/register') {
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
      }
    } else {
      // No refresh token available - logout
      api.dispatch(clearCredentials());
      
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }
  }
  
  return result;
};

// Create base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Auth', 'Posts', 'Messages', 'Conversations'],
  endpoints: () => ({}),
  keepUnusedDataFor: 60,
  refetchOnMountOrArgChange: true,
  refetchOnFocus: true,
  refetchOnReconnect: true,
});

export default baseApi;