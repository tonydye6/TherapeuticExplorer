import React, { useEffect } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  console.log("ProtectedRoute rendering");
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    console.log("ProtectedRoute state:", { isAuthenticated, isLoading, user });
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    console.log("ProtectedRoute: Loading authentication status...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Verifying authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to /auth");
    return <Redirect to="/auth" />;
  }

  console.log("ProtectedRoute: Authentication verified, rendering children");
  return <>{children}</>;
};