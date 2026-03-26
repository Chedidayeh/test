import { PrismaClient } from "@prisma/client";
import { logger } from "../../../lib/logger";

const prisma = new PrismaClient();

/**
 * ISSUE 4 FIX: Rich narrative memory that prevents incoherent stories
 * Tracks characters, world state, narrative threads, and story history
 */

export interface CharacterInfo {
  name: string;
  role: string;
  personality: string;
  relationships: Record<string, string>;
  emotionalTrials: string[];
}

export interface WorldContext {
  locations: Record<string, { description: string; discovered: number }>;
  discoveries: Record<string, { description: string; significance: string }>;
  conflicts: string[];
  rules: Record<string, string>;
}

export interface NarrativeThread {
  name: string;
  introduced: number;
  status: "active" | "resolved" | "foreshadowed";
  description: string;
  keyEvents: string[];
  resolutionGoal?: string;
}

export async function updateNarrativeMemory(
  childProfileId: string,
  storyIndex: number,
  storyTitle: string,
  storyContent: any,
) {
  try {
    // Extract structured information from story
    const characters = extractCharacters(storyContent);
    const worldState = extractWorldState(storyContent);
    const threads = extractNarrativeThreads(storyContent);
    const summary = extractStorySummary(storyContent);
    const emotionalTone = extractEmotionalTone(storyContent);

    // Update or create memory
    let memory = await prisma.narrativeMemory.findUnique({
      where: { childProfileId },
      include: {
        characters: true,
        worldState: true,
        narrativeThreads: true,
        storyHistory: { take: 1, orderBy: { createdAt: "desc" } },
      },
    });

    if (!memory) {
      await prisma.narrativeMemory.create({
        data: { childProfileId },
      });

      // Fetch with relationships loaded
      memory = await prisma.narrativeMemory.findUnique({
        where: { childProfileId },
        include: {
          characters: true,
          worldState: true,
          narrativeThreads: true,
          storyHistory: { take: 1, orderBy: { createdAt: "desc" } },
        },
      });

      if (!memory) {
        throw new Error("Failed to create narrative memory");
      }
    }

    // Update characters (merge with existing)
    for (const char of characters) {
      const existing = memory.characters.find((c) => c.name === char.name);

      if (existing) {
        // Character seen before - update appearance tracking
        const updatedAppearances = Array.from(
          new Set([...existing.appearances, storyIndex])
        );
        const existingRelationships = (existing.relationships as Record<string, string>) || {};
        await prisma.narrativeCharacter.update({
          where: { id: existing.id },
          data: {
            appearances: updatedAppearances,
            lastSeenStory: storyIndex,
            relationships: { ...existingRelationships, ...char.relationships },
            emotionalTrials: Array.from(
              new Set([...existing.emotionalTrials, ...char.emotionalTrials])
            ),
          },
        });
      } else {
        // New character
        await prisma.narrativeCharacter.create({
          data: {
            memoryId: memory.id,
            name: char.name,
            role: char.role,
            firstAppearance: storyIndex,
            appearances: [storyIndex],
            personality: char.personality,
            relationships: char.relationships,
            emotionalTrials: char.emotionalTrials,
            lastSeenStory: storyIndex,
          },
        });
      }
    }

    // Update world state
    if (worldState) {
      await prisma.narrativeWorldState.upsert({
        where: { memoryId: memory.id },
        create: {
          memoryId: memory.id,
          locations: worldState.locations,
          discoveries: worldState.discoveries,
          conflicts: worldState.conflicts,
          rules: worldState.rules,
        },
        update: {
          locations: worldState.locations,
          discoveries: worldState.discoveries,
          conflicts: worldState.conflicts,
          rules: worldState.rules,
          lastUpdated: new Date(),
        },
      });
    }

    // Update narrative threads
    for (const thread of threads) {
      const existing = await prisma.narrativeThread.findFirst({
        where: { memoryId: memory.id, name: thread.name },
      });

      if (existing) {
        await prisma.narrativeThread.update({
          where: { id: existing.id },
          data: {
            status: thread.status,
            keyEvents: [...new Set([...existing.keyEvents, ...thread.keyEvents])],
            description: thread.description,
            resolutionGoal: thread.resolutionGoal || existing.resolutionGoal,
          },
        });
      } else {
        await prisma.narrativeThread.create({
          data: {
            memoryId: memory.id,
            name: thread.name,
            introducedInStory: storyIndex,
            status: thread.status,
            description: thread.description,
            keyEvents: thread.keyEvents,
            resolutionGoal: thread.resolutionGoal,
          },
        });
      }
    }

    // Add story to history
    await prisma.narrativeStoryRef.create({
      data: {
        memoryId: memory.id,
        storyIndex,
        title: storyTitle,
        summary,
        keyEvents: threads.flatMap((t) => t.keyEvents),
        emotionalTone,
      },
    });

    logger.info("[Memory] Updated rich narrative memory", {
      childProfileId,
      storyIndex,
      charactersCount: characters.length,
      threadsCount: threads.length,
    });
  } catch (error) {
    logger.error("[Memory] Failed to update narrative memory", {
      error: String(error),
      childProfileId,
      storyIndex: storyIndex,
    });
  }
}

