import type { ReactNode } from "react";
import { AdminSidebar } from "./_components/AdminSidebar";
import { AdminHeader } from "./_components/AdminHeader";
import { redirect } from "next/navigation";
import { RoleType } from "@shared/types";
import { auth } from "@/src/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/");
  }
  const userRole = session.user.role;
  if (userRole !== RoleType.ADMIN) {
    redirect("/");
  }
  return (
    <div className="flex h-screen">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-screen z-40">
        <AdminSidebar />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 md:ml-64`}
      >
        {/* Fixed Header */}
        <div
          className="fixed top-0 right-0 left-[16rem] z-30 bg-card"
        >
          <AdminHeader session={session} />
        </div>

        {/* Page Content */}
        <main className="flex-1 mt-[65px]">
          <div className="p-6 mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
