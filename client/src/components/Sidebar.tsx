import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import useMobile from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import LoginButton from "./LoginButton";
import {
  User,
  Sun,
  SlidersHorizontal,
  Settings,
  HelpCircle,
  Calendar,
  FileText,
  Activity,
  Search,
  BookOpen,
  FlaskConical,
  Heart,
  Users,
  Lightbulb,
  Brain,
  Stethoscope,
  Compass,
  MessageSquare,
  Sparkles,
  BookOpen as JournalIcon,
  Utensils,
  HeartPulse,
  TrendingUp,
  FileQuestion,
  Palette,
  LogOut,
  Map
} from "lucide-react";


interface SidebarProps {
  closeSidebar?: () => void;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
  ariaLabel?: string;
}

export default function Sidebar({ closeSidebar }: SidebarProps) {
  const [location] = useLocation();
  const isMobile = useMobile();
  const { user, isAuthenticated } = useAuth();

  const navigationItems: NavigationItem[] = [
    // Today - Dashboard
    { 
      href: "/today", 
      label: "Today", 
      icon: <Sun className="h-5 w-5" />,
      section: "1. Today",
      ariaLabel: "Go to today's dashboard"
    },
    
    // My Journey section
    { 
      href: "/my-journey/plan", 
      label: "My Plan", 
      icon: <Calendar className="h-5 w-5" />,
      section: "2. My Journey",
      ariaLabel: "View and manage your treatment plan"
    },
    { 
      href: "/my-journey/journal", 
      label: "My Journal", 
      icon: <JournalIcon className="h-5 w-5" />,
      section: "2. My Journey",
      ariaLabel: "Access your personal journal"
    },
    { 
      href: "/my-journey/diet", 
      label: "Diet Log", 
      icon: <Utensils className="h-5 w-5" />,
      section: "2. My Journey",
      ariaLabel: "Track your nutrition and diet"
    },
    { 
      href: "/my-journey/metrics", 
      label: "My Metrics", 
      icon: <HeartPulse className="h-5 w-5" />,
      section: "2. My Journey",
      ariaLabel: "View your health metrics"
    },
    { 
      href: "/my-journey/trends", 
      label: "Trends", 
      icon: <TrendingUp className="h-5 w-5" />,
      section: "2. My Journey",
      ariaLabel: "Analyze trends in your health data"
    },
    
    // Understand section
    { 
      href: "/understand/explainer", 
      label: "AI Explainer", 
      icon: <Brain className="h-5 w-5" />,
      section: "3. Understand",
      ariaLabel: "Get AI explanations of medical terms"
    },
    { 
      href: "/understand/treatments", 
      label: "Treatment Guides", 
      icon: <Stethoscope className="h-5 w-5" />,
      section: "3. Understand",
      ariaLabel: "Learn about treatment options"
    },
    { 
      href: "/understand/interactions", 
      label: "Interaction Checker", 
      icon: <Activity className="h-5 w-5" />,
      section: "3. Understand",
      ariaLabel: "Check for potential medication interactions"
    },
    { 
      href: "/understand/documents", 
      label: "Document Summarizer", 
      icon: <FileText className="h-5 w-5" />,
      section: "3. Understand",
      ariaLabel: "Get summaries of your medical documents"
    },
    
    // Explore section
    { 
      href: "/explore/search", 
      label: "Guided Search", 
      icon: <Search className="h-5 w-5" />,
      section: "4. Explore",
      ariaLabel: "Search medical information with guidance"
    },
    { 
      href: "/explore/trials", 
      label: "Clinical Trial Finder", 
      icon: <FlaskConical className="h-5 w-5" />,
      section: "4. Explore",
      ariaLabel: "Find relevant clinical trials"
    },
    { 
      href: "/explore/creative", 
      label: "Creative Exploration", 
      icon: <Lightbulb className="h-5 w-5" />,
      section: "4. Explore",
      ariaLabel: "Explore treatment options creatively"
    },
    
    // Connect & Hope section
    { 
      href: "/connect/stories", 
      label: "Survivor Stories", 
      icon: <MessageSquare className="h-5 w-5" />,
      section: "5. Connect & Hope",
      ariaLabel: "Read inspiring survivor stories"
    },
    { 
      href: "/connect/mindfulness", 
      label: "Mindfulness Corner", 
      icon: <Sparkles className="h-5 w-5" />,
      section: "5. Connect & Hope",
      ariaLabel: "Access mindfulness resources"
    },
    { 
      href: "/connect/resources", 
      label: "Resource Hub", 
      icon: <BookOpen className="h-5 w-5" />,
      section: "5. Connect & Hope",
      ariaLabel: "Find helpful resources"
    },
    { 
      href: "/connect/caregivers", 
      label: "Caregiver Connect", 
      icon: <Users className="h-5 w-5" />,
      section: "5. Connect & Hope",
      ariaLabel: "Connect with caregivers"
    },
    
    // Settings section
    { 
      href: "/settings/profile", 
      label: "Profile Settings", 
      icon: <Settings className="h-5 w-5" />,
      section: "6. Settings & Profile",
      ariaLabel: "Manage your profile settings"
    },
    { 
      href: "/help", 
      label: "Help & Support", 
      icon: <HelpCircle className="h-5 w-5" />,
      section: "6. Settings & Profile",
      ariaLabel: "Get help and support"
    },
    { 
      href: "/design/neo-brutalism", 
      label: "Neo Brutalism Design", 
      icon: <Palette className="h-5 w-5" />,
      section: "6. Settings & Profile",
      ariaLabel: "View Neo Brutalism design system"
    },
  ];

  return (
    <div className="w-72 bg-white h-full border-r border-charcoal-100 flex-shrink-0 shadow-md" id="mobile-sidebar">
      {/* Logo & title */}
      <div className="px-6 py-6 border-b border-charcoal-100">
        <Link href="/today">
          <div className="flex items-center focus:outline-none focus:ring-2 focus:ring-sophera-500 focus:ring-offset-2 rounded-md p-1" tabIndex={0}>
            <div className="h-12 w-12 rounded-lg bg-sophera-500 flex items-center justify-center shadow-sm">
              <Sun className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h2 className="text-xl font-bold text-charcoal-700">Sophera</h2>
              <p className="text-xs text-charcoal-500 -mt-1">Your Healing Companion</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation - Organized by sections */}
      <nav className="mt-5 px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]" aria-label="Main Navigation">
        {/* Group items by section */}
        {Array.from(new Set(navigationItems.map(item => item.section))).map(section => (
          <div key={section} className="mb-8" role="group" aria-labelledby={`section-${section?.replace(/\s+|\./g, '-').toLowerCase()}`}>
            {/* Section header */}
            <h3 
              id={`section-${section?.replace(/\s+|\./g, '-').toLowerCase()}`} 
              className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider px-2 mb-3"
            >
              {section}
            </h3>
            
            {/* Section items */}
            <div className="space-y-2">
              {navigationItems
                .filter(item => item.section === section)
                .map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => {
                        // Close sidebar on mobile when a link is clicked
                        if (isMobile && closeSidebar) {
                          closeSidebar();
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "flex items-center px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sophera-500 focus:ring-offset-1",
                          isActive
                            ? "bg-sophera-50 text-sophera-500 shadow-sm border-l-4 border-sophera-500 font-bold"
                            : "text-charcoal-600 hover:bg-sophera-50/50 hover:text-charcoal-700"
                        )}
                        tabIndex={0}
                        role="link"
                        aria-label={item.ariaLabel || item.label}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span className={cn(
                          "mr-3 transition-colors", 
                          isActive 
                            ? "text-sophera-500" 
                            : "text-charcoal-400"
                        )} aria-hidden="true">
                          {item.icon}
                        </span>
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="absolute bottom-0 w-full p-4 border-t border-charcoal-100 bg-white">
        {isAuthenticated && user ? (
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-sophera-100 flex items-center justify-center shadow-sm" aria-hidden="true">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt={`${user.username}'s profile`} 
                    className="h-10 w-10 rounded-full object-cover" 
                  />
                ) : (
                  <User className="h-6 w-6 text-sophera-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-charcoal-700">
                  {user.displayName || user.username}
                </p>
                {user.email && (
                  <p className="text-xs text-charcoal-500">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
            <div className="flex space-x-2 justify-between">
              <Link href="/settings/profile" className="flex-1">
                <button 
                  className="w-full flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium text-charcoal-600 bg-white border border-charcoal-200 rounded-xl hover:bg-sophera-50 transition-colors focus:outline-none focus:ring-2 focus:ring-sophera-500 focus:ring-offset-1"
                  aria-label="Go to settings"
                >
                  <Settings className="h-3.5 w-3.5 text-charcoal-500" aria-hidden="true" />
                  <span>Settings</span>
                </button>
              </Link>
              <Link href="/logout" className="flex-1">
                <button 
                  className="w-full flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium text-charcoal-600 bg-white border border-charcoal-200 rounded-xl hover:bg-sophera-50 transition-colors focus:outline-none focus:ring-2 focus:ring-sophera-500 focus:ring-offset-1"
                  aria-label="Log out of your account"
                >
                  <LogOut className="h-3.5 w-3.5 text-charcoal-500" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </div>
  );
}