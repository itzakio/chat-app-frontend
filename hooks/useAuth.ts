import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentUser, selectIsAuthenticated, selectAuthLoading } from "@/lib/redux/slices/authSlice";

export const useAuth = () => {
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  
  return {
    user,
    isAuthenticated,
    isLoading,
    // Shortcuts
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    userRole: user?.role,
    isEmailVerified: user?.isEmailVerified,
  };
};