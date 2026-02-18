import { PrismaClient, User, RoleType, Child } from "@prisma/client";
import { hashPassword, comparePassword } from "../utils/hashing";
import { logger } from "../utils/logger";

export class UserService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new user with email and password
   */
  async createUser(
    email: string,
    password: string,
    name: string,
    role: RoleType = RoleType.PARENT,
  ): Promise<User | null> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        logger.warn("User already exists", { email });
        return null;
      }

      const hashedPassword = await hashPassword(password);

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
        },
      });

      logger.info("User created successfully", { userId: user.id, email });
      return user;
    } catch (error) {
      logger.error("Error creating user", { email, error: String(error) });
      return null;
    }
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      logger.error("Error finding user by email", {
        email,
        error: String(error),
      });
      return null;
    }
  }

  /**
   * Find user by ID
   */
  async findUserById(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error("Error finding user by ID", { id, error: String(error) });
      return null;
    }
  }

  /**
   * Verify user password
   */
  async verifyPassword(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.findUserByEmail(email);

      if (!user || !user.password) {
        return false;
      }

      return comparePassword(password, user.password);
    } catch (error) {
      logger.error("Error verifying password", { email, error: String(error) });
      return false;
    }
  }

  /**
   * Create a child profile
   */
  async createChildProfile(
    parentId: string,
    name: string,
    ageGroup: string,
    childLoginCode: string,
    avatar?: string,
    favoriteGenres?: string[],
  ): Promise<Child | null> {
    try {
      // Verify parent exists
      const parent = await this.findUserById(parentId);
      if (!parent) {
        logger.warn("Parent not found", { parentId });
        return null;
      }

      const child = await this.prisma.child.create({
        data: {
          parentId,
          name,
          loginCode: childLoginCode,
          avatar,
          ageGroup,
          favoriteGenres: favoriteGenres || [],
        },
      });

      // update parent user
      await this.prisma.user.update({
        where: { id: parentId },
        data: {
          newUser: false,
        },
      });

      logger.info("Child profile created", { childId: child.id, parentId });
      return child;
    } catch (error) {
      logger.error("Error creating child profile", {
        parentId,
        name,
        error: String(error),
      });
      return null;
    }
  }

  /**
   * Find child by login code
   */
  async findChildByLoginCode(code: string): Promise<Child | null> {
    try {
      return await this.prisma.child.findUnique({
        where: { loginCode: code },
        include: { parent: true },
      });
    } catch (error) {
      logger.error("Error finding child by login code", {
        error: String(error),
      });
      return null;
    }
  }

  /**
   * Get all children for a parent
   */
  async getChildrenForParent(parentId: string): Promise<Child[]> {
    try {
      return await this.prisma.child.findMany({
        where: {
          parentId,
        },
      });
    } catch (error) {
      logger.error("Error fetching children", {
        parentId,
        error: String(error),
      });
      return [];
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: RoleType): Promise<User | null> {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { role },
      });
    } catch (error) {
      logger.error("Error updating user role", {
        userId,
        role,
        error: String(error),
      });
      return null;
    }
  }

  /**
   * Get all parents with pagination
   */
  async getAllParents(limit: number = 10, offset: number = 0) {
    try {
      // Get total count of parents
      const total = await this.prisma.user.count({
        where: {
          role: RoleType.PARENT,
        },
      });

      // Get paginated parents with children relationship
      const parents = await this.prisma.user.findMany({
        where: {
          role: RoleType.PARENT,
        },
        include: {
          children: true,
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
      });

      const page = Math.floor(offset / limit) + 1;
      const pageSize = limit;
      const hasMore = offset + limit < total;

      return {
        data: parents,
        pagination: {
          total,
          page,
          pageSize,
          hasMore,
        },
      };
    } catch (error) {
      logger.error("Error fetching all parents", {
        limit,
        offset,
        error: String(error),
      });
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pageSize: limit,
          hasMore: false,
        },
      };
    }
  }

  /**
   * Get all children with pagination and role-based filtering
   * ADMIN: sees all children
   * PARENT: sees only their own children
   * 
   * @param limit - pagination limit (default: 10, max: 100)
   * @param offset - pagination offset (default: 0)
   * @param childIds - optional array of child IDs to filter by
   */
  async getAllChildren(
    limit: number = 10,
    offset: number = 0,
    childIds?: string[],
  ) {
    try {
      // Build where clause based on role and optional childIds filter
      const whereClause: any = {};

      // If childIds filter is provided, only fetch those specific children
      if (childIds && childIds.length > 0) {
        whereClause.id = {
          in: childIds,
        };
      }

      // Get total count
      const total = await this.prisma.child.count({
        where: whereClause,
      });

      // Get paginated children
      const children = await this.prisma.child.findMany({
        where: whereClause,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
      });

      const page = Math.floor(offset / limit) + 1;
      const pageSize = limit;
      const hasMore = offset + limit < total;

      return {
        data: children,
        pagination: {
          total,
          page,
          pageSize,
          hasMore,
        },
      };
    } catch (error) {
      logger.error("Error fetching all children", {
        limit,
        offset,
        childIdsCount: childIds?.length,
        error: String(error),
      });
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pageSize: limit,
          hasMore: false,
        },
      };
    }
  }
}
