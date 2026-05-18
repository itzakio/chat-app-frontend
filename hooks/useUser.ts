"use client";

import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAccessToken,
  selectRefreshToken,
  setCredentials,
} from "@/lib/redux/slices/authSlice";
import { useGetCurrentUserQuery } from "@/lib/redux/services/authApis";

export const useUser = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const accessToken = useAppSelector(selectAccessToken);
  const refreshToken = useAppSelector(selectRefreshToken);

  // Fetch user from API if authenticated but no user in Redux
  const { data: fetchedUser, isLoading: isFetchingUser } =
    useGetCurrentUserQuery(undefined, {
      skip: !isAuthenticated || !!user,
    });

  // Update Redux when user is fetched
  if (fetchedUser && accessToken && refreshToken && !user) {
    queueMicrotask(() => {
      dispatch(
        setCredentials({
          user: fetchedUser,
          accessToken,
          refreshToken,
        }),
      );
    });
  }

  const currentUser = fetchedUser || user;

  return {
    user: currentUser,
    id: currentUser?.id,
    name: currentUser?.name,
    email: currentUser?.email,
    role: currentUser?.role,
    isEmailVerified: currentUser?.isEmailVerified,
    isAuthenticated,
    isLoading: isFetchingUser,
    isAdmin: currentUser?.role === "admin",
  };
};
