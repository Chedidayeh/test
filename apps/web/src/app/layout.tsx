import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka } from "next/font/google";
import "./globals.css";
import { LoginProvider } from "@/src/providers/login-provider";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "../providers/theme-provider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "../components/ui/sonner";

const fredoka = Fredoka({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"], // Fredoka supports multiple weights
});

export const metadata: Metadata = {
  title: "Readly - Stories that make you think!",
  description:
    "An interactive story-based riddle game for young readers aged 6-11. Read stories, solve riddles, and learn while having fun!",
  keywords: [
    "reading",
    "children",
    "riddles",
    "stories",
    "learning",
    "education",
    "kids",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fredoka.className} antialiased bg-background  `}>
        <NextTopLoader color="#F59E0B" showSpinner={false} />
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <LoginProvider>{children}</LoginProvider>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
