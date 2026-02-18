/**
 * Route classification for JWT middleware
 * Routes that don't require authentication bypass the JWT middleware
 */

export interface RouteConfig {
  pattern: string | RegExp;
  requiresAuth: boolean;
  description: string;
}

export const publicRoutes: RouteConfig[] = [
  {
    pattern: /^\/api\/auth\/(register|login|login-child|health)$/,
    requiresAuth: false,
    description: "Auth Service - public endpoints",
  },
];

export const protectedRoutes: RouteConfig[] = [
  {
    pattern: /^\/api\/auth\/logout$/,
    requiresAuth: true,
    description: "Auth Service - logout (requires token)",
  },
  {
    pattern: /^\/api\/auth\/verify-token$/,
    requiresAuth: true,
    description: "Auth Service - verify token (requires token)",
  },
  {
    pattern: /^\/api\/auth\/create-child-profile$/,
    requiresAuth: true,
    description: "Auth Service - create child (requires parent token)",
  },
  {
    pattern: /^\/content\/.*/,
    requiresAuth: true,
    description: "Content Service - all routes protected",
  },
  {
    pattern: /^\/progress\/.*/,
    requiresAuth: true,
    description: "Progress Service - all routes protected",
  },
  {
    pattern: /^\/api\/admin\/.*/,
    requiresAuth: true,
    description: "Admin endpoints - all routes protected",
  },
];

/**
 * Check if a route requires authentication
 */
export function isPublicRoute(path: string): boolean {
  return publicRoutes.some((route) => {
    if (route.pattern instanceof RegExp) {
      return route.pattern.test(path);
    }
    return route.pattern === path;
  });
}

/**
 * Check if a route is protected
 */
export function isProtectedRoute(path: string): boolean {
  return protectedRoutes.some((route) => {
    if (route.pattern instanceof RegExp) {
      return route.pattern.test(path);
    }
    return route.pattern === path;
  });
}

/**
 * Determine if a route requires JWT validation
 */
export function requiresAuth(path: string): boolean {
  // If explicitly public, no auth required
  if (isPublicRoute(path)) {
    return false;
  }

  // If explicitly protected, auth required
  if (isProtectedRoute(path)) {
    return true;
  }

  // By default, anything not explicitly public requires auth
  return true;
}