/**
 * Retrieve narrative memory context for story generation
 * Used to inject previous story context into generation prompts
 */
export async function getNarrativeContext(
  childProfileId: string
): Promise<string> {
  try {
    const memory = await prisma.narrativeMemory.findUnique({
      where: { childProfileId },
      include: {
        characters: true,
        worldState: true,
        narrativeThreads: true,
        storyHistory: { take: 5, orderBy: { createdAt: "desc" } },
      },
    });

    if (!memory || memory.storyHistory.length === 0) {
      return "This is the first story. Establish the world vividly and introduce key characters.";
    }

    // Build context string from memory
    const lines: string[] = [];

    lines.push("## Previous Story Context:");
    for (const story of memory.storyHistory.reverse()) {
      lines.push(`- **${story.title}**: ${story.summary}`);
      lines.push(`  Tone: ${story.emotionalTone}`);
    }

    lines.push("\n## Key Characters:");
    for (const char of memory.characters) {
      lines.push(`- **${char.name}** (${char.role}): ${char.personality}`);
      if (char.emotionalTrials.length > 0) {
        lines.push(
          `  Experienced: ${char.emotionalTrials.join(", ")}`
        );
      }
    }

    lines.push("\n## World State:");
    if (memory.worldState) {
      const locationsObj = (memory.worldState.locations as Record<string, any>) || {};
      const locations = Object.entries(locationsObj);
      if (locations.length > 0) {
        lines.push("  Locations:");
        for (const [name, loc] of locations) {
          lines.push(`  - ${name}: ${(loc as any).description}`);
        }
      }

      const discoveriesObj = (memory.worldState.discoveries as Record<string, any>) || {};
      const discoveries = Object.entries(discoveriesObj);
      if (discoveries.length > 0) {
        lines.push("  Discoveries:");
        for (const [item, disc] of discoveries) {
          lines.push(`  - ${item}: ${(disc as any).description}`);
        }
      }

      const rulesObj = (memory.worldState.rules as Record<string, any>) || {};
      const rules = Object.entries(rulesObj);
      if (rules.length > 0) {
        lines.push("  World Rules:");
        for (const [rule, desc] of rules) {
          lines.push(`  - ${rule}: ${desc}`);
        }
      }
    }

    lines.push("\n## Active Story Threads:");
    for (const thread of memory.narrativeThreads.filter((t) => t.status === "active")) {
      lines.push(
        `- **${thread.name}** (introduced in story ${thread.introducedInStory})`
      );
      lines.push(`  Status: ${thread.status}`);
      if (thread.resolutionGoal) {
        lines.push(`  Goal: ${thread.resolutionGoal}`);
      }
    }

    return lines.join("\n");
  } catch (error) {
    logger.error("[Memory] Failed to retrieve narrative context", {
      error: String(error),
      childProfileId,
    });
    return "Unable to retrieve narrative context.";
  }
}

// ============================================================================
// HELPERS: Extract structured info from story content
// ============================================================================

