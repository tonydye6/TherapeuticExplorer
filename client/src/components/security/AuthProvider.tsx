
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AuthContextType {
  user: any;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: any) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // For development, initialize with a demo user
        const demoUser = {
          id: 1,
          username: "demo_user",
          displayName: "Demo User",
        };
        
        setUser(demoUser);
        // Store a demo token
        const demoToken = 'demo_token';
        localStorage.setItem('auth_token', demoToken);
        setToken(demoToken);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest<{ user: any, token: string }>('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem('auth_token', response.token);
      setToken(response.token);
      setUser(response.user);

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${response.user.displayName || username}!`,
      });
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid username or password',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, displayName?: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest<{ user: any, token: string }>('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, displayName }),
      });

      localStorage.setItem('auth_token', response.token);
      setToken(response.token);
      setUser(response.user);

      toast({
        title: 'Registration Successful',
        description: 'Your account has been created',
      });
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Registration failed',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    toast({
      title: 'Logged Out',
      description: 'You have been logged out',
    });
  };

  const updateProfile = async (userData: any) => {
    if (!token) {
      toast({
        title: 'Not Authenticated',
        description: 'Please log in to update your profile',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await apiRequest<any>('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      setUser(response);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) {
      toast({
        title: 'Not Authenticated',
        description: 'Please log in to change your password',
        variant: 'destructive',
      });
      return;
    }

    try {
      await apiRequest('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      toast({
        title: 'Password Changed',
        description: 'Your password has been changed successfully',
      });
    } catch (error) {
      toast({
        title: 'Password Change Failed',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to change password. Ensure your current password is correct.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
