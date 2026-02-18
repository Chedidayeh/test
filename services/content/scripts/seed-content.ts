/**
 * Database Seed Script for Content Service
 * Populates the database with test data for development and testing
 *
 * Run with: npx ts-node scripts/seed-content.ts
 * Or: npm run seed
 */

import { PrismaClient, ChallengeType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clean existing data
    console.log("🗑️  Cleaning existing data...");
    await Promise.all([
      prisma.badge.deleteMany(),
      prisma.answer.deleteMany(),
      prisma.challenge.deleteMany(),
      prisma.chapter.deleteMany(),
      prisma.story.deleteMany(),
      prisma.world.deleteMany(),
      prisma.roadmap.deleteMany(),
      prisma.milestone.deleteMany(),
      prisma.level.deleteMany(),
      prisma.theme.deleteMany(),
      prisma.ageGroup.deleteMany(),
    ]);

    // ============================================
    // Create Age Groups
    // ============================================
    console.log("📚 Creating age groups...");
    const ageGroup1 = await prisma.ageGroup.create({
      data: {
        name: "6-7 years",
        minAge: 6,
        maxAge: 7,
      },
    });

    const ageGroup2 = await prisma.ageGroup.create({
      data: {
        name: "8-9 years",
        minAge: 8,
        maxAge: 9,
      },
    });

    const ageGroup3 = await prisma.ageGroup.create({
      data: {
        name: "10-11 years",
        minAge: 10,
        maxAge: 11,
      },
    });

    // ============================================
    // Create Themes
    // ============================================
    console.log("🎨 Creating themes...");
    const themeAdventure = await prisma.theme.create({
      data: { name: "Adventure" },
    });

    const themeFantasy = await prisma.theme.create({
      data: { name: "Fantasy" },
    });

    const themeMystery = await prisma.theme.create({
      data: { name: "Mystery" },
    });

    // Reference to avoid unused variable TS6133
    console.log(`Created theme: ${themeMystery.id}`);

    const themeScienceFiction = await prisma.theme.create({
      data: { name: "Science Fiction" },
    });

    // ============================================
    // Create Roadmaps
    // ============================================
    console.log("🗺️  Creating roadmaps...");
    const roadmap1 = await prisma.roadmap.create({
      data: {
        ageGroupId: ageGroup1.id,
        themeId: themeAdventure.id,
      },
    });

    const roadmap2 = await prisma.roadmap.create({
      data: {
        ageGroupId: ageGroup2.id,
        themeId: themeFantasy.id,
      },
    });

    const roadmap3 = await prisma.roadmap.create({
      data: {
        ageGroupId: ageGroup3.id,
        themeId: themeScienceFiction.id,
      },
    });

    // ============================================
    // Create Worlds
    // ============================================
    console.log("🌍 Creating worlds...");
    const world1 = await prisma.world.create({
      data: {
        roadmapId: roadmap1.id,
        name: "The Enchanted Forest",
        description:
          "A magical forest filled with mysterious creatures and hidden treasures",
        order: 1,
        locked: false,
        requiredStarCount: 0,
      },
    });

    const world2 = await prisma.world.create({
      data: {
        roadmapId: roadmap1.id,
        name: "The Lost Castle",
        description: "An ancient castle with secrets waiting to be discovered",
        order: 2,
        locked: true,
        requiredStarCount: 100,
      },
    });

    const world3 = await prisma.world.create({
      data: {
        roadmapId: roadmap2.id,
        name: "Dragon's Lair",
        description: "A dangerous journey to face the legendary dragon",
        order: 1,
        locked: false,
        requiredStarCount: 0,
      },
    });

    const world4 = await prisma.world.create({
      data: {
        roadmapId: roadmap3.id,
        name: "Space Station Alpha",
        description: "Explore the mysteries of outer space",
        order: 1,
        locked: false,
        requiredStarCount: 0,
      },
    });

    // ============================================
    // Create Stories
    // ============================================
    console.log("📖 Creating stories...");
    const story1 = await prisma.story.create({
      data: {
        worldId: world1.id,
        title: "The Lost Treasure of Pirate's Cove",
        description:
          "Join Captain Jack on an adventure to find the lost pirate treasure hidden deep in the enchanted forest.",
        difficulty: 2,
        isMandatory: true,
        order: 1,
      },
    });

    const story2 = await prisma.story.create({
      data: {
        worldId: world1.id,
        title: "The Secret of the Whispering Trees",
        description:
          "Discover the ancient secrets that the mystical trees of the forest are trying to tell you.",
        difficulty: 3,
        isMandatory: false,
        order: 2,
      },
    });

    const story3 = await prisma.story.create({
      data: {
        worldId: world2.id,
        title: "Castle of Riddles",
        description:
          "Solve complex riddles to unlock the secrets of the ancient castle.",
        difficulty: 4,
        isMandatory: true,
        order: 1,
      },
    });

    const story4 = await prisma.story.create({
      data: {
        worldId: world3.id,
        title: "Brave Knight vs Dragon",
        description: "Face the mighty dragon in an epic battle of courage.",
        difficulty: 5,
        isMandatory: true,
        order: 1,
      },
    });

    // Reference to avoid unused variable TS6133
    console.log(`Created story: ${story4.id}`);

    const story5 = await prisma.story.create({
      data: {
        worldId: world4.id,
        title: "Alien Contact",
        description:
          "Make first contact with an alien civilization in the depths of space.",
        difficulty: 3,
        isMandatory: true,
        order: 1,
      },
    });

    // Reference to avoid unused variable TS6133
    console.log(`Created story: ${story5.id}`);

    // ============================================
    // Create Chapters & Challenges
    // ============================================
    console.log("📖 Creating chapters and challenges...");

    // Story 1: The Lost Treasure - Chapter 1
    const chapter1_1 = await prisma.chapter.create({
      data: {
        storyId: story1.id,
        title: "The Map Discovery",
        content:
          "You find an old, mysterious map in your grandfather's attic. The map shows a path through the enchanted forest leading to a hidden treasure. Are you brave enough to follow it?",
        order: 1,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter1_1.id,
        type: "MULTIPLE_CHOICE" as ChallengeType,
        question:
          "What should you do first before starting your treasure hunt?",
        description:
          "Think about what preparations are necessary for a dangerous journey.",
        maxAttempts: 3,
        baseStars: 20,
        order: 1,
        hints: [
          "Think about what you might need to survive in the forest",
          "Consider safety precautions",
        ],
        answers: {
          create: [
            { text: "Pack supplies and tell someone where you're going", isCorrect: true, order: 1 },
            { text: "Just follow the map without preparation", isCorrect: false, order: 2 },
            { text: "Ask the forest animals for help", isCorrect: false, order: 3 },
            { text: "Ignore the map and go home", isCorrect: false, order: 4 },
          ],
        },
      },
    });

    // Story 1: The Lost Treasure - Chapter 2
    const chapter1_2 = await prisma.chapter.create({
      data: {
        storyId: story1.id,
        title: "The Dark Forest",
        content:
          "You enter the dark forest with your supplies. The trees are so tall they block out the sun. You hear strange sounds all around you. The map points deeper into the forest.",
        order: 2,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter1_2.id,
        type: "RIDDLE" as ChallengeType,
        question: "I have cities but no houses, forests but no trees. What am I?",
        description: "Solve this ancient riddle to safely pass through the forest",
        maxAttempts: 4,
        baseStars: 25,
        order: 1,
        hints: ["It's something you hold in your hand", "Look at it from above", "It shows you places"],
        answers: {
          create: [
            { text: "A map", isCorrect: true, order: 1 },
            { text: "A painting", isCorrect: false, order: 2 },
            { text: "A dream", isCorrect: false, order: 3 },
            { text: "A book", isCorrect: false, order: 4 },
          ],
        },
      },
    });

    // Story 1: The Lost Treasure - Chapter 3
    const chapter1_3 = await prisma.chapter.create({
      data: {
        storyId: story1.id,
        title: "The Treasure Chest",
        content:
          "After hours of walking, you finally reach the spot marked on the map. There, half-buried in the ground, is an old treasure chest. Your heart races with excitement as you approach it.",
        order: 3,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter1_3.id,
        type: "CHOOSE_ENDING" as ChallengeType,
        question: "What do you do when you find the treasure chest?",
        description: "Choose the best action to take with the treasure",
        maxAttempts: 3,
        baseStars: 30,
        order: 1,
        hints: ["Think about what you promised yourself"],
        answers: {
          create: [
            {
              text: "Keep all the treasure for yourself and tell nobody",
              isCorrect: false,
              order: 1,
            },
            {
              text: "Share the treasure with those who helped you",
              isCorrect: true,
              order: 2,
            },
            {
              text: "Leave the treasure and go home",
              isCorrect: false,
              order: 3,
            },
            {
              text: "Hide the treasure even deeper",
              isCorrect: false,
              order: 4,
            },
          ],
        },
      },
    });

    // Story 2: The Secret of the Whispering Trees - Chapter 1
    const chapter2_1 = await prisma.chapter.create({
      data: {
        storyId: story2.id,
        title: "Whispers in the Wind",
        content:
          "One evening, as you walk through the forest, you hear soft whispers coming from the ancient trees. They seem to be calling to you. The sound is mysterious and magical.",
        order: 1,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter2_1.id,
        type: "TRUE_FALSE" as ChallengeType,
        question: "Trees can communicate with humans through sound.",
        description: "Decide if this magical possibility is true or false",
        maxAttempts: 2,
        baseStars: 15,
        order: 1,
        hints: ["In this magical forest, anything is possible"],
        answers: {
          create: [
            { text: "True", isCorrect: true, order: 1 },
            { text: "False", isCorrect: false, order: 2 },
          ],
        },
      },
    });

    // Story 3: Castle of Riddles - Chapter 1
    const chapter3_1 = await prisma.chapter.create({
      data: {
        storyId: story3.id,
        title: "The Castle Gates",
        content:
          "You stand before the massive gates of the ancient castle. The gates are sealed with magical locks that require riddles to be solved. A ghostly voice echoes from within.",
        order: 1,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter3_1.id,
        type: "RIDDLE" as ChallengeType,
        question: "The more you take, the more you leave behind. What am I?",
        description: "Solve the riddle to open the castle gates",
        maxAttempts: 4,
        baseStars: 35,
        order: 1,
        hints: [
          "Think about travel",
          "You leave something behind with every step",
          "It's measured in distance",
        ],
        answers: {
          create: [
            { text: "Footsteps", isCorrect: true, order: 1 },
            { text: "Money", isCorrect: false, order: 2 },
            { text: "Time", isCorrect: false, order: 3 },
            { text: "Bread crumbs", isCorrect: false, order: 4 },
          ],
        },
      },
    });

    // ============================================
    // Create Levels
    // ============================================
    console.log("⭐ Creating levels...");
    for (let i = 1; i <= 10; i++) {
      await prisma.level.create({
        data: {
          levelNumber: i,
          requiredStars: i * 100,
        },
      });
    }

    // ============================================
    // Create Milestones and Badges
    // ============================================
    console.log("🏆 Creating milestones and badges...");
    const milestonFirstStory = await prisma.milestone.create({
      data: {
        name: "First Story",
        description: "Complete your first story",
        type: "first_story",
      },
    });

    await prisma.badge.create({
      data: {
        name: "Story Starter",
        description: "You have started your reading journey!",
        iconUrl: "/badges/story-starter.png",
        milestoneId: milestonFirstStory.id,
      },
    });

    const milestoneChampion = await prisma.milestone.create({
      data: {
        name: "Reading Champion",
        description: "Complete 5 stories",
        type: "stories_count",
      },
    });

    await prisma.badge.create({
      data: {
        name: "Reading Champion",
        description: "You've completed 5 stories!",
        iconUrl: "/badges/reading-champion.png",
        milestoneId: milestoneChampion.id,
      },
    });

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Age Groups: 3`);
    console.log(`   - Themes: 4`);
    console.log(`   - Roadmaps: 3`);
    console.log(`   - Worlds: 4`);
    console.log(`   - Stories: 5`);
    console.log(`   - Chapters: 4`);
    console.log(`   - Challenges: 4`);
    console.log(`   - Levels: 10`);
    console.log(`   - Milestones: 2`);
    console.log(`   - Badges: 2`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();