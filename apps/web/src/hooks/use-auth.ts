"use client";

/**
 * useAuth hook
 * Provides convenient access to auth state and functions
 */

import { useSession } from "next-auth/react";
import { signIn, signOut } from "@/src/auth";
import { AuthUser, UseAuthReturn } from "@/src/types/auth";

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        childId: session.user.childId,
        parentId: session.user.parentId,
      }
    : null;

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Don't auto-redirect, we'll handle it
    });

    if (!result?.ok) {
      throw new Error(result?.error || "Failed to sign in");
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
}
