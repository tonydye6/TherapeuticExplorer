import React, { useEffect } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// This is a temporary version that always renders children to bypass the auth system
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  console.log("ProtectedRoute rendering - BYPASS MODE");
  
  // Simply render the children without any authentication checks
  return <>{children}</>;
};