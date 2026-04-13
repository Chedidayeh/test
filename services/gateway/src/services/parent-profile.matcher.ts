import { User, ChildProfile, ParentUser } from "@shared/src/types";
import { logger } from "../utils/logger";

/**
 * ParentProfileMatcher: Matches Auth Service Parent with Progress Service ChildProfiles
 * Uses O(1) Map-based lookup for efficient joining
 */
export class ParentProfileMatcher {
  /**
   * Match parent with child profiles
   * Returns parent with matched children combining auth data and profile data
   * 
   * @param parent - User object with children array from Auth Service
   * @param profiles - ChildProfile[] array from Progress Service
   * @returns ParentUser with children array containing both auth and profile data
   */
  static match(parent: User, profiles: ChildProfile[]): ParentUser {
    // Create Map for O(1) lookup: childId -> ChildProfile
    const profileMap = new Map<string, ChildProfile>();
    profiles.forEach((profile) => {
      profileMap.set(profile.childId, profile);
    });

    // Create Map for O(1) lookup: childId -> Child (auth data)
    const childMap = new Map<string, typeof parent.children[0]>();
    parent.children?.forEach((child) => {
      childMap.set(child.id, child);
    });

    // Combine auth data with profile data
    const matchedChildren: any[] = [];
    const unmatchedChildIds: string[] = [];

    parent.children?.forEach((child) => {
      const profile = profileMap.get(child.id);
      if (profile) {
        // Combine profile data with auth data
        matchedChildren.push({
          ...profile,
          child: child, // Attach the auth child data to the profile
        });
      } else {
        unmatchedChildIds.push(child.id);
      }
    });

    // Log warnings for unmatched children
    if (unmatchedChildIds.length > 0) {
      logger.warn("Unmatched children during parent-profile matching", {
        parentId: parent.id,
        unmatchedChildIds,
        unmatchedCount: unmatchedChildIds.length,
        totalChildren: parent.children?.length || 0,
        matchedCount: matchedChildren.length,
      });
    }

    // Return ParentUser with matched children including both profile and auth data
    return {
      id: parent.id,
      email: parent.email,
      name: parent.name || undefined,
      image: parent.image || undefined,
      role: parent.role,
      newUser: parent.newUser,
      emailVerified: parent.emailVerified || undefined,
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
      children: matchedChildren,
    };
  }

  /**
   * Validate parent and profiles before matching
   * 
   * @param parent - User object with children array
   * @param profiles - ChildProfile[] array
   * @returns true if validation passes, false otherwise
   */
  static validate(parent: User | null, profiles: ChildProfile[]): boolean {
    if (!parent) {
      logger.warn("Parent is null or undefined during validation");
      return false;
    }

    if (!Array.isArray(profiles)) {
      logger.warn("Profiles is not an array during validation");
      return false;
    }

    if (!Array.isArray(parent.children)) {
      logger.warn("Parent has no children array", {
        parentId: parent.id,
      });
      return true; // Still valid - parent just has no children
    }

    if (parent.children.length === 0 && profiles.length > 0) {
      logger.warn("Parent has no children but profiles exist", {
        parentId: parent.id,
        profileCount: profiles.length,
      });
    }

    return true;
  }
}
