import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import useMobile from "@/hooks/use-mobile";
import { Sun, Map, Brain, Compass, Heart, Menu, X } from "lucide-react";

type LayoutProps = {
  children: React.ReactNode;
};

// Bottom tab navigation items for mobile
const mobileNavItems = [
  { href: "/today", label: "Today", icon: <Sun className="h-5 w-5" />, ariaLabel: "Go to Today Dashboard" },
  { href: "/my-journey/plan", label: "Journey", icon: <Map className="h-5 w-5" />, ariaLabel: "Go to My Journey" },
  { href: "/understand/explainer", label: "Understand", icon: <Brain className="h-5 w-5" />, ariaLabel: "Go to Understand section" },
  { href: "/explore/search", label: "Explore", icon: <Compass className="h-5 w-5" />, ariaLabel: "Go to Explore section" },
  { href: "/connect/mindfulness", label: "Connect", icon: <Heart className="h-5 w-5" />, ariaLabel: "Go to Connect & Hope section" },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();
  const [location] = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar on location change on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  // Handle escape key press to close sidebar
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [sidebarOpen]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, isMobile]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <div className={cn(
        "md:flex md:flex-shrink-0",
        isMobile ? (sidebarOpen ? "fixed inset-0 z-40 flex" : "hidden") : ""
      )}>
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 flex items-center border-b border-gray-100 bg-white shadow-sm">
          <button 
            type="button" 
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={toggleSidebar}
            aria-expanded={sidebarOpen}
            aria-controls="mobile-sidebar"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <span className="sr-only">{sidebarOpen ? "Close sidebar" : "Open sidebar"}</span>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex-1 flex justify-center items-center">
            <Link href="/today">
              <div className="flex items-center" tabIndex={0}>
                <div className="h-8 w-8 rounded-md bg-primary-600 flex items-center justify-center shadow-sm mr-2">
                  <Sun className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <span className="text-primary-800 font-bold text-xl">Sophera</span>
                <span className="ml-1 text-xs text-gray-500 font-normal">BETA</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Main content container with improved spacing */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-gray-50 pb-16 md:pb-0" id="main-content" tabIndex={-1}>
          <div className="mx-4 md:mx-6 lg:mx-8 py-4 md:py-6">
            {children}
          </div>
        </main>
        
        {/* Mobile bottom navigation */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-100 shadow-lg" aria-label="Mobile Navigation">
            <div className="flex justify-between items-center px-2">
              {mobileNavItems.map((item) => {
                const isActive = location === item.href || location.startsWith(item.href.substring(0, item.href.lastIndexOf('/')));
                return (
                  <Link key={item.href} href={item.href}>
                    <div 
                      className="flex flex-col items-center py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded-md" 
                      tabIndex={0}
                      role="link"
                      aria-label={item.ariaLabel}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div 
                        className={cn(
                          "p-1.5 rounded-full transition-colors duration-200", 
                          isActive 
                            ? "text-primary-600 bg-primary-50" 
                            : "text-gray-500"
                        )}
                      >
                        {item.icon}
                      </div>
                      <span 
                        className={cn(
                          "text-xs font-medium mt-1 transition-colors duration-200",
                          isActive 
                            ? "text-primary-700" 
                            : "text-gray-500"
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>

      {/* Mobile sidebar backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 transition-opacity duration-300"
          onClick={toggleSidebar}
          aria-hidden="true"
          role="presentation"
        />
      )}

      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:py-2 focus:px-4 focus:text-white focus:bg-primary-700 focus:outline-none"
      >
        Skip to main content
      </a>
    </div>
  );
}
