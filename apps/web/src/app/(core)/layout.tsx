import Header from "./_components/Header";
import Footer from "./_components/Footer";
import { auth } from "@/src/auth";
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

  if (session?.user.newUser) {
    redirect("/onboarding");
  }
  
  return (
    <div>
      <Header />

      {children}

      <Footer />
    </div>
  );
}
