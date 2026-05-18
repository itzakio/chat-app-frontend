"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectRefreshToken,
  clearCredentials,
  setLoading,
} from "@/lib/redux/slices/authSlice";
import { useLogoutMutation } from "@/lib/redux/services/authApis";

export const useAuth = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const refreshToken = useAppSelector(selectRefreshToken);

  const [logoutMutation] = useLogoutMutation();

  const logout = useCallback(
    async (redirectPath: string = "/login") => {
      try {
        dispatch(setLoading(true));

        if (refreshToken) {
          await logoutMutation({ refreshToken }).unwrap();
        }

        dispatch(clearCredentials());
        router.push(redirectPath);
      } catch (error) {
        console.error("Logout failed:", error);
        dispatch(clearCredentials());
        router.push(redirectPath);
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, logoutMutation, refreshToken, router]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    userRole: user?.role,
    isEmailVerified: user?.isEmailVerified,
    logout,
  };
};