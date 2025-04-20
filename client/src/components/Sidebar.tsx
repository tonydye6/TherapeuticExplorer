import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import useMobile from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import LoginButton from "./LoginButton";
import {
  MessageSquare,
  BookOpen,
  FileText,
  Activity,
  FlaskConical,
  Settings,
  HelpCircle,
  User,
  Home,
  Bookmark,
  SlidersHorizontal,
  Search,
  BarChart3,
  AlertTriangle,
  Calendar,
  Leaf
} from "lucide-react";

interface SidebarProps {
  closeSidebar?: () => void;
}

export default function Sidebar({ closeSidebar }: SidebarProps) {
  const [location] = useLocation();
  const isMobile = useMobile();
  const { user, isAuthenticated } = useAuth();

  const navigationItems = [
    { href: "/", label: "Research Assistant", icon: <MessageSquare className="h-5 w-5" /> },
    { href: "/saved-research", label: "Research Library", icon: <BookOpen className="h-5 w-5" /> },
    { href: "/semantic-search", label: "Semantic Search", icon: <Search className="h-5 w-5" /> },
    { href: "/documents", label: "Medical Documents", icon: <FileText className="h-5 w-5" /> },
    { href: "/treatment-tracker", label: "Treatment Tracker", icon: <Activity className="h-5 w-5" /> },
    { href: "/alternative-treatments", label: "Alternative Treatments", icon: <Leaf className="h-5 w-5" /> },
    { href: "/treatment-predictor", label: "Treatment Predictor", icon: <BarChart3 className="h-5 w-5" /> },
    { href: "/side-effect-analyzer", label: "Side Effect Analyzer", icon: <AlertTriangle className="h-5 w-5" /> },
    { href: "/treatment-timeline", label: "Treatment Timeline", icon: <Calendar className="h-5 w-5" /> },
    { href: "/clinical-trials", label: "Clinical Trials", icon: <FlaskConical className="h-5 w-5" /> },
    { href: "/preferences", label: "Preferences", icon: <Settings className="h-5 w-5" /> },
    { href: "/help", label: "Help & Support", icon: <HelpCircle className="h-5 w-5" /> },
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
            <h2 className="text-lg font-bold text-primary-800">THRIVE</h2>
            <p className="text-xs text-gray-500 -mt-1">Cancer Research Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => (
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