import * as React from "react"
import { Link, useLocation } from "wouter"
import { NeoButton } from "@/components/ui/neo-button"
import { 
  Home,
  BookOpen,
  Map,
  Search,
  Heart,
  Settings,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import useMobile from "@/hooks/use-mobile"

type NavItem = {
  title: string
  href: string
  icon: React.ReactNode
  color: "primary" | "violet" | "pink" | "red" | "orange" | "yellow" | "lime" | "cyan"
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: <Home className="h-5 w-5" />,
    color: "primary"
  },
  {
    title: "My Journey",
    href: "/my-journey",
    icon: <Map className="h-5 w-5" />,
    color: "orange"
  },
  {
    title: "Understand",
    href: "/understand",
    icon: <BookOpen className="h-5 w-5" />,
    color: "lime"
  },
  {
    title: "Explore",
    href: "/explore",
    icon: <Search className="h-5 w-5" />,
    color: "cyan"
  },
  {
    title: "Connect & Hope",
    href: "/connect-hope",
    icon: <Heart className="h-5 w-5" />,
    color: "pink"
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
    color: "violet"
  }
]

export function SidebarNavigation() {
  const [location] = useLocation()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = React.useState(!isMobile)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <button 
        onClick={toggleSidebar}
        className={cn(
          "fixed top-4 left-4 z-50 p-2 rounded-md transition-all duration-300 border-2 border-black bg-white",
          "shadow-[0.15rem_0.15rem_0_#05060f] hover:translate-y-[-2px]",
          isOpen && isMobile ? "left-[calc(65vw-2.5rem)]" : "left-4"
        )}
      >
        <Menu className="h-5 w-5" />
      </button>
    
      <div 
        className={cn(
          "fixed top-0 left-0 h-full bg-sophera-bg-card transition-all duration-300 border-r-4 border-sophera-text-heading z-40",
          "flex flex-col shadow-[0.5rem_0_1rem_rgba(0,0,0,0.1)]",
          isOpen ? "w-64 translate-x-0" : "-translate-x-full",
          isMobile ? "w-[65vw]" : "w-64"
        )}
      >
        <div className="p-4 bg-sophera-brand-primary">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold text-white cursor-pointer">
                Sophera
              </h1>
            </Link>
          </div>
          <div className="mt-1 text-white opacity-80 text-sm font-medium">
            Win the day!
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="space-y-3">
            {mainNavItems.map((item) => (
              <NeoButton
                key={item.href}
                href={item.href}
                buttonText={item.title}
                icon={item.icon}
                color={item.color}
                active={location === item.href}
                fullWidth
                size={isMobile ? "sm" : "md"}
              />
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t-2 border-sophera-text-heading/20">
          <div className="text-sm text-sophera-text-subtle">
            © 2025 Sophera Health
          </div>
        </div>
      </div>
      
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/30 z-30" 
          onClick={toggleSidebar}
        />
      )}
    </>
  )
}