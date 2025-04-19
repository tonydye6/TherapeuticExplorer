import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/security/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { login, register, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to home if already authenticated
  if (isAuthenticated && !isLoading) {
    setLocation('/');
    return null;
  }

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.username || !loginForm.password) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter both username and password',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await login(loginForm.username, loginForm.password);
      // Redirect happens automatically when isAuthenticated changes
    } catch (error) {
      // Error is handled in the auth provider
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerForm.username || !registerForm.password || !registerForm.confirmPassword) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    if (registerForm.password.length < 8) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await register(
        registerForm.username, 
        registerForm.password, 
        registerForm.displayName || undefined
      );
      // Redirect happens automatically when isAuthenticated changes
    } catch (error) {
      // Error is handled in the auth provider
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <div className="grid w-full gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        {/* Auth Form */}
        <div>
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">THRIVE</h1>
              <p className="text-sm text-muted-foreground">
                Medical Research Platform for Esophageal Cancer
              </p>
            </div>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                      Enter your username and password to access your account
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleLoginSubmit}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          name="username"
                          placeholder="johndoe"
                          required
                          value={loginForm.username}
                          onChange={handleLoginChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          required
                          value={loginForm.password}
                          onChange={handleLoginChange}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                      Enter your information to create a new account
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleRegisterSubmit}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-username">Username</Label>
                        <Input
                          id="reg-username"
                          name="username"
                          placeholder="johndoe"
                          required
                          value={registerForm.username}
                          onChange={handleRegisterChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          name="displayName"
                          placeholder="John Doe"
                          value={registerForm.displayName}
                          onChange={handleRegisterChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password</Label>
                        <Input
                          id="reg-password"
                          name="password"
                          type="password"
                          required
                          value={registerForm.password}
                          onChange={handleRegisterChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          required
                          value={registerForm.confirmPassword}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Hero Section */}
        <div className="hidden lg:block">
          <div className="flex flex-col justify-center space-y-6 p-8 h-full bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-lg border">
            <h2 className="text-3xl font-bold">Enhanced Security for Your Medical Data</h2>
            <p className="text-muted-foreground">
              THRIVE employs industry-leading security practices to ensure your personal 
              health information remains protected:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>HIPAA-compliant data storage and transfer</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>End-to-end encryption for sensitive information</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Strict access controls and permission management</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Comprehensive security audit logging</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Advanced brute force attack prevention</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Regular security updates and vulnerability assessment</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Your medical data needs the highest level of protection. THRIVE was designed
              from the ground up with security as a foundational principle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;