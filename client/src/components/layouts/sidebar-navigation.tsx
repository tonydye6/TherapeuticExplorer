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
  ChevronDown,
  User,
  HelpCircle,
  BookMarked,
  Pill,
  Hourglass,
  FileText,
  Microscope,
  Beaker,
  Palette,
  HeartHandshake,
  Stethoscope,
  Star,
  BookHeart,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import useMobile from "@/hooks/use-mobile"

type NavSection = {
  title: string
  icon: React.ReactNode
  color: "primary" | "violet" | "pink" | "red" | "orange" | "yellow" | "lime" | "cyan"
  path: string
  isParent: boolean
  children?: {
    title: string
    href: string
    icon?: React.ReactNode
  }[]
}

const navSections: NavSection[] = [
  {
    title: "Dashboard",
    path: "/",
    icon: <Home className="h-5 w-5" />,
    color: "primary",
    isParent: false
  },
  {
    title: "My Journey",
    path: "/my-journey",
    icon: <Map className="h-5 w-5" />,
    color: "orange",
    isParent: true,
    children: [
      {
        title: "My Plan",
        href: "/my-journey/plan",
        icon: <BookMarked className="h-4 w-4" />
      },
      {
        title: "Journal",
        href: "/my-journey/journal",
        icon: <BookHeart className="h-4 w-4" />
      },
      {
        title: "Diet Tracker",
        href: "/my-journey/diet",
        icon: <Stethoscope className="h-4 w-4" />
      }
    ]
  },
  {
    title: "Understand",
    path: "/understand",
    icon: <BookOpen className="h-5 w-5" />,
    color: "lime",
    isParent: true,
    children: [
      {
        title: "Explainer",
        href: "/understand/explainer",
        icon: <Sparkles className="h-4 w-4" />
      },
      {
        title: "Treatments",
        href: "/understand/treatments",
        icon: <Pill className="h-4 w-4" />
      },
      {
        title: "Interactions",
        href: "/understand/interactions",
        icon: <Hourglass className="h-4 w-4" />
      },
      {
        title: "Documents",
        href: "/understand/documents",
        icon: <FileText className="h-4 w-4" />
      }
    ]
  },
  {
    title: "Explore",
    path: "/explore",
    icon: <Search className="h-5 w-5" />,
    color: "cyan",
    isParent: true,
    children: [
      {
        title: "Research",
        href: "/explore/search",
        icon: <Microscope className="h-4 w-4" />
      },
      {
        title: "Clinical Trials",
        href: "/explore/trials",
        icon: <Beaker className="h-4 w-4" />
      },
      {
        title: "Creative",
        href: "/explore/creative",
        icon: <Palette className="h-4 w-4" />
      }
    ]
  },
  {
    title: "Connect & Hope",
    path: "/connect-hope",
    icon: <Heart className="h-5 w-5" />,
    color: "pink",
    isParent: true,
    children: [
      {
        title: "Stories",
        href: "/connect/stories",
        icon: <Star className="h-4 w-4" />
      },
      {
        title: "Mindfulness",
        href: "/connect/mindfulness",
        icon: <Sparkles className="h-4 w-4" />
      },
      {
        title: "Resources",
        href: "/connect/resources",
        icon: <BookMarked className="h-4 w-4" />
      },
      {
        title: "Caregivers",
        href: "/connect/caregivers",
        icon: <HeartHandshake className="h-4 w-4" />
      }
    ]
  },
  {
    title: "Settings",
    path: "/settings",
    icon: <Settings className="h-5 w-5" />,
    color: "violet",
    isParent: true,
    children: [
      {
        title: "Profile",
        href: "/settings/profile",
        icon: <User className="h-4 w-4" />
      },
      {
        title: "Help",
        href: "/help",
        icon: <HelpCircle className="h-4 w-4" />
      }
    ]
  }
]

export function SidebarNavigation() {
  const [location] = useLocation()
  const { isMobile } = useMobile()
  const [isOpen, setIsOpen] = React.useState(!isMobile)
  const [expandedSections, setExpandedSections] = React.useState<string[]>([])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const isSectionActive = (path: string) => {
    if (path === "/") return location === path
    return location.startsWith(path)
  }

  // Close sidebar on mobile when changing routes
  React.useEffect(() => {
    if (isMobile && isOpen) {
      setIsOpen(false)
    }
  }, [location, isMobile])

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
          <nav className="space-y-6">
            {navSections.map((section) => (
              <div key={section.path} className="space-y-2">
                {section.isParent ? (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className={cn(
                      "w-full flex items-center justify-between py-3 px-4 rounded-lg border-2 transition-all duration-300 font-bold",
                      isSectionActive(section.path) 
                        ? "bg-sophera-brand-primary text-white border-sophera-text-heading shadow-[0.35rem_0.35rem_0_#05060f]" 
                        : "border-sophera-text-heading/70 shadow-[0.2rem_0.2rem_0_#05060f] hover:border-sophera-text-heading hover:shadow-[0.35rem_0.35rem_0_#05060f]",
                      !isSectionActive(section.path) && section.color === "primary" && "bg-cyan-200",
                      !isSectionActive(section.path) && section.color === "orange" && "bg-orange-200",
                      !isSectionActive(section.path) && section.color === "lime" && "bg-lime-200",
                      !isSectionActive(section.path) && section.color === "cyan" && "bg-cyan-200",
                      !isSectionActive(section.path) && section.color === "pink" && "bg-pink-200",
                      !isSectionActive(section.path) && section.color === "violet" && "bg-violet-200"
                    )}
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{section.icon}</span>
                      <span>{section.title}</span>
                    </div>
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 transition-transform duration-300",
                        expandedSections.includes(section.title) ? "rotate-180" : "rotate-0"
                      )} 
                    />
                  </button>
                ) : (
                  <Link href={section.path}>
                    <button
                      className={cn(
                        "w-full flex items-center py-3 px-4 rounded-lg border-2 transition-all duration-300 font-bold",
                        isSectionActive(section.path) 
                          ? "bg-sophera-brand-primary text-white border-sophera-text-heading shadow-[0.35rem_0.35rem_0_#05060f]" 
                          : "border-sophera-text-heading/70 shadow-[0.2rem_0.2rem_0_#05060f] hover:border-sophera-text-heading hover:shadow-[0.35rem_0.35rem_0_#05060f]",
                        !isSectionActive(section.path) && section.color === "primary" && "bg-cyan-200"
                      )}
                    >
                      <span className="mr-3">{section.icon}</span>
                      <span>{section.title}</span>
                    </button>
                  </Link>
                )}
                
                {section.isParent && section.children && expandedSections.includes(section.title) && (
                  <div className="ml-4 pl-4 border-l-2 border-sophera-text-heading/20 space-y-2 animate-fadeIn">
                    {section.children.map((child) => (
                      <Link key={child.href} href={child.href}>
                        <button 
                          className={cn(
                            "w-full flex items-center py-2 px-3 rounded-md border text-sm transition-all duration-300",
                            location === child.href
                              ? "bg-gray-100 border-sophera-text-heading/60 shadow-[0.15rem_0.15rem_0_#05060f80]"
                              : "bg-transparent border-sophera-text-heading/30 hover:border-sophera-text-heading/60 hover:shadow-[0.15rem_0.15rem_0_#05060f40]"
                          )}
                        >
                          {child.icon && <span className="mr-2">{child.icon}</span>}
                          <span>{child.title}</span>
                        </button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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