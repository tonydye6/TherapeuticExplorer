import React from 'react';
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
  BookOpen
} from 'lucide-react';
import { NeoMenu, NeoNavigationSection, NeoNavigationItem } from '@/components/ui/neo-navigation';
import { cn } from '@/lib/utils';

type NeoBrutalismLayoutProps = {
  children: React.ReactNode;
};

export default function NeoBrutalismLayout({ children }: NeoBrutalismLayoutProps) {
  const [location] = useLocation();
  
  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Decorative elements */}
      <div className="fixed top-10 right-10 w-20 h-20 bg-yellow-300 rounded-full opacity-50 z-0"></div>
      <div className="fixed bottom-20 left-40 w-32 h-32 bg-teal-200 rounded-full opacity-40 z-0"></div>
      <div className="fixed top-1/3 right-1/4 w-16 h-16 bg-pink-200 rounded-full opacity-30 z-0"></div>
      
      {/* Sidebar */}
      <aside className="w-64 p-6 border-r-4 border-black min-h-screen z-10">
        <div className="mb-8">
          <Link href="/today">
            <div className="flex items-center cursor-pointer">
              <div className="h-10 w-10 rounded-xl bg-sophera-brand-primary flex items-center justify-center border-3 border-black shadow-[0.2rem_0.2rem_0_#000000]">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-bold">Sophera</h1>
            </div>
          </Link>
          <div className="mt-2 text-sm text-sophera-text-subtle font-medium">
            Your personal healing companion
          </div>
        </div>
        
        <NeoMenu className="overflow-y-auto max-h-[calc(100vh-160px)]">
          <NeoNavigationSection>
            <NeoNavigationItem 
              href="/today" 
              icon={<Home />} 
              active={location === '/today'}
            >
              Dashboard
            </NeoNavigationItem>
          </NeoNavigationSection>
          
          <NeoNavigationSection title="My Journey" icon={<Route />}>
            <NeoNavigationItem 
              href="/my-journey/plan" 
              active={location.startsWith('/my-journey/plan')}
            >
              My Plan
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/my-journey/journal" 
              active={location.startsWith('/my-journey/journal')}
              badge={3}
            >
              Journal
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/my-journey/diet" 
              active={location.startsWith('/my-journey/diet')}
            >
              Diet Tracker
            </NeoNavigationItem>
          </NeoNavigationSection>
          
          <NeoNavigationSection title="Understand" icon={<BookOpen />}>
            <NeoNavigationItem 
              href="/understand/explainer" 
              active={location.startsWith('/understand/explainer')}
            >
              Explainer
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/understand/treatments" 
              active={location.startsWith('/understand/treatments')}
            >
              Treatments
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/understand/interactions" 
              active={location.startsWith('/understand/interactions')}
            >
              Interactions
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/understand/documents" 
              active={location.startsWith('/understand/documents')}
              badge={2}
            >
              Documents
            </NeoNavigationItem>
          </NeoNavigationSection>
          
          <NeoNavigationSection title="Explore" icon={<Search />}>
            <NeoNavigationItem 
              href="/explore/search" 
              active={location.startsWith('/explore/search')}
            >
              Research
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/explore/trials" 
              active={location.startsWith('/explore/trials')}
            >
              Clinical Trials
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/explore/creative" 
              active={location.startsWith('/explore/creative')}
            >
              Creative
            </NeoNavigationItem>
          </NeoNavigationSection>
          
          <NeoNavigationSection title="Connect & Hope" icon={<Heart />}>
            <NeoNavigationItem 
              href="/connect/stories" 
              active={location.startsWith('/connect/stories')}
            >
              Stories
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/connect/mindfulness" 
              active={location.startsWith('/connect/mindfulness')}
            >
              Mindfulness
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/connect/resources" 
              active={location.startsWith('/connect/resources')}
              badge="New"
            >
              Resources
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/connect/caregivers" 
              active={location.startsWith('/connect/caregivers')}
            >
              Caregivers
            </NeoNavigationItem>
          </NeoNavigationSection>
          
          <NeoNavigationSection title="Settings" icon={<Settings />}>
            <NeoNavigationItem 
              href="/settings/profile" 
              active={location.startsWith('/settings/profile')}
            >
              Profile
            </NeoNavigationItem>
            <NeoNavigationItem 
              href="/help" 
              active={location === '/help'}
              icon={<HelpCircle />}
            >
              Help
            </NeoNavigationItem>
          </NeoNavigationSection>
          
          <NeoNavigationSection title="Design System">
            <NeoNavigationItem 
              href="/design/neo-brutalism" 
              active={location.startsWith('/design/neo-brutalism')}
              icon={<Sparkles />}
            >
              Neo Brutalism
            </NeoNavigationItem>
          </NeoNavigationSection>
        </NeoMenu>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-6 z-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}