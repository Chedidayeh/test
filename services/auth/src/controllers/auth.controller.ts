import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { jwtService } from "../services/jwt.service";
import { generateChildLoginCode } from "../utils/generator";
import { logger } from "../utils/logger";
import { PrismaClient, RoleType } from "@prisma/client";
import { ApiResponse, Child, User } from "@shared/types";

const prisma = new PrismaClient();
const userService = new UserService(prisma);

export class AuthController {
  /**
   * Register a new user with email and password
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log("Register request body:", req.body); // Debug log for request body
      const { email, password, name } = req.body;

      logger.info("Register request received", {
        email,
        hasPassword: !!password,
        hasName: !!name,
      });

      // Validation
      if (!email || !password || !name) {
        logger.warn("Registration validation failed - missing fields", {
          email,
          hasPassword: !!password,
          hasName: !!name,
        });
        res.status(400).json({
          error: "Missing required fields: email, password, name",
        });
        return;
      }

      if (password.length < 8) {
        logger.warn("Registration validation failed - password too short", {
          email,
        });
        res.status(400).json({
          error: "Password must be at least 8 characters",
        });
        return;
      }

      // Create user
      logger.info("Creating user in database", { email });
      const user = await userService.createUser(email, password, name);

      if (!user) {
        logger.warn("User creation failed - user already exists", { email });
        res.status(409).json({
          error: "User already exists with this email",
        });
        return;
      }

      logger.info("User created successfully", { userId: user.id, email });

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          newUser: user.newUser,
        },
      });
    } catch (error) {
      logger.error("Register error", {
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
      });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Login with email and password
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        res.status(400).json({
          error: "Missing required fields: email, password",
        });
        return;
      }

      // Find user
      const user = await userService.findUserByEmail(email);

      if (!user) {
        res.status(401).json({
          error: "No account found with this email",
        });
        return;
      }

      // Verify password
      const isValid = await userService.verifyPassword(email, password);

      if (!isValid) {
        res.status(401).json({
          error: "Password is incorrect, please try again",
        });
        return;
      }

      // Generate JWT
      const token = jwtService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role as "PARENT" | "ADMIN",
      });

      // Create session record
      const sessionExpires = new Date(Date.now() + 86400 * 1000); // 24 hours
      await prisma.session
        .create({
          data: {
            sessionToken: token,
            userId: user.id,
            expires: sessionExpires,
          },
        })
        .catch((err) => {
          logger.error("Failed to create session", { error: String(err) });
        });

      logger.info("User logged in", { userId: user.id });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          newUser: user.newUser,
        },
      });
    } catch (error) {
      logger.error("Login error", { error: String(error) });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Create a child profile for a parent
   */
  async createChildProfile(req: Request, res: Response<ApiResponse<Child>>): Promise<void> {
    try {
      const { parentEmail, name, ageGroupId, themeIds } = req.body;

      // Validation
      if (!parentEmail || !name || !ageGroupId) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required fields: parentEmail, name, ageGroupId",
          },
          timestamp: new Date(),
        } as ApiResponse<Child>);
        return;
      }

      // Check if parent exists
      const parent = await userService.findUserByEmail(parentEmail);
      if (!parent) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Parent not found",
          },
          timestamp: new Date(),
        } as ApiResponse<Child>);
        return;
      }

      // Generate unique login code based on child's name
      const childLoginCode = generateChildLoginCode(name);

      // Create child profile
      const child = await userService.createChildProfile(
        parent.id,
        name,
        ageGroupId,
        childLoginCode,
        themeIds
      );

      if (!child) {
        res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create child profile",
          },
          timestamp: new Date(),
        } as ApiResponse<Child>);
        return;
      }

      logger.info("Child profile created", { childId: child.id, parentId: parent.id });

      res.status(201).json({
        success: true,
        data: child,
        timestamp: new Date(),
      } as ApiResponse<Child>);
    } catch (error) {
      logger.error("Create child profile error", { error: String(error) });
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        },
        timestamp: new Date(),
      } as ApiResponse<Child>);
    }
  }

  /**
   * Login child with login code
   */
  async loginChild(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          error: "Missing required field: code",
        });
        return;
      }

      // Find child by code
      const child = await userService.findChildByLoginCode(code);

      if (!child) {
        res.status(401).json({
          error: "Invalid login code",
        });
        return;
      }


      logger.info("Child logged in", { childId: child.id });

      res.json({
        user: {
          id: child.id,
          name: child.name,
          avatar: child.avatar,
          parentId: child.parentId,
        },
      });
    } catch (error) {
      logger.error("Login child error", { error: String(error) });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Logout user by deleting session
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(400).json({
          error: "Missing or invalid Authorization header",
        });
        return;
      }

      const token = authHeader.substring(7);

      // Delete the session
      await prisma.session
        .delete({
          where: { sessionToken: token },
        })
        .catch(() => null); // Ignore if session not found

      logger.info("User logged out");

      res.json({
        message: "Logged out successfully",
      });
    } catch (error) {
      logger.error("Logout error", { error: String(error) });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Get parent by ID
   */
  async getParentById(req: Request, res: Response<ApiResponse<User>>): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required parameter: id",
          },
          timestamp: new Date(),
        } as ApiResponse<User>);
        return;
      }

      logger.info("Get parent by ID request", { parentId: id });

      // Fetch parent from service
      const parent = await userService.findUserById(id);

      if (!parent) {
        logger.warn("Parent not found", { parentId: id });
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Parent not found",
          },
          timestamp: new Date(),
        } as ApiResponse<User>);
        return;
      }

      logger.info("Parent fetched successfully", { parentId: id });

      res.status(200).json({
        success: true,
        data: parent,
        timestamp: new Date(),
      } as ApiResponse<User>);
    } catch (error) {
      logger.error("Get parent by ID error", {
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
      });
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch parent",
        },
        timestamp: new Date(),
      } as ApiResponse<User>);
    }
  }

  /**
   * Verify token (utility endpoint)
   */
  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(400).json({
          error: "Missing or invalid Authorization header",
        });
        return;
      }

      const token = authHeader.substring(7);
      const payload = jwtService.verifyToken(token);

      if (!payload) {
        res.status(401).json({
          error: "Invalid or expired token",
        });
        return;
      }

      // Check if session exists and is not expired
      const session = await prisma.session.findUnique({
        where: { sessionToken: token },
      });

      if (!session || session.expires < new Date()) {
        res.status(401).json({
          error: "Session expired or invalid",
        });
        return;
      }

      res.json({
        valid: true,
        payload,
      });
    } catch (error) {
      logger.error("Verify token error", { error: String(error) });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Get all parents with pagination
   */
  async getParents(req: Request, res: Response): Promise<void> {
    try {
      // Extract and validate pagination params from query
      const limit = Math.min(
        Math.max(parseInt(req.query.limit as string) || 10, 1),
        100
      ); // Max 100 per page
      const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

      logger.info("Get parents request", { limit, offset });

      // Get parents from service
      const result = await userService.getAllParents(limit, offset);

      logger.info("Parents fetched successfully", {
        count: result.data.length,
        total: result.pagination.total,
      });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error("Get parents error", { error: String(error) });
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch parents",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get all children with role-based access control
   * ADMIN: sees all children
   * PARENT: sees only their own children
   * 
   * Query params:
   * - limit: pagination limit (default: 10, max: 100)
   * - offset: pagination offset (default: 0)
   * - childIds: comma-separated child IDs to filter by (optional)
   */
  async getChildren(req: Request, res: Response<ApiResponse<Child[]>>): Promise<void> {
    try {

      // Extract and validate pagination params
      const limit = Math.min(
        Math.max(parseInt(req.query.limit as string) || 10, 1),
        100
      ); // Max 100 per page
      const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

      // Extract child IDs filter (optional)
      const childIdsParam = req.query.childIds as string | undefined;
      const childIds = childIdsParam
        ? childIdsParam.split(",").filter((id) => id.trim())
        : undefined;

      logger.info("Get children request", {
        limit,
        offset,
        childIdsCount: childIds?.length,
      });

      // Get children from service (role-based filtering applied)
      const result = await userService.getAllChildren(
        limit,
        offset,
        childIds,
      );

      logger.info("Children fetched successfully", {
        count: result.data.length,
        total: result.pagination.total,
      });

      res.status(200).json({
        success: true,
        data: result.data as Child[],
        pagination: result.pagination,
        timestamp: new Date(),
      } as ApiResponse<Child[]>);
    } catch (error) {
      logger.error("Get children error", { error: String(error) });
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch children",
        },
        timestamp: new Date(),
      } as ApiResponse<Child[]>);
    }
  }
  /**
   * Get child by ID
   */
  async getChildById(req: Request, res: Response<ApiResponse<Child>>): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required parameter: id",
          },
          timestamp: new Date(),
        } as ApiResponse<Child>);
        return;
      }

      logger.info("Get child by ID request", { childId: id });

      // Fetch child from service
      const child = await userService.findChildById(id);

      if (!child) {
        logger.warn("Child not found", { childId: id });
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Child not found",
          },
          timestamp: new Date(),
        } as ApiResponse<Child>);
        return;
      }

      logger.info("Child fetched successfully", { childId: id });

      res.status(200).json({
        success: true,
        data: child,
        timestamp: new Date(),
      } as ApiResponse<Child>);
    } catch (error) {
      logger.error("Get child by ID error", {
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
      });
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch child",
        },
        timestamp: new Date(),
      } as ApiResponse<Child>);
    }
  }
}

export const authController = new AuthController();
