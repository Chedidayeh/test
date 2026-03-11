/**
 * Logout utility
 * Handles logout across frontend and backend
 */

import { signOut } from "@/src/auth";
import { API_BASE_URL_V1 } from "@readdly/shared-types";

export async function handleLogout() {
  try {
    // Call Gateway logout endpoint to delete session
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL
    try {
      await fetch(`${gatewayUrl}${API_BASE_URL_V1}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.warn("[Logout] Failed to notify backend, but clearing frontend session anyway");
    }

    // Clear frontend session (removes httpOnly cookie)
    await signOut({
      redirect: true,
      redirectTo: "/",
    });
  } catch (error) {
    console.error("[Logout] Error during logout:", error);
    // Force redirect even if error occurs
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }
}
