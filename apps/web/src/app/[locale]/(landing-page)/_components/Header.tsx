"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Users, Library, LogIn } from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "@/src/components/shared/ModeToggle";
import { Session } from "next-auth";
import Profile from "@/src/components/shared/Profile";
import { LoginForm } from "@/src/components/shared/login-form";
import { Switcher } from "@/src/components/shared/Switcher";
import { RoleType } from "@shared/types";
import { Button } from "@/src/components/ui/button";

const Header = ({ session }: { session: Session | null }) => {
  const pathname = usePathname();

  const navItems = [
    {
      label: "How It Works",
      icon: Users,
      href: "#how-it-works",
    },
    {
      label: "Pricing",
      icon: Users,
      href: "#pricing",
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const user = session?.user;

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-50">
        <div className="container mx-auto px-8 py-3">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="font-heading text-white text-2xl font-bold">
                Readly
              </span>
            </Link>

            {/* Center Navigation (keeps nav visually centered) */}
            {/* <div className="flex-1 flex justify-center">
              <nav className="flex items-center gap-10">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  // Use native anchor + smooth scroll for hash links to ensure in-page navigation
                  if (item.href && item.href.startsWith("#")) {
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          const id = item.href.replace("#", "");
                          const el = document.getElementById(id);
                          const headerOffset = 80; // approximate sticky header height
                          if (el) {
                            const y =
                              el.getBoundingClientRect().top +
                              window.scrollY -
                              headerOffset;
                            window.scrollTo({ top: y, behavior: "smooth" });
                          } else {
                            // fallback: set hash
                            window.location.hash = item.href;
                          }
                        }}
                        className={`flex items-center hover:bg-primary bg-primary/5 gap-2 px-3 py-1 rounded-2xl transition-all duration-300`}
                      >
                        <span className="text-white">{item.label}</span>
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center hover:bg-primary bg-primary/5 gap-2 px-3 py-1 rounded-2xl transition-all duration-300`}
                    >
                      <span className="text-white">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div> */}

            {/* Right - Login component (fixed to the far right) */}
            <div className="flex-shrink-0 flex items-center gap-3">
              {session?.user.role === RoleType.ADMIN && (
                <Link href={"/admin-dashboard"}>
                  <Button size={"sm"}>Admin Dashboard</Button>
                </Link>
              )}
              {user ? <Profile session={session} /> : <LoginForm />}{" "}
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
