import NextAuth from "next-auth";
import authConfig from "./auth.config";

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

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "PARENT" | "ADMIN" | "CHILD";
      newUser?: boolean;
      childId?: string;
      parentId?: string;
      token?: string;
    };
  }
}

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
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
      session.user.role = token.role as "PARENT" | "ADMIN" | "CHILD";
      session.user.childId = token.childId as string | undefined;
      session.user.parentId = token.parentId as string | undefined;
      session.user.token = token.accessToken as string | undefined; // Include Auth Service JWT in session
      session.user.newUser = token.newUser as boolean;
      return session;
    },
  },
  ...authConfig,
});
