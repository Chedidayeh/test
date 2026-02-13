import { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  // const user = await getUser();
  // if (user == null) {
  //   redirect('/');
  // }
  // if (!user?.newUser) {
  //   redirect('/dashboard');
  // }

  return (
    <div className="relative min-h-screen ">
      {children}
    </div>
  );
}

