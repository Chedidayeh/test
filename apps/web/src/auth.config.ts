import { API_BASE_URL_V1, RoleType } from "@readdly/shared-types";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: RoleType;
    newUser: boolean;
    childId?: string;
    parentId?: string;
    token?: string;
  }
}

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL

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
          const response = await fetch(`${GATEWAY_URL}${API_BASE_URL_V1}/auth/login`, {
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
          const apiResponse = await response.json();

          // Auth Service returns wrapped ApiResponse<{ token, user }>
          // Structure: { success: true, data: { token, user }, timestamp }
          if (!apiResponse.success || !apiResponse.data) {
            throw new Error("Invalid response from authentication service");
          }

          const { token, user } = apiResponse.data;

          if (!token || !user) {
            throw new Error("Invalid response from authentication service");
          }

          // Return user object with token and all fields needed for session
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            newUser: user.newUser,
            childId: user.childId,
            parentId: user.parentId,
            token: token,
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
