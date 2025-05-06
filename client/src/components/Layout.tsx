import { useState } from "react";
import { useLocation, Link } from "wouter";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import useMobile from "@/hooks/use-mobile";
import { Sun, Map, Brain, Compass, Heart, Menu } from "lucide-react";

type LayoutProps = {
  children: React.ReactNode;
};

// Bottom tab navigation items for mobile
const mobileNavItems = [
  { href: "/today", label: "Today", icon: <Sun className="h-5 w-5" /> },
  { href: "/my-journey/plan", label: "Journey", icon: <Map className="h-5 w-5" /> },
  { href: "/understand/explainer", label: "Understand", icon: <Brain className="h-5 w-5" /> },
  { href: "/explore/search", label: "Explore", icon: <Compass className="h-5 w-5" /> },
  { href: "/connect/mindfulness", label: "Connect", icon: <Heart className="h-5 w-5" /> },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();
  const [location] = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 flex items-center border-b border-gray-100 bg-white shadow-sm">
          <button 
            type="button" 
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 flex justify-center items-center">
            <div className="h-8 w-8 rounded-md bg-primary-600 flex items-center justify-center shadow-sm mr-2">
              <Sun className="h-5 w-5 text-white" />
            </div>
            <span className="text-primary-800 font-bold text-xl">Sophera</span>
            <span className="ml-1 text-xs text-gray-500 font-normal">BETA</span>
          </div>
        </div>

        {/* Main content container with improved spacing */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-gray-50 pb-16 md:pb-0">
          <div className="mx-4 md:mx-6 lg:mx-8 py-4 md:py-6">
            {children}
          </div>
        </main>
        
        {/* Mobile bottom navigation */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-100 shadow-lg">
            <div className="flex justify-between items-center px-2">
              {mobileNavItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="flex flex-col items-center py-2 px-3">
                    <div 
                      className={cn(
                        "p-1.5 rounded-full", 
                        location === item.href || location.startsWith(item.href.substring(0, item.href.lastIndexOf('/'))) 
                          ? "text-primary-600 bg-primary-50" 
                          : "text-gray-500"
                      )}
                    >
                      {item.icon}
                    </div>
                    <span 
                      className={cn(
                        "text-xs font-medium mt-1",
                        location === item.href || location.startsWith(item.href.substring(0, item.href.lastIndexOf('/'))) 
                          ? "text-primary-700" 
                          : "text-gray-500"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              ))}

            </div>
          </div>
        )}
      </div>

      {/* Mobile sidebar backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
