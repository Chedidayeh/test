"use server";

import authConfig from "./auth.config";
import NextAuth from "next-auth";

import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// ✅ Initialize next-intl middleware
const intlMiddleware = createMiddleware(routing);

const { auth } = NextAuth(authConfig);
export default auth(async (req) => {
  // First: Run next-intl locale detection
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // Then: Run existing auth & role checks
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  return;
});

export const config = {
  matcher: ["/((?!_next|api|trpc|.*\\..*).*)"],
};
