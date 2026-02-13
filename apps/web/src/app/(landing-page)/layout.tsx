import Footer from "@/src/components/landing/Footer";
import Header from "./_components/Header";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
