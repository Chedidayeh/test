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
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

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
        name: "Stories",
        href: "/admin-dashboard/stories",
        icon: <BookOpen className="w-5 h-5" />,
      },
      {
        name: "Riddles",
        href: "/admin-dashboard/riddles",
        icon: <HelpCircle className="w-5 h-5" />,
      },
      {
        name: "Approval Queue",
        href: "/admin-dashboard/approval-queue",
        icon: <CheckSquare className="w-5 h-5" />,
        badge: 2,
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
      {
        name: "Admin Users",
        href: "/admin-dashboard/users/admin",
        icon: <Database className="w-5 h-5" />,
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        name: "Dashboard",
        href: "/admin-dashboard/analytics",
        icon: <BarChart3 className="w-5 h-5" />,
      },
      {
        name: "Insights",
        href: "/admin-dashboard/analytics/insights",
        icon: <FileText className="w-5 h-5" />,
      },
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

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true);
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
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col bg-white border-r border-slate-200 transition-all duration-300 h-screen overflow-y-auto",
          isOpen ? "w-64" : "w-20",
          "fixed left-0 top-0 z-30 md:relative md:z-0",
          !isMobileOpen && "hidden md:flex"
        )}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              R
            </div>
            {isOpen && (
              <div>
                <h2 className="font-bold text-slate-900">Readly Admin</h2>
                <p className="text-xs text-slate-500">Content Manager</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6">
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
                        "w-full justify-start gap-3",
                        isActive(item.href) &&
                          "bg-blue-600 hover:bg-blue-700 text-white"
                      )}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {isOpen && (
                        <>
                          <span className="flex-1 text-left">{item.name}</span>
                          {item.badge && (
                            <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 bg-red-600 rounded-full">
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

        {/* Collapse Button */}
        <div className="p-4 border-t border-slate-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
