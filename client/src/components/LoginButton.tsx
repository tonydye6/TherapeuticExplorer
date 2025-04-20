
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { User, LogOut, Loader2 } from "lucide-react";

export default function LoginButton() {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    setIsLoading(true);
    window.location.href = "/api/logout";
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3 bg-secondary/50 p-2 rounded-lg">
        {user?.profileImageUrl && (
          <img 
            src={user.profileImageUrl} 
            alt="Profile" 
            className="w-6 h-6 rounded-full"
          />
        )}
        <span className="text-sm hidden sm:block font-medium">
          {user?.displayName || user?.username}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleLogin}
      variant="default" 
      size="sm"
      className="flex items-center gap-2"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <User size={16} />
      )}
      <span>Sign in with Replit</span>
    </Button>
  );
}
