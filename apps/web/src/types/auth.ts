/**
 * Auth Service API request/response types
 */

 type UserRole = "PARENT" | "ADMIN" | "CHILD";

 interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  childId?: string;
  parentId?: string;
}

 interface LoginRequest {
  email: string;
  password: string;
}

 interface LoginResponse {
  token: string;
  user: AuthUser;
}

 interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

 interface RegisterResponse {
  token: string;
  user: AuthUser;
}

 interface CreateChildProfileRequest {
  parentEmail: string;
  name: string;
}

 interface CreateChildProfileResponse {
  loginCode: string;
  child: {
    id: string;
    email: string;
    name: string;
  };
}

 interface LoginChildRequest {
  loginCode: string;
}

 interface LoginChildResponse {
  token: string;
  user: AuthUser;
}

 interface VerifyTokenRequest {
  token: string;
}

 interface VerifyTokenResponse {
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

//  interface LogoutRequest {
//   // Empty body, token in Authorization header
// }

 interface LogoutResponse {
  message: string;
}

// Error response from API
 interface ApiError {
  error: string;
  message?: string;
  status?: number;
}

// Auth context types
 interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
