"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { AdminSidebar } from "./_components/AdminSidebar";
import { AdminHeader } from "./_components/AdminHeader";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { RoleType } from "@shared/types";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const { data: session, status } = useSession();
  if(!session) {
    redirect("/");
  }
  return (
    <div className="flex h-screen">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-screen z-40">
        <AdminSidebar
          isOpen={isOpen}
          onToggleSidebar={() => setIsOpen(!isOpen)}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${isOpen ? "md:ml-64" : "md:ml-22"}`}
      >
        {/* Fixed Header */}
        <div
          className="fixed top-0 right-0 left-0 z-30 bg-card"
          style={{ left: isOpen ? "16rem" : "var(--sidebar-width, 5.5rem)" }}
        >
          <AdminHeader
          session={session}
            isOpen={isOpen}
            onToggleSidebar={() => setIsOpen(!isOpen)}
          />
        </div>

        {/* Page Content */}
        <main className="flex-1 mt-[65px]">
          <div className="p-6 mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
