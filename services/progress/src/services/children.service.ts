import { PrismaClient } from "@prisma/client";
import { ChildProfile, ProgressStatus, PaginationMeta } from "@shared/types";

const prisma = new PrismaClient();

export class ChildrenService {
  /**
   * Fetch all children with their progress stats
   * Returns paginated results with optional filtering
   */
  static async getAllChildren(
    options: {
      limit?: number;
      offset?: number;
      searchTerm?: string;
    } = {},
  ): Promise<{
    children: ChildProfile[];
    pagination: PaginationMeta;
  }> {
    const limit = Math.min(options.limit || 10, 100); // Max 100 per page
    const offset = options.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    // Fetch child profiles with relations
    const childProfiles = await prisma.childProfile.findMany({
      skip: offset,
      take: limit,
      include: {
        progress: true,
        sessions: true,
        starEvents: true,
        challengeAttempts: true,
        badges: true,
      },
    });

    // Get total count
    const total = await prisma.childProfile.count();

    // Cast to ChildProfile[] - Prisma handles enum conversion
    const typedProfiles = childProfiles as unknown as ChildProfile[];

    return {
      children: typedProfiles,
      pagination: {
        total,
        page,
        pageSize: limit,
        hasMore: offset + limit < total,
      },
    };
  }

  /**
   * Fetch children for a specific child ID (single or multiple)
   */
  static async getChildrenByIds(childIds: string[]): Promise<ChildProfile[]> {
    const childProfiles = await prisma.childProfile.findMany({
      where: {
        childId: {
          in: childIds,
        },
      },
      include: {
        progress: true,
        sessions: true,
        starEvents: true,
        challengeAttempts: true,
        badges: true,
      },
    });

    // Cast to ChildProfile[] - Prisma handles enum conversion
    return childProfiles as unknown as ChildProfile[];
  }  
  /**
   * Get a single child profile by ID
   */
  static async getChildById(childProfileId: string): Promise<ChildProfile | null> {
    const childProfile = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
      include: {
        progress: true,
        sessions: true,
        starEvents: true,
        challengeAttempts: true,
        badges: true,
      },
    });

    if (!childProfile) return null;

    // Cast to ChildProfile - Prisma handles enum conversion
    return childProfile as unknown as ChildProfile;
  }
}
