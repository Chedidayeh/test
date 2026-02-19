import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { logger } from "../utils/logger";
import { RoleType } from "@prisma/client";

export interface JWTPayload {
  id: string;
  email: string;
  role: RoleType
  childId?: string;
  parentId?: string;
  iat?: number;
  exp?: number;
}

export class JWTService {
  private secret: string;
  private expiration: number; // in seconds

  constructor() {
    this.secret = process.env.JWT_SECRET!;
    this.expiration = parseInt(process.env.JWT_EXPIRATION!, 10);

    if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
      logger.error("JWT_SECRET is not set in production!");
    }
  }

  /**
   * Generate a JWT token for a user
   */
  generateToken(payload: JWTPayload): string {
    try {
      const token = jwt.sign(payload, this.secret, {
        expiresIn: this.expiration,
      });
      return token;
    } catch (error) {
      logger.error("Error generating JWT", { error: String(error) });
      throw error;
    }
  }

  /**
   * Verify and decode a JWT token
   */
  verifyToken(token: string): JWTPayload | null {
    try {
      const verifyOptions: VerifyOptions = {};
      const decoded = jwt.verify(token, this.secret, verifyOptions) as JWTPayload;
      return decoded;
    } catch (error) {
      logger.debug("Token verification failed", { error: String(error) });
      return null;
    }
  }

  /**
   * Decode a JWT token without verifying signature
   * Useful for checking payload before full verification
   */
  decodeToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload | null;
      return decoded;
    } catch (error) {
      logger.debug("Token decode error", { error: String(error) });
      return null;
    }
  }
}

export const jwtService = new JWTService();
