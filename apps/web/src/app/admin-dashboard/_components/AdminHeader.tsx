"use client";

import { Bell, Menu } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ModeToggle } from "@/src/components/shared/ModeToggle";
import { Session } from "next-auth";
import Profile from "@/src/components/shared/Profile";

interface AdminHeaderProps {
  session: Session;
  isOpen: boolean;
  onToggleSidebar: () => void;
}

export function AdminHeader({ session, isOpen, onToggleSidebar }: AdminHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="flex items-center justify-between p-3.5 mx-auto">
        {/* Left Section - Collapse Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hidden md:inline-flex"
          >
            <Menu className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4"></div>

        {/* Right Section */}
        <div className="flex items-center gap-1 ml-6">
          {/* Notifications */}
          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
          </Button> */}

          {/* User Menu */}
          <Profile session={session} />

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
