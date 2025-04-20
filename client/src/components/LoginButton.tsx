import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { User } from "lucide-react";

export default function LoginButton() {
  const { user } = useAuth();

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
        {user?.displayName || user?.username || 'Guest User'}
      </span>
    </div>
  );
}