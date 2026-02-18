/**
 * Child Profile Matcher Service
 *
 * Matches Child profiles from Auth Service with ChildProfile profiles from Progress Service.
 * Ensures complete ChildProfile objects with child data attached.
 *
 * Flow:
 * 1. Receive ChildProfile[] from Progress Service (contains childId reference)
 * 2. Receive Child[] from Auth Service
 * 3. Match by childId
 * 4. Return only matched ChildProfile[] with child property populated
 */

import { ChildProfile, Child } from "@shared/types";
import { logger } from "../utils/logger";

export class ChildProfileMatcher {
  /**
   * Match child profiles with auth children
   * Only returns ChildProfile where a matching Child exists
   *
   * @param profiles - ChildProfile[] from Progress Service
   * @param children - Child[] from Auth Service
   * @returns Matched ChildProfile[] with child property attached
   *
   * @example
   * const matched = ChildProfileMatcher.match(childProfiles, children);
   * // childProfiles[0].child is now populated with auth data
   */
  static match(
    profiles: ChildProfile[],
    children: Child[],
  ): ChildProfile[] {
    // Create a map of children by ID for O(1) lookup
    const childrenMap = new Map<string, Child>();
    children.forEach((child) => {
      childrenMap.set(child.id, child);
    });

    // Match profiles with children
    const matched: ChildProfile[] = [];
    const unmatched: string[] = [];

    profiles.forEach((profile) => {
      const child = childrenMap.get(profile.childId);

      if (child) {
        // Attach child data to profile
        matched.push({
          ...profile,
          child,
        });
      } else {
        unmatched.push(profile.childId);
      }
    });

    // Log matching results
    if (unmatched.length > 0) {
      logger.warn("Unmatched child profiles detected", {
        totalProfiles: profiles.length,
        matched: matched.length,
        unmatched: unmatched.length,
        unmatchedIds: unmatched,
      });
    } else {
      logger.debug("All profiles matched successfully", {
        total: matched.length,
      });
    }

    return matched;
  }

  /**
   * Validate that profiles and children arrays are compatible
   * @returns true if all appears valid, false otherwise
   */
  static validate(
    profiles: ChildProfile[],
    children: Child[],
  ): boolean {
    if (!Array.isArray(profiles) || !Array.isArray(children)) {
      logger.error("Invalid input to matcher - not arrays", {
        profilesIsArray: Array.isArray(profiles),
        childrenIsArray: Array.isArray(children),
      });
      return false;
    }

    if (profiles.length === 0) {
      logger.warn("No profiles to match");
      return false;
    }

    if (children.length === 0) {
      logger.warn("No children to match against");
      return false;
    }

    return true;
  }
}
