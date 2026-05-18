import { baseApi } from "./baseApi";

// User type - authSlice এর সাথে match করে
export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
  message?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  refreshToken?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    register: builder.mutation<AuthResponse, RegisterData>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Auth"],
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
    logout: builder.mutation({
      query: (data: { refreshToken: string; }) => ({
        url: "/auth/logout",
        method: "POST",
        body: {
          refreshToken: data.refreshToken,
        },
      }),
    }),

    updateProfile: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: "/auth/profile",
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    changePassword: builder.mutation<
      void,
      { oldPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi;
