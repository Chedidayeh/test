"use server";

import { Session } from "next-auth";
/**
 * Server Actions for Auth Service
 * 
 * Used by client components to fetch data from server-side API
 * Wraps server-api calls and returns structured responses
 */

import { createChildProfile, getParents, loginUser, registerUser } from "./server-api";
import { ApiResponse, User } from "@readdly/shared-types";
import { unstable_update } from "@/src/auth";

interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface FetchParentsResult {
  success: boolean;
  data?: {
    parents: User[];
    pagination?: {
      total: number;
      page: number;
      pageSize: number;
      hasMore: boolean;
    };
  };
  error?: string;
}

/**
 * Server action to login a user
 * Called from client components (login form)
 */
export async function loginAction(payload: {
  email: string;
  password: string;
}): Promise<ApiResponse<{ token: string; user: User }>> {
  try {
    const result = await loginUser(payload);

    if (!result.valid) {
      return {
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: result.message || "Invalid credentials",
        },
        timestamp: new Date(),
      };
    }

    const loginData = (result.data as ApiResponse<{ token: string; user: User }>).data;
    return {
      success: true,
      data: loginData || { token: "", user: {} as User },
      timestamp: new Date(),
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Login failed";

    console.error("[Auth Service] loginAction error:", errorMsg);

    return {
      success: false,
      error: {
        code: "LOGIN_ERROR",
        message: errorMsg,
      },
      timestamp: new Date(),
    };
  }
}

/**
 * Server action to register a new user
 * Called from client components (signup form)
 */
export async function registerAction(payload: {
  email: string;
  password: string;
  name: string;
}): Promise<ApiResponse<User>> {
  try {
    const result = await registerUser(payload);

    if ("error" in result && !result.success) {
      return {
        success: false,
        error: {
          code: "REGISTRATION_FAILED",
          message: (result as { error: string }).error || "Registration failed",
        },
        timestamp: new Date(),
      };
    }

    const registerData = (result as ApiResponse<User>).data;
    return {
      success: true,
      data: registerData || ({} as User),
      timestamp: new Date(),
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Registration failed";

    console.error("[Auth Service] registerAction error:", errorMsg);

    return {
      success: false,
      error: {
        code: "REGISTRATION_ERROR",
        message: errorMsg,
      },
      timestamp: new Date(),
    };
  }
}

/**
 * Server action to fetch parents with pagination
 * Called from client components to load different pages
 */
export async function fetchParentsAction(
  params: PaginationParams
): Promise<FetchParentsResult> {
  try {
    const result = await getParents(params);
    
    return {
      success: true,
      data: {
        parents: result.parents,
        pagination: result.pagination,
      },
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to fetch parents";
    
    console.error("[Auth Service] fetchParentsAction error:", errorMsg);
    
    return {
      success: false,
      error: errorMsg,
    };
  }
}

export async function createChildProfileAction(payload: {
  session: Session | null;
  parentEmail: string;
  parentId: string;
  name: string;
  ageGroupId: string;
  ageGroupName: string;
  themeIds: string[];
  allocatedRoadmaps: string[];
}) {
  try {
    const child = await createChildProfile(payload);

    await unstable_update({
      user: {
        ...payload.session!.user,
        newUser: false,
      },
    });

    return {
      success: true,
      data: child,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create child profile";
    return {
      success: false,
      error: message,
    };
  }
}

