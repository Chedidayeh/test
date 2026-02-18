import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: "PARENT" | "ADMIN" | "CHILD";
    newUser: boolean;
    childId?: string;
    parentId?: string;
    token?: string;
  }
}

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:3001";

export default {
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          throw new Error("Invalid credentials format");
        }

        if (!credentials.email || !credentials.password) {
          throw new Error("Email and password are required");
        }

        try {
          // Call Gateway which proxies to Auth Service
          // Gateway is the single entry point for all API calls
          const response = await fetch(`${GATEWAY_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          if (!response.ok) {
            console.error("Login failed with :", response.json());
            const error = await response
              .json()
              .catch(() => ({ message: "Authentication failed" }));
            throw new Error(error.message);
          }

          // Parse successful login response
          const data = await response.json();

          // Expected response structure from Auth Service:
          // { token: "jwt...", user: { id, email, role, childId?, parentId? } }
          if (!data.token || !data.user) {
            throw new Error("Invalid response from authentication service");
          }

          // Return user object with token and all fields needed for session
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name, // Include name from auth service
            role: data.user.role,
            newUser: data.user.newUser, // Include newUser flag from auth service
            childId: data.user.childId,
            parentId: data.user.parentId,
            token: data.token, // Store token for jwt callback
          };
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Authentication service error";
          console.error("[Auth] Credentials authorization failed:", message);
          throw new Error(message);
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
