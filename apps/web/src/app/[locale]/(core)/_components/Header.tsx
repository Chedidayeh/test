"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Users, Library, LogIn, Menu } from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "@/src/components/shared/ModeToggle";
import { useSession } from "next-auth/react";
import Profile from "@/src/components/shared/Profile";
import { LoginForm } from "@/src/components/shared/login-form";
import { RoleType } from "@shared/types";
import { useTranslations } from "next-intl";
import { Switcher } from "@/src/components/shared/Switcher";
import RoleIndicator from "@/src/components/shared/RoleIndicator";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/src/components/ui/sheet";
import { useLocale } from "@/src/contexts/LocaleContext";

const Header = ({ userRole }: { userRole: RoleType | undefined }) => {
  const t = useTranslations("CoreHeader");
  const {isRTL} = useLocale();
  const pathname = usePathname();

  const navItems = [
    {
      label:
        userRole === RoleType.PARENT
          ? t("nav.parentDashboard")
          : t("nav.adminDashboard"),
      href:
        userRole === RoleType.PARENT ? "/parent-dashboard" : "/admin-dashboard",
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
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-card border-b border-black/10 shadow-warm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="font-heading text-lg font-bold">Readly</span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Profile session={session.data!} />

            <Sheet>
              <SheetTrigger asChild>
                <button
                  aria-label="Toggle menu"
                  className="p-2 rounded-md hover:bg-primary/10 transition"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "left" : "right"} className="w-64">
                <nav className="flex flex-col gap-4 mt-12 mx-4">
                  {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={`px-3 py-2 rounded-md transition-all ${
                            active
                              ? "bg-primary text-white font-medium"
                              : "text-foreground hover:bg-primary/10"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    );
                  })}

                  {/* Divider */}
                  <div className="border-t border-black/10 my-2"></div>

                  {/* Switcher */}
                  <div className="pt-2">
                    <Switcher />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