/**
 * Extract character information from story content
 * Identifies protagonist, mentions, and character arcs
 */
function extractCharacters(storyContent: any): CharacterInfo[] {
  // TODO: Parse story chapters to identify characters
  // In production, use NLP library to extract named entities
  // For now, return placeholder structure

  const characters: CharacterInfo[] = [];

  try {
    const chapters = storyContent.chapters || [];

    // Scan chapters for character patterns
    // This is a simplified approach - production should use NLP
    for (const chapter of chapters) {
      const text = chapter.content || "";

      // Very basic pattern: look for quoted dialogue (character speaking)
      // Example: '"Hello," said Anna.' -> extract "Anna"
      const dialoguePattern = /["']([^"']+)["']\s+said\s+([A-Z][a-z]+)/g;
      let match;
      const foundNames = new Set<string>();

      while ((match = dialoguePattern.exec(text)) !== null) {
        foundNames.add(match[2]);
      }

      // Add characters (placeholder relationships)
      for (const name of foundNames) {
        if (
          !characters.find((c) => c.name === name)
        ) {
          characters.push({
            name,
            role: "character", // Would determine from context in production
            personality: "brave, curious", // Placeholder
            relationships: {},
            emotionalTrials: [],
          });
        }
      }
    }
  } catch (error) {
    logger.warn("[Memory] Error extracting characters", { error: String(error) });
  }

  return characters;
}

/**
 * Extract world state information from story
 * Identifies locations, discoveries, and world rules
 */
function extractWorldState(storyContent: any): WorldContext {
  // TODO: Parse story to identify world building elements
  // Use NLP or pattern matching for locations and rules

  const worldState: WorldContext = {
    locations: {},
    discoveries: {},
    conflicts: [],
    rules: {},
  };

  try {
    const chapters = storyContent.chapters || [];

    // Simple extraction: look for location mentions
    // Pattern: "In the [location]..." or "The [location] was..."
    for (const chapter of chapters) {
      const text = chapter.content || "";

      // Look for common world-building patterns
      const locationPattern = /(?:In|At|The)\s+([A-Z][a-z\s]+)(?:\s+was|\s+is|,)/g;
      let match;

      while ((match = locationPattern.exec(text)) !== null) {
        const location = match[1].trim();
        if (!worldState.locations[location]) {
          worldState.locations[location] = {
            description: "A location in the story world",
            discovered: 1, // Story index - would be more specific
          };
        }
      }
    }
  } catch (error) {
    logger.warn("[Memory] Error extracting world state", { error: String(error) });
  }

  return worldState;
}

/**
 * Extract narrative threads from story
 * Identifies plot lines, conflicts, and resolutions
 */
function extractNarrativeThreads(storyContent: any): NarrativeThread[] {
  // TODO: Use NLP to identify plot threads
  // Look for unresolved questions, conflicts, character arcs

  const threads: NarrativeThread[] = [];

  // Placeholder: would implement actual NLP-based extraction
  // For now, return empty to avoid hallucinating story content

  return threads;
}

/**
 * Extract summary of story events
 */
function extractStorySummary(storyContent: any): string {
  // TODO: Generate summary from chapters
  // Use NLP or template-based summarization

  try {
    const chapters = storyContent.chapters || [];
    const titles = chapters.map((c: any) => c.title).join("; ");
    return `A story with chapters: ${titles}`;
  } catch (error) {
    return "Story summary unavailable";
  }
}

/**
 * Detect emotional tone/mood of story
 */
function extractEmotionalTone(storyContent: any): string {
  // TODO: Analyze story language to detect tone
  // Look for emotional keywords, narrative style

  try {
    const text = JSON.stringify(storyContent).toLowerCase();

    // Very basic sentiment detection
    if (text.includes("danger") || text.includes("scary")) return "tense";
    if (text.includes("happy") || text.includes("joy")) return "joyful";
    if (text.includes("mystery") || text.includes("secret")) return "mysterious";
    if (text.includes("adventure")) return "exciting";
    if (text.includes("sad") || text.includes("loss")) return "melancholic";

    return "neutral";
  } catch (error) {
    return "neutral";
  }
}
