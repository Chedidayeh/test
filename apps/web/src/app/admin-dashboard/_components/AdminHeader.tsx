"use client";

import { Bell, LogOut, Settings, User, Menu } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Input } from "@/src/components/ui/input";
import { ModeToggle } from "@/src/components/shared/ModeToggle";

interface AdminHeaderProps {
  isOpen: boolean;
  onToggleSidebar: () => void;
}

export function AdminHeader({ isOpen, onToggleSidebar }: AdminHeaderProps) {
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
        <div className="flex items-center gap-4 ml-6">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-8 h-8 cursor-pointer rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                AJ
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">Alice Johnson</p>
                <p className="text-xs text-slate-500">alice@readly.com</p>
                <p className="text-xs text-slate-400 mt-1">Superadmin</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
