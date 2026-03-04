"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Users, Library, LogIn } from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "@/src/components/shared/ModeToggle";
import { useSession } from "next-auth/react";
import Profile from "@/src/components/shared/Profile";
import { LoginForm } from "@/src/components/shared/login-form";
import { RoleType } from "@shared/types";
import { useTranslations } from "next-intl";
import { Switcher } from "@/src/components/shared/Switcher";
import RoleIndicator from "@/src/components/shared/RoleIndicator";

const Header = (
  { userRole }: { userRole: RoleType | undefined }
) => {
  const t = useTranslations("CoreHeader");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      label:
        userRole === RoleType.PARENT ? t("nav.parentDashboard") : t("nav.adminDashboard"),
      href: userRole === RoleType.PARENT ? "/parent-dashboard" : "/admin-dashboard",
    },
    {
      label: t("nav.roadmapsLibrary"),
      href: "/roadmaps-library",
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.includes(href);
  };

  const session = useSession();

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
            <div className="flex-shrink-0 flex items-center gap-3">
              <RoleIndicator role={userRole!} />
              <Profile session={session.data!} />
              <ModeToggle />
              <Switcher />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
