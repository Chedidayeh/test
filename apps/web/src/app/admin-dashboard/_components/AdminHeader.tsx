"use client";

import { Bell, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Input } from "@/src/components/ui/input";

export function AdminHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search stories, riddles, users..."
            className="bg-slate-50 border-slate-200"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  AJ
                </div>
                <span className="hidden sm:inline text-sm font-medium text-slate-700">
                  Alice Johnson
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-slate-900">
                  Alice Johnson
                </p>
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
              <DropdownMenuItem className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
