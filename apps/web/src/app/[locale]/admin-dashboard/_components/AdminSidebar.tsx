"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  Users,
  BookOpen,
  Home,
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

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin-dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Sidebar - Desktop */}
      <ScrollArea
        className={cn("transition-all duration-300 w-64 hidden md:block ")}
      >
        <div
          className={cn(
            "flex flex-col  h-screen w-64  bg-card border-r transition-all duration-300",
            "md:relative md:z-0",
          )}
        >
          {/* Logo/Header */}
          <div className="p-3 border-b">
            <Link href="/" className="flex items-center gap-3">
              <div className={cn("flex items-center gap-3")}>
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-semibold">
                  R
                </div>
                <div>
                  <h2 className="font-semibold">Readly Admin</h2>
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
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <>
                          <span className="flex-1 text-left">{item.name}</span>
                          {item.badge && (
                            <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs leading-none text-white transform translate-x-1 bg-primary rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
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
