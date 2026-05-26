import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { API_BASE_URL_V1, RoleType } from "@readdly/shared-types";

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

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: RoleType;
      newUser?: boolean;
      childId?: string;
      parentId?: string;
      token?: string;
    };
  }
}

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL;

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: parseInt(process.env.JWT_EXPIRATION!, 10),
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update") {
        token.newUser = session.user.newUser;
      }

      // Google OAuth: call auth service to upsert user and get auth-service JWT
      if (account?.provider === "google" && user) {
        try {
          const res = await fetch(`${GATEWAY_URL}${API_BASE_URL_V1}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            }),
          });
          const json = await res.json();
          if (json.success && json.data) {
            token.id = json.data.user.id;
            token.email = json.data.user.email;
            token.name = json.data.user.name;
            token.role = json.data.user.role;
            token.newUser = json.data.user.newUser;
            token.accessToken = json.data.token;
          } else {
            console.error("[Auth] Google OAuth: auth service returned error", json);
          }
        } catch (err) {
          console.error("[Auth] Google OAuth: failed to call auth service", err);
        }
        return token;
      }

      // Called when user signs in or token is refreshed
      if (user) {
        // User is available during sign-in
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.childId = user.childId;
        token.parentId = user.parentId;
        token.accessToken = user.token; // Store Auth Service JWT
        token.newUser = user.newUser;
      }
      return token;
    },
    session({ session, token }) {
      // Called whenever session is checked
      // Expose token fields to session object so they're available in client
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.user.role = token.role as RoleType;
      session.user.childId = token.childId as string | undefined;
      session.user.parentId = token.parentId as string | undefined;
      session.user.token = token.accessToken as string | undefined; // Include Auth Service JWT in session
      session.user.newUser = token.newUser as boolean;
      return session;
    },
  },
  ...authConfig,
});
