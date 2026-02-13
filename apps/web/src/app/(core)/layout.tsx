import Header from "./_components/Header";
import Footer from "./_components/Footer";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />

      {children}

      <Footer />
    </div>
  );
}
