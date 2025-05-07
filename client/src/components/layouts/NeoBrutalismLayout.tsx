import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  Route, 
  ClipboardList, 
  Search, 
  Users, 
  Settings, 
  HelpCircle,
  Sparkles,
  Heart,
  BookOpen,
  Menu,
  X
} from 'lucide-react';
import { NeoMenu, NeoNavigationSection, NeoNavigationItem } from '@/components/ui/neo-navigation';
import { cn } from '@/lib/utils';
import useMobile from '@/hooks/use-mobile';

type NeoBrutalismLayoutProps = {
  children: React.ReactNode;
};

export default function NeoBrutalismLayout({ children }: NeoBrutalismLayoutProps) {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Update sidebarOpen state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  
  // Close sidebar on location change on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Decorative elements */}
      <div className="fixed top-10 right-10 w-20 h-20 bg-yellow-300 rounded-full opacity-50 z-0 hidden sm:block"></div>
      <div className="fixed bottom-20 left-40 w-32 h-32 bg-teal-200 rounded-full opacity-40 z-0 hidden sm:block"></div>
      <div className="fixed top-1/3 right-1/4 w-16 h-16 bg-pink-200 rounded-full opacity-30 z-0 hidden sm:block"></div>
      
      {/* Neo Brutalism Toggle Switch for Mobile */}
      {isMobile && (
        <div 
          className="fixed top-3 left-3 z-50 flex items-center gap-2 bg-white px-3 py-2 rounded-lg border-3 border-sophera-text-heading shadow-[0.3rem_0.3rem_0_#000000] transition-all"
        >
          <span className="text-sm font-semibold text-sophera-text-heading">{sidebarOpen ? "Hide Menu" : "Show Menu"}</span>
          <label className="switch">
            <input
              type="checkbox"
              className="toggle"
              checked={sidebarOpen}
              onChange={toggleSidebar}
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            />
            <span className="slider"></span>
          </label>
        </div>
      )}
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)} 
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed md:relative w-[280px] md:w-64 p-6 border-r-4 border-black min-h-screen z-30 bg-white transition-all duration-300",
          isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Add extra padding at the top on mobile for the menu toggle */}
        {isMobile && <div className="h-14"></div>}
        
        <div className="mb-8">
          <Link href="/today" onClick={() => isMobile && setSidebarOpen(false)}>
            <div className="flex items-center cursor-pointer">
              <div className="h-10 w-10 rounded-xl bg-sophera-brand-primary flex items-center justify-center border-3 border-black shadow-[0.2rem_0.2rem_0_#000000]">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-bold">Sophera</h1>
            </div>
          </Link>
          <div className="mt-2 text-sm text-sophera-text-subtle font-medium">
            Win the day!
          </div>
        </div>
        
        <NeoMenu className="overflow-y-auto max-h-[calc(100vh-160px)]">
          <NeoNavigationSection>
            <NeoNavigationItem 
              href="/today" 
              icon={<Home />} 
              active={location === '/today'}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Dashboard
            </NeoNavigationItem>
          </NeoNavigationSection>
          
          <NeoNavigationSection title="My Journey" icon={<Route />}>
            <NeoNavigationItem 
              href="/my-journey/plan" 
              active={location.startsWith('/my-journey/plan')}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              My Plan
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/my-journey/journal" 
              active={location.startsWith('/my-journey/journal')}
              badge={3}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Journal
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/my-journey/diet" 
              active={location.startsWith('/my-journey/diet')}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Diet Tracker
            </NeoNavigationItem>
          </NeoNavigationSection>
          
          <NeoNavigationSection title="Understand" icon={<BookOpen />}>
            <NeoNavigationItem 
              href="/understand/explainer" 
              active={location.startsWith('/understand/explainer')}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Explainer
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/understand/treatments" 
              active={location.startsWith('/understand/treatments')}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Treatments
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/understand/interactions" 
              active={location.startsWith('/understand/interactions')}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Interactions
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/understand/documents" 
              active={location.startsWith('/understand/documents')}
              badge={2}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Documents
            </NeoNavigationItem>
          </NeoNavigationSection>
          
          <NeoNavigationSection title="Explore" icon={<Search />}>
            <NeoNavigationItem 
              href="/explore/search" 
              active={location.startsWith('/explore/search')}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Research
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/explore/trials" 
              active={location.startsWith('/explore/trials')}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Clinical Trials
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/explore/creative" 
              active={location.startsWith('/explore/creative')}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Creative
            </NeoNavigationItem>
          </NeoNavigationSection>
          
          <NeoNavigationSection title="Connect & Hope" icon={<Heart />}>
            <NeoNavigationItem 
              href="/connect/stories" 
              active={location.startsWith('/connect/stories')}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Stories
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/connect/mindfulness" 
              active={location.startsWith('/connect/mindfulness')}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Mindfulness
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/connect/resources" 
              active={location.startsWith('/connect/resources')}
              badge="New"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Resources
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/connect/caregivers" 
              active={location.startsWith('/connect/caregivers')}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Caregivers
            </NeoNavigationItem>
          </NeoNavigationSection>
          
          <NeoNavigationSection title="Settings" icon={<Settings />}>
            <NeoNavigationItem 
              href="/settings/profile" 
              active={location.startsWith('/settings/profile')}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Profile
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/help" 
              active={location === '/help'}
              icon={<HelpCircle />}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Help
            </NeoNavigationItem>
          </NeoNavigationSection>
          
          <NeoNavigationSection title="Design System">
            <NeoNavigationItem 
              href="/design/neo-brutalism" 
              active={location.startsWith('/design/neo-brutalism')}
              icon={<Sparkles />}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              Neo Brutalism
            </NeoNavigationItem>
          </NeoNavigationSection>
        </NeoMenu>
      </aside>
      
      {/* Main content */}
      <main 
        className={cn(
          "flex-1 p-4 md:p-6 z-10 transition-all duration-300",
          isMobile ? "ml-0" : ""
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