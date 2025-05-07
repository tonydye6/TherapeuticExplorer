import React from 'react';
import { cn } from '@/lib/utils';
import useMobile from '@/hooks/use-mobile';
import { SidebarNavigation } from '@/components/layouts/sidebar-navigation';

type NeoBrutalismLayoutProps = {
  children: React.ReactNode;
};

export default function NeoBrutalismLayout({ children }: NeoBrutalismLayoutProps) {
  const isMobile = useMobile();

  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Decorative elements */}
      <div className="fixed top-10 right-10 w-20 h-20 bg-yellow-300 rounded-full opacity-50 z-0 hidden sm:block"></div>
      <div className="fixed bottom-20 left-40 w-32 h-32 bg-teal-200 rounded-full opacity-40 z-0 hidden sm:block"></div>
      <div className="fixed top-1/3 right-1/4 w-16 h-16 bg-pink-200 rounded-full opacity-30 z-0 hidden sm:block"></div>
      
      {/* Sidebar Navigation using Button (1).tsx style */}
      <SidebarNavigation />
      
      {/* Main content */}
      <main 
        className={cn(
          "flex-1 p-4 md:p-6 z-10 transition-all duration-300 ml-0 md:ml-64",
        )}
      >
        {/* Add some spacing at the top on mobile for the menu button */}
        {isMobile && <div className="h-12"></div>}
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}