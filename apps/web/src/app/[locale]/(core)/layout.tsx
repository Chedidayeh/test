"use client";
import Header from "./_components/Header";
import { redirect, useRouter } from "next/navigation";
import { RoleType } from "@readdly/shared-types";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, status } = useSession();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const handleUserInteraction = async () => {
      try {
        if (audioRef.current) {
          await audioRef.current.play();
        }
        window.removeEventListener("pointerdown", handleUserInteraction);
      } catch (err) {
        console.log("Play failed:", err);
      }
    };

    window.addEventListener("pointerdown", handleUserInteraction);

    return () => {
      window.removeEventListener("pointerdown", handleUserInteraction);
    };
  }, []);

  // Only check session state once it's done loading
  useEffect(() => {
    if (status === "loading") return; // Wait for session to load
    
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (session?.user.role === RoleType.PARENT && session?.user.newUser) {
      router.push("/onboarding");
      return;
    }
  }, [status, session, router]);

  // Don't render anything while checking session status
  if (status === "loading") {
    return null;
  }

  const userRole = session?.user.role;

  return (
    <div>
      <Header userRole={userRole} />

      {children}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        loop
        src="/soundtracks/audio.mp3"
      />
    </div>
  );
}
