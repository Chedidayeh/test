"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Users, Library, LogIn } from "lucide-react";
import { useState } from "react";
import Login from "@/src/components/shared/login";
import { ModeToggle } from "@/src/components/ModeToggle";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      label: "Parent Dashboard",
      href: "/parent-dashboard",
    },
    {
      label: "Child Dashboard",
      href: "/child-dashboard",
    },
    {
      label: "Library",
      href: "/story-library",
    },
    {
      label: "World Progress",
      href: "/world-progress",
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-50 bg-card border-b border-black/20 shadow-warm">
        <div className="container mx-auto px-8 py-3">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="font-heading text-2xl font-bold">Readly</span>
            </Link>

            {/* Center Navigation (keeps nav visually centered) */}
            <div className="flex-1 flex justify-center">
              <nav className="flex items-center gap-10">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-1 rounded-2xl transition-all duration-300 ${
                        active
                          ? "bg-primary text-white shadow-warm"
                          : "text-foreground hover:text-white hover:bg-primary"
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right - Login component (fixed to the far right) */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <Login />
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
