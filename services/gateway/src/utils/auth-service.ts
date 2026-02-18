import axios from "axios";
import { logger } from "./logger";

export interface VerifyTokenResponse {
  valid: boolean;
  payload: {
    id: string;
    email: string;
    role: "CHILD" | "PARENT" | "ADMIN";
    childId?: string;
    parentId?: string;
    iat?: number;
    exp?: number;
  };
}

export class AuthServiceClient {
  private serviceUrl: string;

  constructor() {
    this.serviceUrl = process.env.AUTH_SERVICE_URL!;
  }

  /**
   * Verify JWT token with Auth Service
   * Checks JWT signature, expiration, and session validity
   */
  async verifyToken(token: string): Promise<VerifyTokenResponse | null> {
    try {
      const response = await axios.post<VerifyTokenResponse>(
        `${this.serviceUrl}/verify-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data.valid) {
        return response.data;
      }

      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          logger.debug("Token verification failed - invalid/expired", {
            error: error.response.data?.error,
          });
          return null;
        }

        if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
          logger.error("Auth Service unreachable", {
            serviceUrl: this.serviceUrl,
            error: error.message,
          });
          throw new Error("AUTH_SERVICE_UNAVAILABLE");
        }

        logger.error("Token verification error", {
          status: error.response?.status,
          error: error.message,
        });
      } else {
        logger.error("Unexpected error verifying token", {
          error: String(error),
        });
      }

      return null;
    }
  }

  /**
   * Health check for Auth Service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.serviceUrl}/health`);

      return response.status === 200;
    } catch (error) {
      logger.warn("Auth Service health check failed", {
        error: String(error),
      });
      return false;
    }
  }
}

export const authServiceClient = new AuthServiceClient();
