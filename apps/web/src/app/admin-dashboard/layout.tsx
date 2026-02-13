import type { ReactNode } from "react";
import { AdminSidebar } from "./_components/AdminSidebar";
import { AdminHeader } from "./_components/AdminHeader";


export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
