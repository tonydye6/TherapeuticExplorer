import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import useMobile from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import LoginButton from "./LoginButton";
import {
  User,
  Home,
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
  FileQuestion
} from "lucide-react";

interface SidebarProps {
  closeSidebar?: () => void;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
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
      icon: <Home className="h-5 w-5" />,
      section: "1. Today"
    },
    
    // My Journey section
    { 
      href: "/my-journey/plan", 
      label: "My Plan", 
      icon: <Calendar className="h-5 w-5" />,
      section: "2. My Journey"
    },
    { 
      href: "/my-journey/journal", 
      label: "My Journal", 
      icon: <JournalIcon className="h-5 w-5" />,
      section: "2. My Journey"
    },
    { 
      href: "/my-journey/diet", 
      label: "Diet Log", 
      icon: <Utensils className="h-5 w-5" />,
      section: "2. My Journey"
    },
    { 
      href: "/my-journey/metrics", 
      label: "My Metrics", 
      icon: <HeartPulse className="h-5 w-5" />,
      section: "2. My Journey"
    },
    { 
      href: "/my-journey/trends", 
      label: "Trends", 
      icon: <TrendingUp className="h-5 w-5" />,
      section: "2. My Journey"
    },
    
    // Understand section
    { 
      href: "/understand/explainer", 
      label: "AI Explainer", 
      icon: <Brain className="h-5 w-5" />,
      section: "3. Understand"
    },
    { 
      href: "/understand/treatments", 
      label: "Treatment Guides", 
      icon: <Stethoscope className="h-5 w-5" />,
      section: "3. Understand"
    },
    { 
      href: "/understand/interactions", 
      label: "Interaction Checker", 
      icon: <Activity className="h-5 w-5" />,
      section: "3. Understand"
    },
    { 
      href: "/understand/documents", 
      label: "Document Summarizer", 
      icon: <FileText className="h-5 w-5" />,
      section: "3. Understand"
    },
    
    // Explore section
    { 
      href: "/explore/search", 
      label: "Guided Search", 
      icon: <Search className="h-5 w-5" />,
      section: "4. Explore"
    },
    { 
      href: "/explore/trials", 
      label: "Clinical Trial Finder", 
      icon: <FlaskConical className="h-5 w-5" />,
      section: "4. Explore"
    },
    { 
      href: "/explore/creative", 
      label: "Creative Exploration", 
      icon: <Lightbulb className="h-5 w-5" />,
      section: "4. Explore"
    },
    
    // Connect & Hope section
    { 
      href: "/connect/stories", 
      label: "Survivor Stories", 
      icon: <MessageSquare className="h-5 w-5" />,
      section: "5. Connect & Hope"
    },
    { 
      href: "/connect/mindfulness", 
      label: "Mindfulness Corner", 
      icon: <Sparkles className="h-5 w-5" />,
      section: "5. Connect & Hope"
    },
    { 
      href: "/connect/resources", 
      label: "Resource Hub", 
      icon: <BookOpen className="h-5 w-5" />,
      section: "5. Connect & Hope"
    },
    { 
      href: "/connect/caregivers", 
      label: "Caregiver Connect", 
      icon: <Users className="h-5 w-5" />,
      section: "5. Connect & Hope"
    },
    
    // Settings section
    { 
      href: "/settings/profile", 
      label: "Profile Settings", 
      icon: <Settings className="h-5 w-5" />,
      section: "6. Settings & Profile"
    },
    { 
      href: "/help", 
      label: "Help & Support", 
      icon: <HelpCircle className="h-5 w-5" />,
      section: "6. Settings & Profile"
    },
  ];

  return (
    <div className="w-64 bg-white h-full border-r border-gray-200 flex-shrink-0 shadow-sm">
      {/* Logo & title */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-md bg-primary-700 flex items-center justify-center">
            <Home className="h-5 w-5 text-white" />
          </div>
          <div className="ml-2">
            <h2 className="text-lg font-bold text-primary-800">Sophera</h2>
            <p className="text-xs text-gray-500 -mt-1">Your Healing Companion</p>
          </div>
        </div>
      </div>

      {/* Navigation - Organized by sections */}
      <nav className="mt-4 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Group items by section */}
        {Array.from(new Set(navigationItems.map(item => item.section))).map(section => (
          <div key={section} className="mb-4">
            {/* Section header */}
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mt-6 mb-2">
              {section}
            </h3>
            
            {/* Section items */}
            <div className="space-y-1">
              {navigationItems
                .filter(item => item.section === section)
                .map((item) => (
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
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                        location === item.href
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <span className="mr-3 text-gray-500">{item.icon}</span>
                      {item.label}
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              {user.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt={user.username} 
                  className="h-10 w-10 rounded-full object-cover" 
                />
              ) : (
                <User className="h-6 w-6 text-gray-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {user.displayName || user.username}
              </p>
              <p className="text-xs text-gray-500">
                {user.email && user.email}
              </p>
            </div>
            <Link href="/preferences">
              <button className="text-gray-400 hover:text-gray-600">
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </Link>
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </div>
  );
}