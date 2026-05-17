import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentUser, selectIsAuthenticated, selectAuthLoading } from "@/lib/redux/slices/authSlice";

export const useUser = () => {
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  
  return {
    // Full user object
    user,
    
    // User basic info (shortcuts)
    id: user?.id,
    name: user?.name,
    email: user?.email,
    role: user?.role,
    isEmailVerified: user?.isEmailVerified,
    lastLogin: user?.lastLogin,
    
    // Auth status
    isAuthenticated,
    isLoading,
    
    // Helper boolean flags
    isAdmin: user?.role === 'admin',
    isRegularUser: user?.role === 'user',
    hasVerifiedEmail: user?.isEmailVerified === true,
  };
};