// app/login/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Mail, Lock, LogIn, Eye, EyeOff, MessageCircle } from "lucide-react";
import { useLoginMutation } from "@/lib/redux/services/authApis";
import { setCredentials, setLoading, setError, selectIsAuthenticated, selectAuthLoading } from "@/lib/redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";

interface LoginFormData {
  email: string;
  password: string;
}

interface ApiError {
  data?: {
    message?: string;
    errors?: {
      email?: string[];
      password?: string[];
    };
  };
  status?: number;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  
  // Get auth state from Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const reduxLoading = useSelector(selectAuthLoading);
  
  const [loginMutation] = useLoginMutation();
  
  const [localLoading, setLocalLoading] = useState(false);
  const isLoading = localLoading || reduxLoading;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    clearErrors,
  } = useForm<LoginFormData>();

  // Get redirect URL from query params (default to /chat)
  const redirectUrl = searchParams.get("redirect") || "/chat";

  // Check if user is already logged in via Redux
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, router, redirectUrl]);

  const onSubmit = async (data: LoginFormData) => {
    setLocalLoading(true);
    dispatch(setLoading(true));
    clearErrors("root");
    setFormError("root", { message: "" });

    try {
      const result = await loginMutation(data).unwrap();
      
      // Extract user data and tokens from API response
      const { user, accessToken, refreshToken } = result;
      
      // Update Redux store (this will automatically set cookies and localStorage via your auth slice)
      dispatch(setCredentials({
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      }));
      
      console.log("Login successful:", result);
      
      // Redirect to the intended page
      router.push(redirectUrl);
      
    } catch (error: unknown) {
      console.error("Login failed:", error);
      
      // Handle different error scenarios
      let errorMessage = "Login failed. Please check your credentials and try again.";
      const apiError = error as ApiError;
      
      if (apiError?.data?.message) {
        errorMessage = apiError.data.message;
      } else if (apiError?.status === 401) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (apiError?.status === 404) {
        errorMessage = "User not found. Please check your email.";
      } else if (apiError?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (apiError?.data?.errors) {
        // Handle validation errors
        const validationErrors = apiError.data.errors;
        if (validationErrors.email) {
          setFormError("email", { message: validationErrors.email[0] });
        }
        if (validationErrors.password) {
          setFormError("password", { message: validationErrors.password[0] });
        }
        errorMessage = "Please check your input.";
      }
      
      dispatch(setError(errorMessage));
      setFormError("root", { message: errorMessage });
      
      setLocalLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300">
      {/* Optional: Show redirect info for debugging */}
      {redirectUrl !== "/chat" && (
        <div className="mb-4 text-xs text-primary/60 bg-primary/5 px-3 py-1 rounded-full">
          You&apos;ll be redirected to: {redirectUrl}
        </div>
      )}

      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 shadow-lg">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2 font-ubuntu">
          Welcome Back
        </h1>
        <p className="text-foreground/60 font-ubuntu">
          Sign in to continue chatting
        </p>
      </div>

      {/* Root Error Message */}
      {errors.root && errors.root.message && (
        <div className="w-full max-w-sm mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm text-center">
          {errors.root.message}
        </div>
      )}

      {/* Login Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4"
      >
        {/* Email Field */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-foreground/40" />
            </div>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className={`w-full pl-10 pr-4 py-3 bg-muted border rounded-xl text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-ubuntu ${
                errors.email ? "border-red-500" : "border-border"
              }`}
              placeholder="Email address"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 font-ubuntu">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field with Toggle */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-foreground/40" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 3,
                  message: "Password must be at least 3 characters",
                },
              })}
              className={`w-full pl-10 pr-12 py-3 bg-muted border rounded-xl text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-ubuntu ${
                errors.password ? "border-red-500" : "border-border"
              }`}
              placeholder="Password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-foreground/40 hover:text-foreground/60 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-foreground/40 hover:text-foreground/60 transition-colors" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500 font-ubuntu">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <a
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary/80 transition-colors font-ubuntu"
          >
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Sign Up Link with redirect preservation */}
      <p className="text-center mt-6 text-foreground/60 font-ubuntu">
        Don&apos;t have an account?{" "}
        <a
          href={`/register${redirectUrl !== "/chat" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
          className="text-primary hover:text-primary/80 font-semibold transition-colors"
        >
          Sign up
        </a>
      </p>
    </div>
  );
}