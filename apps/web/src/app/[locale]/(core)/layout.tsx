import Header from "./_components/Header";
import RoleIndicator from "@/src/components/shared/RoleIndicator";
import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import { RoleType } from "@shared/types";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  if (session.user.role === RoleType.PARENT && session?.user.newUser) {
    redirect("/onboarding");
  }

  const userRole = session?.user.role;

  return (
    <div>
      <Header userRole={userRole} />
      {/* {userRole && <RoleIndicator role={userRole} />} */}

      {children}
    </div>
  );
}
