import { auth } from "@/src/auth";
import { RoleType } from "@shared/types";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  if (session?.user.newUser && session.user.role === RoleType.PARENT) {
    redirect("/onboarding");
  }
  return <div className="">{children}</div>;
}
