/**
 * Auth Service API request/response types
 */

export type UserRole = "PARENT" | "ADMIN" | "CHILD";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  childId?: string;
  parentId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResponse {
  token: string;
  user: AuthUser;
}

export interface CreateChildProfileRequest {
  parentEmail: string;
  name: string;
}

export interface CreateChildProfileResponse {
  loginCode: string;
  child: {
    id: string;
    email: string;
    name: string;
  };
}

export interface LoginChildRequest {
  loginCode: string;
}

export interface LoginChildResponse {
  token: string;
  user: AuthUser;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  payload?: {
    id: string;
    email: string;
    role: UserRole;
    childId?: string;
    parentId?: string;
    iat: number;
    exp: number;
  };
}

// export interface LogoutRequest {
//   // Empty body, token in Authorization header
// }

export interface LogoutResponse {
  message: string;
}

// Error response from API
export interface ApiError {
  error: string;
  message?: string;
  status?: number;
}

// Auth context types
export interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
