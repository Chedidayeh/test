"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Database,
  FileText,
  Menu,
  Settings,
  Users,
  X,
  BookOpen,
  HelpCircle,
  Home,
  CheckSquare,
  Map,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { ScrollArea } from "@/src/components/ui/scroll-area";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  isOpen: boolean;
  onToggleSidebar: () => void;
}

const navigationSections: NavSection[] = [
  {
    title: "Main",
    items: [
      {
        name: "Dashboard",
        href: "/admin-dashboard",
        icon: <Home className="w-5 h-5" />,
      },
    ],
  },
  {
    title: "Content Management",
    items: [
      {
        name: "Roadmaps",
        href: "/admin-dashboard/roadmaps",
        icon: <Map className="w-5 h-5" />,
      },
      {
        name: "Stories",
        href: "/admin-dashboard/stories",
        icon: <BookOpen className="w-5 h-5" />,
      },
    ],
  },
  {
    title: "Users",
    items: [
      {
        name: "Parents",
        href: "/admin-dashboard/users/parents",
        icon: <Users className="w-5 h-5" />,
      },
      {
        name: "Children",
        href: "/admin-dashboard/users/children",
        icon: <Users className="w-5 h-5" />,
      },
      // {
      //   name: "Admin Users",
      //   href: "/admin-dashboard/users/admin",
      //   icon: <Database className="w-5 h-5" />,
      // },
    ],
  },

  {
    title: "System",
    items: [
      {
        name: "Settings",
        href: "/admin-dashboard/settings",
        icon: <Settings className="w-5 h-5" />,
      },
    ],
  },
];

export function AdminSidebar({ isOpen, onToggleSidebar }: AdminSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin-dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button - Only show on mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </Button>

      {/* Sidebar - Mobile */}
      {isMobileOpen && (
        <ScrollArea className="h-screen fixed left-0 top-0 z-30 w-64 md:hidden">
          <div className="flex flex-col h-screen w-64 bg-card border-r">
            {/* Logo/Header */}
            <div className="p-3 border-b">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-semibold">
                    R
                  </div>
                  <div>
                    <h2 className="font-semibold ">Readly Admin</h2>
                    <p className="text-xs text-slate-500">Content Manager</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-3">
              {navigationSections.map((section) => (
                <div key={section.title}>
                  <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={isActive(item.href) ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-3 my-1",
                            isActive(item.href) &&
                              "bg-primary hover:bg-primary text-white",
                          )}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="flex-1 text-left">{item.name}</span>
                          {item.badge && (
                            <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs leading-none text-white transform translate-x-1 bg-primary rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </ScrollArea>
      )}

      {/* Sidebar - Desktop */}
      <ScrollArea
        className={cn(
          "transition-all duration-300 hidden md:block ",
          isOpen ? "w-64" : "w-22",
        )}
      >
        <div
          className={cn(
            "flex flex-col  h-screen  bg-card border-r transition-all duration-300",
            isOpen ? "w-64" : "w-22",
            "md:relative md:z-0",
          )}
        >
          {/* Logo/Header */}
          <div className="p-3 border-b">
            <Link href="/" className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center",
                  isOpen ? "gap-3" : "justify-center",
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-semibold">
                  R
                </div>
                {isOpen && (
                  <div>
                    <h2 className="font-semibold">Readly Admin</h2>
                    <p className="text-xs text-slate-500">Content Manager</p>
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-3">
            {navigationSections.map((section) => (
              <div key={section.title}>
                {isOpen && (
                  <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive(item.href) ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 my-1",
                          isActive(item.href) &&
                            "bg-primary hover:bg-primary text-white",
                        )}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {isOpen && (
                          <>
                            <span className="flex-1 text-left">
                              {item.name}
                            </span>
                            {item.badge && (
                              <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs leading-none text-white transform translate-x-1 bg-primary rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </ScrollArea>
    </>
  );
}
