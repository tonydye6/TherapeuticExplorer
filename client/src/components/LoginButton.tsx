import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function LoginButton() {
  const { isAuthenticated, user } = useAuth();

  return isAuthenticated ? (
    <div className="flex items-center gap-2">
      <span className="text-sm hidden sm:block">
        {user?.displayName || user?.username}
      </span>
      <Button variant="outline" size="sm" onClick={() => window.location.href = "/api/logout"}>
        Logout
      </Button>
    </div>
  ) : (
    <Button 
      onClick={() => window.location.href = "/api/login"} 
      variant="default" 
      size="sm"
      className="flex items-center gap-2"
    >
      <User size={16} />
      <span>Log in with Replit</span>
    </Button>
  );
}