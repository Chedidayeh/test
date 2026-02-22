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
      data: {
        name: "Adventure",
        description: "Exciting journeys and exploration-focused stories.",
        imageUrl:
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      },
    });

    const themeFantasy = await prisma.theme.create({
      data: {
        name: "Fantasy",
        description:
          "Magical worlds filled with wonder and fantastical creatures.",
        imageUrl:
          "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
      },
    });

    const themeMystery = await prisma.theme.create({
      data: {
        name: "Mystery",
        description:
          "Puzzles, secrets, and stories that challenge deduction skills.",
        imageUrl:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      },
    });

    // Reference to avoid unused variable TS6133
    console.log(`Created theme: ${themeMystery.id}`);

    const themeScienceFiction = await prisma.theme.create({
      data: {
        name: "Science Fiction",
        description:
          "Futuristic and space-themed adventures exploring technology.",
        imageUrl:
          "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
      },
    });

    const themeNature = await prisma.theme.create({
      data: {
        name: "Nature",
        description:
          "Stories focused on nature, wildlife and outdoor exploration.",
        imageUrl:
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
      },
    });

    const themeLegends = await prisma.theme.create({
      data: {
        name: "Legends",
        description: "Myths, folklore and legendary tales from many cultures.",
        imageUrl:
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
      },
    });

    // ============================================
    // Create Roadmaps
    // ============================================
    console.log("🗺️  Creating roadmaps...");
    // Two roadmaps per age group
    const roadmap1 = await prisma.roadmap.create({
      data: { ageGroupId: ageGroup1.id, themeId: themeAdventure.id },
    });

    const roadmap1b = await prisma.roadmap.create({
      data: { ageGroupId: ageGroup1.id, themeId: themeMystery.id },
    });

    const roadmap2 = await prisma.roadmap.create({
      data: { ageGroupId: ageGroup2.id, themeId: themeFantasy.id },
    });

    const roadmap2b = await prisma.roadmap.create({
      data: { ageGroupId: ageGroup2.id, themeId: themeLegends.id },
    });

    const roadmap3 = await prisma.roadmap.create({
      data: { ageGroupId: ageGroup3.id, themeId: themeScienceFiction.id },
    });

    const roadmap3b = await prisma.roadmap.create({
      data: { ageGroupId: ageGroup3.id, themeId: themeNature.id },
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
        imageUrl:
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
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
        imageUrl:
          "https://images.unsplash.com/photo-1509927083840-4f44d1b0b0e6?auto=format&fit=crop&w=1200&q=80",
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
        imageUrl:
          "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80",
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
        imageUrl:
          "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
        order: 1,
        locked: false,
        requiredStarCount: 0,
      },
    });

    // ========== ROADMAP 1B: MYSTERY WORLDS (6-7 years) ==========
    const world5 = await prisma.world.create({
      data: {
        roadmapId: roadmap1b.id,
        name: "The Secret Library",
        description:
          "A mysterious library filled with hidden books and secret passages",
        imageUrl:
          "https://images.unsplash.com/photo-150784272343-583f20270319?auto=format&fit=crop&w=1200&q=80",
        order: 1,
        locked: false,
        requiredStarCount: 0,
      },
    });

    // ========== ROADMAP 2B: LEGENDS WORLDS (8-9 years) ==========
    const world6 = await prisma.world.create({
      data: {
        roadmapId: roadmap2b.id,
        name: "Kingdom of Ancient Heroes",
        description:
          "A legendary realm where tales of heroic deeds come to life",
        imageUrl:
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
        order: 1,
        locked: false,
        requiredStarCount: 0,
      },
    });

    const world7 = await prisma.world.create({
      data: {
        roadmapId: roadmap2b.id,
        name: "The Enchanted Mountains",
        description:
          "Mythical mountains where legendary creatures guard ancient wisdom",
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
        order: 2,
        locked: true,
        requiredStarCount: 120,
      },
    });

    // ========== ROADMAP 3B: NATURE WORLDS (10-11 years) ==========
    const world8 = await prisma.world.create({
      data: {
        roadmapId: roadmap3b.id,
        name: "The Lost Jungle",
        description:
          "An unexplored jungle teeming with exotic wildlife and hidden wonders",
        imageUrl:
          "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
        order: 1,
        locked: false,
        requiredStarCount: 0,
      },
    });

    const world9 = await prisma.world.create({
      data: {
        roadmapId: roadmap3b.id,
        name: "Ocean's Deep Mysteries",
        description:
          "Dive into the ocean to discover bioluminescent creatures and sunken civilizations",
        imageUrl:
          "https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=1200&q=80",
        order: 2,
        locked: true,
        requiredStarCount: 150,
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

    // ===== STORY 6: The Whispering Books (Mystery World - 6-7 years, Difficulty 2) =====
    const story6 = await prisma.story.create({
      data: {
        worldId: world5.id,
        title: "The Whispering Books",
        description:
          "In the Secret Library, ancient books whisper secrets to those who listen carefully. Decode messages hidden in stories.",
        difficulty: 2,
        isMandatory: true,
        order: 1,
      },
    });

    // ===== STORY 7: The Hero's Quest (Legends World - 8-9 years, Difficulty 3) =====
    const story7 = await prisma.story.create({
      data: {
        worldId: world6.id,
        title: "The Hero's Quest",
        description:
          "Discover your inner hero by completing legendary trials and earning the respect of ancient warriors.",
        difficulty: 3,
        isMandatory: true,
        order: 1,
      },
    });

    // ===== STORY 8: The Phoenix's Test (Enchanted Mountains - 8-9 years, Difficulty 4) =====
    const story8 = await prisma.story.create({
      data: {
        worldId: world7.id,
        title: "The Phoenix's Test",
        description:
          "Face the legendary phoenix to prove your wisdom and unlock the secrets of rebirth and transformation.",
        difficulty: 4,
        isMandatory: true,
        order: 1,
      },
    });

    // ===== STORY 9: Jungle Explorer's Expedition (Lost Jungle - 10-11 years, Difficulty 4) =====
    const story9 = await prisma.story.create({
      data: {
        worldId: world8.id,
        title: "Jungle Explorer's Expedition",
        description:
          "Explore the untamed jungle, discover exotic wildlife, decipher ancient inscriptions, and survive nature's challenges.",
        difficulty: 4,
        isMandatory: true,
        order: 1,
      },
    });

    // ===== STORY 10: The Atlantis Mystery (Ocean Deep - 10-11 years, Difficulty 5) =====
    const story10 = await prisma.story.create({
      data: {
        worldId: world9.id,
        title: "The Atlantis Mystery",
        description:
          "Dive deep into the ocean to uncover the lost civilization of Atlantis and its advanced technologies.",
        difficulty: 5,
        isMandatory: true,
        order: 1,
      },
    });

    // ============================================
    // Create Chapters & Challenges
    // ============================================
    console.log("📖 Creating chapters and challenges...");

    // ===== STORY 1: The Lost Treasure (Difficulty 2) - Easy to Medium =====
    // Total stars: 75 (contributes to Level 1-2)
    const chapter1_1 = await prisma.chapter.create({
      data: {
        storyId: story1.id,
        title: "The Map Discovery",
        content:
          "You find an old, mysterious map in your grandfather's attic. The map shows a path through the enchanted forest leading to a hidden treasure. The parchment is yellowed with age, and an X marks the spot. Are you brave enough to follow it?",
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
        baseStars: 15,
        order: 1,
        hints: [
          "Think about what you might need to survive in the forest",
          "Consider safety precautions",
          "Tell someone where you're going",
        ],
        answers: {
          create: [
            {
              text: "Pack supplies and tell someone where you're going",
              isCorrect: true,
              order: 1,
            },
            {
              text: "Just follow the map without preparation",
              isCorrect: false,
              order: 2,
            },
            {
              text: "Ask the forest animals for help",
              isCorrect: false,
              order: 3,
            },
            { text: "Ignore the map and go home", isCorrect: false, order: 4 },
          ],
        },
      },
    });

    const chapter1_2 = await prisma.chapter.create({
      data: {
        storyId: story1.id,
        title: "The Dark Forest",
        content:
          "You enter the dark forest with your supplies. The trees are so tall they block out the sun. You hear strange sounds all around you. The map points deeper into the forest. Suddenly, you see glowing eyes watching from the shadows.",
        order: 2,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter1_2.id,
        type: "RIDDLE" as ChallengeType,
        question:
          "I have cities but no houses, forests but no trees. What am I?",
        description:
          "Solve this ancient riddle to safely pass through the forest",
        maxAttempts: 4,
        baseStars: 20,
        order: 1,
        hints: [
          "It's something you hold in your hand",
          "Look at it from above",
          "It shows you places",
        ],
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

    const chapter1_3 = await prisma.chapter.create({
      data: {
        storyId: story1.id,
        title: "Guardians of the Forest",
        content:
          "As you go deeper, you meet the Forest Guardians - mystical creatures that protect the woods. They question your intentions. They seem to decide whether to help or stop you based on your answers.",
        order: 3,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter1_3.id,
        type: "MORAL_DECISION" as ChallengeType,
        question: "A Forest Guardian blocks your path. What do you do?",
        description: "Show respect for the forest and its inhabitants",
        maxAttempts: 3,
        baseStars: 20,
        order: 1,
        hints: [
          "The forest spirits like those who respect nature",
          "Be humble and honest",
        ],
        answers: {
          create: [
            {
              text: "Bow respectfully and explain why you seek the treasure",
              isCorrect: true,
              order: 1,
            },
            {
              text: "Try to sneak past them without being seen",
              isCorrect: true,
              order: 2,
            },
            {
              text: "Attack them to clear the path",
              isCorrect: true,
              order: 3,
            },
            {
              text: "Ignore them and continue walking",
              isCorrect: true,
              order: 4,
            },
          ],
        },
      },
    });

    const chapter1_4 = await prisma.chapter.create({
      data: {
        storyId: story1.id,
        title: "The Treasure Chest",
        content:
          "After hours of walking, you finally reach the spot marked on the map. There, half-buried in the ground, is an old treasure chest. Your heart races with excitement as you approach it. The chest is locked with a puzzle lock.",
        order: 4,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter1_4.id,
        type: "CHOOSE_ENDING" as ChallengeType,
        question: "What do you do when you find the treasure chest?",
        description: "Make a wise decision about the treasure",
        maxAttempts: 3,
        baseStars: 20,
        order: 1,
        hints: [
          "Think about what you promised yourself",
          "True wealth is shared wealth",
        ],
        answers: {
          create: [
            {
              text: "Keep all the treasure for yourself and tell nobody",
              isCorrect: true,
              order: 1,
            },
            {
              text: "Share the treasure with those who helped you",
              isCorrect: true,
              order: 2,
            },
            {
              text: "Leave the treasure and go home",
              isCorrect: true,
              order: 3,
            },
            {
              text: "Hide the treasure even deeper",
              isCorrect: true,
              order: 4,
            },
          ],
        },
      },
    });

    // ===== STORY 2: The Secret of the Whispering Trees (Difficulty 3) - Medium =====
    // Total stars: 85 (contributes to Level 2-3)
    const chapter2_1 = await prisma.chapter.create({
      data: {
        storyId: story2.id,
        title: "Whispers in the Wind",
        content:
          "One evening, as you walk through the forest, you hear soft whispers coming from the ancient trees. They seem to be calling to you. The sound is mysterious and magical. The trees glow with a faint blue light.",
        order: 1,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter2_1.id,
        type: "TRUE_FALSE" as ChallengeType,
        question: "Trees can communicate with humans through sound.",
        description:
          "Decide if this magical possibility is true or false in this magical forest",
        maxAttempts: 2,
        baseStars: 15,
        order: 1,
        hints: [
          "In this magical forest, anything is possible",
          "Magic is real here",
        ],
        answers: {
          create: [
            { text: "True", isCorrect: true, order: 1 },
            { text: "False", isCorrect: false, order: 2 },
          ],
        },
      },
    });

    const chapter2_2 = await prisma.chapter.create({
      data: {
        storyId: story2.id,
        title: "The Ancient Language",
        content:
          "You realize the whispers are actually an ancient language. The trees are telling a story of their history. You must understand what they're trying to tell you about a great danger that once threatened the forest.",
        order: 2,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter2_2.id,
        type: "MULTIPLE_CHOICE" as ChallengeType,
        question: "What danger do you think the trees are warning you about?",
        description: "Listen carefully to the forest's ancient warnings",
        maxAttempts: 3,
        baseStars: 20,
        order: 1,
        hints: [
          "The trees whisper of a great fire",
          "Think about what harms forests",
          "Nature's biggest threats",
        ],
        answers: {
          create: [
            {
              text: "A terrible forest fire that destroyed everything",
              isCorrect: true,
              order: 1,
            },
            { text: "A boring drought", isCorrect: false, order: 2 },
            { text: "A single fallen tree", isCorrect: false, order: 3 },
            { text: "Animals eating the leaves", isCorrect: false, order: 4 },
          ],
        },
      },
    });

    const chapter2_3 = await prisma.chapter.create({
      data: {
        storyId: story2.id,
        title: "The Guardian's Task",
        content:
          "The oldest tree in the forest reveals that you have been chosen as its Guardian. You must protect the forest and share its secrets with others who will respect it.",
        order: 3,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter2_3.id,
        type: "MORAL_DECISION" as ChallengeType,
        question:
          "As the Forest Guardian, what's your most important responsibility?",
        description: "Consider what truly protects the forest",
        maxAttempts: 3,
        baseStars: 25,
        order: 1,
        hints: [
          "A guardian educates and protects",
          "Share knowledge to create more guardians",
        ],
        answers: {
          create: [
            {
              text: "Teach others to love and protect the forest",
              isCorrect: true,
              order: 1,
            },
            {
              text: "Keep the forest secret from everyone",
              isCorrect: true,
              order: 2,
            },
            {
              text: "Take resources from the forest for yourself",
              isCorrect: true,
              order: 3,
            },
            {
              text: "Do nothing and let nature take its course",
              isCorrect: true,
              order: 4,
            },
          ],
        },
      },
    });

    const chapter2_4 = await prisma.chapter.create({
      data: {
        storyId: story2.id,
        title: "The Oath of the Guardian",
        content:
          "You place your hand on the ancient tree and feel a warm energy flowing through you. You have become a Guardian of the Forest, with the power to protect it and those who enter it.",
        order: 4,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter2_4.id,
        type: "RIDDLE" as ChallengeType,
        question: "What grows taller the more it eats, but dies if it drinks?",
        description: "A final test of wisdom from the ancient trees",
        maxAttempts: 4,
        baseStars: 25,
        order: 1,
        hints: [
          "Think of something that consumes things",
          "Fire destroys when water touches it",
        ],
        answers: {
          create: [
            { text: "Fire", isCorrect: true, order: 1 },
            { text: "A tree", isCorrect: false, order: 2 },
            { text: "A person", isCorrect: false, order: 3 },
            { text: "The wind", isCorrect: false, order: 4 },
          ],
        },
      },
    });

    // ===== STORY 3: Castle of Riddles (Difficulty 4) - Medium to Hard =====
    // Total stars: 120 (contributes to Level 3-4)
    const chapter3_1 = await prisma.chapter.create({
      data: {
        storyId: story3.id,
        title: "The Castle Gates",
        content:
          "You stand before the massive gates of the ancient castle. The gates are sealed with magical locks that require riddles to be solved. A ghostly voice echoes from within, challenging you to prove your wisdom.",
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
        baseStars: 25,
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

    const chapter3_2 = await prisma.chapter.create({
      data: {
        storyId: story3.id,
        title: "The Riddle Hall",
        content:
          "The gates open to reveal a grand hall filled with doors. Each door has a riddle lock. You must solve three riddles to reach the chamber at the end. The castle walls seem to watch your every move.",
        order: 2,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter3_2.id,
        type: "RIDDLE" as ChallengeType,
        question:
          "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        description: "Second riddle of the castle - open the middle door",
        maxAttempts: 4,
        baseStars: 30,
        order: 1,
        hints: [
          "Think of something that makes sound",
          "It bounces off walls",
          "You hear it in canyons",
        ],
        answers: {
          create: [
            { text: "An echo", isCorrect: true, order: 1 },
            { text: "A ghost", isCorrect: false, order: 2 },
            { text: "The wind", isCorrect: false, order: 3 },
            { text: "A song", isCorrect: false, order: 4 },
          ],
        },
      },
    });

    const chapter3_3 = await prisma.chapter.create({
      data: {
        storyId: story3.id,
        title: "The Chamber of Choices",
        content:
          "Finally, you reach the inner chamber. Here you find three ancient books, each containing the knowledge to either destroy or save the castle. You must choose wisely - this decision will determine the castle's fate.",
        order: 3,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter3_3.id,
        type: "MORAL_DECISION" as ChallengeType,
        question: "What should you do with the castle's ancient knowledge?",
        description: "This is the most important decision in the castle",
        maxAttempts: 3,
        baseStars: 35,
        order: 1,
        hints: [
          "True power is in sharing knowledge responsibly",
          "Who should benefit from this wisdom?",
        ],
        answers: {
          create: [
            {
              text: "Share it with scholars who will preserve and teach it",
              isCorrect: true,
              order: 1,
            },
            {
              text: "Destroy it so no one can ever use it",
              isCorrect: true,
              order: 2,
            },
            {
              text: "Keep it hidden for yourself alone",
              isCorrect: true,
              order: 3,
            },
            {
              text: "Let it be and leave without touching anything",
              isCorrect: true,
              order: 4,
            },
          ],
        },
      },
    });

    const chapter3_4 = await prisma.chapter.create({
      data: {
        storyId: story3.id,
        title: "The Castle's Blessing",
        content:
          "The castle's ancient spirit is pleased with your wisdom. The castle's curse is lifted, and it transforms into a center of learning. You are honored as the one who freed it from its lonely imprisonment.",
        order: 4,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter3_4.id,
        type: "RIDDLE" as ChallengeType,
        question:
          "I have keys but no locks. I have space but no room. You can enter, but you cannot go inside. What am I?",
        description: "Final riddle - the castle's ultimate test",
        maxAttempts: 4,
        baseStars: 30,
        order: 1,
        hints: [
          "Think about musical instruments",
          "Or objects with a layout",
          "A keyboard perhaps?",
        ],
        answers: {
          create: [
            { text: "A piano", isCorrect: true, order: 1 },
            { text: "A house", isCorrect: false, order: 2 },
            { text: "A book", isCorrect: false, order: 3 },
            { text: "A map", isCorrect: false, order: 4 },
          ],
        },
      },
    });

    // ===== STORY 4: Brave Knight vs Dragon (Difficulty 5) - Hard =====
    // Total stars: 140 (contributes to Level 4-5)
    const chapter4_1 = await prisma.chapter.create({
      data: {
        storyId: story4.id,
        title: "Call to Adventure",
        content:
          "The kingdom is in danger. A terrible dragon has awakened from its thousand-year slumber in the mountains. The beast destroys crops and threatens villages. The king calls for the bravest knight to face the dragon and save the realm.",
        order: 1,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter4_1.id,
        type: "MORAL_DECISION" as ChallengeType,
        question: "Why do you choose to face the dragon?",
        description: "Your motivation determines how the dragon will see you",
        maxAttempts: 3,
        baseStars: 25,
        order: 1,
        hints: [
          "True heroism comes from protecting others",
          "The dragon might respect noble intentions",
        ],
        answers: {
          create: [
            {
              text: "To protect the innocent people of the kingdom",
              isCorrect: true,
              order: 1,
            },
            {
              text: "To become famous and gain glory",
              isCorrect: true,
              order: 2,
            },
            {
              text: "To get the reward the king promised",
              isCorrect: true,
              order: 3,
            },
            {
              text: "To prove you're stronger than everyone",
              isCorrect: true,
              order: 4,
            },
          ],
        },
      },
    });

    const chapter4_2 = await prisma.chapter.create({
      data: {
        storyId: story4.id,
        title: "The Mountain Ascent",
        content:
          "You climb the treacherous mountain paths toward the dragon's lair. The air grows hotter as you approach. You see the remains of previous adventurers' failed attempts. Your courage is tested with every step.",
        order: 2,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter4_2.id,
        type: "RIDDLE" as ChallengeType,
        question: "I am always coming but never arrive. What am I?",
        description: "Solve this to find strength for the journey ahead",
        maxAttempts: 4,
        baseStars: 30,
        order: 1,
        hints: [
          "Something that's always approaching",
          "In the future",
          "But never in the present",
        ],
        answers: {
          create: [
            { text: "Tomorrow", isCorrect: true, order: 1 },
            { text: "Night", isCorrect: false, order: 2 },
            { text: "The rain", isCorrect: false, order: 3 },
            { text: "A storm", isCorrect: false, order: 4 },
          ],
        },
      },
    });

    const chapter4_3 = await prisma.chapter.create({
      data: {
        storyId: story4.id,
        title: "Face to Face with the Dragon",
        content:
          "You finally reach the dragon's lair. The magnificent creature is larger than three houses. Its eyes open, golden and intelligent. It speaks in a voice like thunder, asking why you dare enter its domain.",
        order: 3,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter4_3.id,
        type: "MORAL_DECISION" as ChallengeType,
        question: "The dragon asks what you truly seek. How do you respond?",
        description: "Your honesty and wisdom matter here",
        maxAttempts: 3,
        baseStars: 35,
        order: 1,
        hints: [
          "Dragons respect honesty and wisdom",
          "Say what you truly believe",
        ],
        answers: {
          create: [
            {
              text: "I've come to protect innocent lives from being hurt",
              isCorrect: true,
              order: 1,
            },
            {
              text: "I've come to kill you and save the kingdom",
              isCorrect: true,
              order: 2,
            },
            {
              text: "I've come for the treasure in your lair",
              isCorrect: true,
              order: 3,
            },
            {
              text: "I've come to prove myself worthy of glory",
              isCorrect: true,
              order: 4,
            },
          ],
        },
      },
    });

    const chapter4_4 = await prisma.chapter.create({
      data: {
        storyId: story4.id,
        title: "The Unexpected Truth",
        content:
          "The dragon is surprised by your honesty. It reveals that it never wanted to hurt anyone - it was simply lonely and scared. A curse had been placed on it, forcing it to act destructively. Together, you realize there's a better solution than battle.",
        order: 4,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter4_4.id,
        type: "CHOOSE_ENDING" as ChallengeType,
        question:
          "What is the best ending for both the dragon and the kingdom?",
        description: "Find a solution that shows true heroism",
        maxAttempts: 3,
        baseStars: 50,
        order: 1,
        hints: [
          "True heroism is finding peace, not violence",
          "Both can benefit from understanding",
        ],
        answers: {
          create: [
            {
              text: "Help the dragon break the curse and live peacefully in the mountains",
              isCorrect: true,
              order: 1,
            },
            {
              text: "Lead an army to destroy the dragon despite the curse",
              isCorrect: true,
              order: 2,
            },
            {
              text: "Trap the dragon in a magical prison forever",
              isCorrect: true,
              order: 3,
            },
            {
              text: "Leave the dragon and return empty-handed to the king",
              isCorrect: true,
              order: 4,
            },
          ],
        },
      },
    });

    // ===== STORY 5: Alien Contact (Difficulty 3) - Medium =====
    // Total stars: 95 (contributes to Level 3-4)
    const chapter5_1 = await prisma.chapter.create({
      data: {
        storyId: story5.id,
        title: "Signal from the Void",
        content:
          "As a space explorer on the distant Space Station Alpha, you detect a strange signal coming from deep space. It's unlike anything in your database. The signal appears to be intentional - a message from an intelligent source.",
        order: 1,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter5_1.id,
        type: "MULTIPLE_CHOICE" as ChallengeType,
        question: "What should be your first action upon detecting the signal?",
        description: "Choose the wisest scientific response",
        maxAttempts: 3,
        baseStars: 20,
        order: 1,
        hints: [
          "Follow scientific protocol",
          "Safety and verification are important",
        ],
        answers: {
          create: [
            {
              text: "Analyze the signal carefully and verify its source",
              isCorrect: true,
              order: 1,
            },
            {
              text: "Immediately broadcast a response to all galaxies",
              isCorrect: false,
              order: 2,
            },
            {
              text: "Ignore the signal and report nothing",
              isCorrect: false,
              order: 3,
            },
            {
              text: "Activate weapons systems just in case",
              isCorrect: false,
              order: 4,
            },
          ],
        },
      },
    });

    const chapter5_2 = await prisma.chapter.create({
      data: {
        storyId: story5.id,
        title: "Decoding the Message",
        content:
          "After weeks of analysis, you crack the signal's code. It's a message from an alien civilization 200 light-years away. They claim to be peaceful and curious about other life in the universe. They're asking if anyone is listening.",
        order: 2,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter5_2.id,
        type: "RIDDLE" as ChallengeType,
        question:
          "The aliens ask: 'What do all intelligent species share?' What is the answer?",
        description: "Think about what unites all who think and learn",
        maxAttempts: 4,
        baseStars: 25,
        order: 1,
        hints: [
          "All intelligence comes from this",
          "It's the desire to understand",
        ],
        answers: {
          create: [
            {
              text: "The desire to understand the universe",
              isCorrect: true,
              order: 1,
            },
            { text: "The need to build weapons", isCorrect: false, order: 2 },
            { text: "The quest for power", isCorrect: false, order: 3 },
            { text: "The wish for money", isCorrect: false, order: 4 },
          ],
        },
      },
    });

    const chapter5_3 = await prisma.chapter.create({
      data: {
        storyId: story5.id,
        title: "First Contact Decision",
        content:
          "Now comes the greatest question. Should you respond to the aliens? The message could reach them in 200 years. This decision will shape the future of both civilizations. You must decide carefully.",
        order: 3,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter5_3.id,
        type: "MORAL_DECISION" as ChallengeType,
        question: "How should humanity respond to the alien civilization?",
        description: "Make the wisest choice for humanity's future",
        maxAttempts: 3,
        baseStars: 30,
        order: 1,
        hints: [
          "Consider both opportunity and risk",
          "Open communication leads to understanding",
        ],
        answers: {
          create: [
            {
              text: "Send a peaceful reply sharing knowledge to build friendship",
              isCorrect: true,
              order: 1,
            },
            {
              text: "Expose our location and military technology",
              isCorrect: true,
              order: 2,
            },
            {
              text: "Never respond and hide from alien contact",
              isCorrect: true,
              order: 3,
            },
            {
              text: "Send false information to confuse them",
              isCorrect: true,
              order: 4,
            },
          ],
        },
      },
    });

    const chapter5_4 = await prisma.chapter.create({
      data: {
        storyId: story5.id,
        title: "Bridge Between Worlds",
        content:
          "Your message is sent. Though it will take 200 years to arrive, you have opened a door to the stars. Humanity now looks upward with hope for peaceful contact. You are the bridge between two worlds.",
        order: 4,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter5_4.id,
        type: "TRUE_FALSE" as ChallengeType,
        question:
          "Communication between species requires mutual understanding and respect.",
        description: "Reflect on the meaning of first contact",
        maxAttempts: 2,
        baseStars: 20,
        order: 1,
        hints: ["Think about what makes peaceful contact possible"],
        answers: {
          create: [
            { text: "True", isCorrect: true, order: 1 },
            { text: "False", isCorrect: false, order: 2 },
          ],
        },
      },
    });

    // ===== STORY 6: The Whispering Books (Difficulty 2) - Easy to Medium =====
    // Total stars: 70 (contributes to Level 1-2)
    const chapter6_1 = await prisma.chapter.create({
      data: {
        storyId: story6.id,
        title: "Welcome to the Secret Library",
        content:
          "You step into an ancient library where dust dances in moonlight. Books line endless shelves, and you hear faint whispers. A special book catches your eye, glowing softly on a pedestal.",
        order: 1,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter6_1.id,
        type: "MULTIPLE_CHOICE" as ChallengeType,
        question: "What do you do when you see the glowing book?",
        description: "Choose wisely - this book may hold important secrets",
        maxAttempts: 3,
        baseStars: 15,
        order: 1,
        hints: [
          "The glow suggests it's special",
          "Knowledge is found in books",
          "Approach with curiosity",
        ],
        answers: {
          create: [
            {
              text: "Carefully open the glowing book to read it",
              isCorrect: true,
              order: 1,
            },
            {
              text: "Run away from the spooky library",
              isCorrect: false,
              order: 2,
            },
            { text: "Ignore the book and leave", isCorrect: false, order: 3 },
            {
              text: "Try to steal the book without reading",
              isCorrect: false,
              order: 4,
            },
          ],
        },
      },
    });

    const chapter6_2 = await prisma.chapter.create({
      data: {
        storyId: story6.id,
        title: "Decoding the Secret Message",
        content:
          "Inside the book, you find a cryptic riddle written in an ancient code. The whispers grow louder, encouraging you to solve it. The library's magic depends on your answer.",
        order: 2,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter6_2.id,
        type: "RIDDLE" as ChallengeType,
        question: "I have a face and two hands but no arms or legs. What am I?",
        description: "Crack the ancient library's first secret",
        maxAttempts: 4,
        baseStars: 20,
        order: 1,
        hints: [
          "It tells you something important",
          "You check it to know the time",
          "It hangs on walls",
        ],
        answers: {
          create: [
            { text: "A clock", isCorrect: true, order: 1 },
            { text: "A painting", isCorrect: false, order: 2 },
            { text: "A person", isCorrect: false, order: 3 },
            { text: "A mask", isCorrect: false, order: 4 },
          ],
        },
      },
    });

    const chapter6_3 = await prisma.chapter.create({
      data: {
        storyId: story6.id,
        title: "Unlocking the Library's Treasure",
        content:
          "As you solve the riddle, the books on the shelves glow and rearrange themselves. A hidden door appears in the library wall, revealing a chamber filled with the wisest books ever written.",
        order: 3,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter6_3.id,
        type: "CHOOSE_ENDING" as ChallengeType,
        question: "What do you do with this treasure of knowledge?",
        description: "Make a wise choice about sharing knowledge",
        maxAttempts: 3,
        baseStars: 35,
        order: 1,
        hints: [
          "The best treasures are meant to be shared",
          "Knowledge grows when shared",
        ],
        answers: {
          create: [
            {
              text: "Share the library's location with curious learners",
              isCorrect: true,
              order: 1,
            },
            {
              text: "Keep it secret for yourself only",
              isCorrect: true,
              order: 2,
            },
            {
              text: "Destroy the books to keep the secret",
              isCorrect: true,
              order: 3,
            },
            {
              text: "Ignore the treasure and leave",
              isCorrect: true,
              order: 4,
            },
          ],
        },
      },
    });

    // ===== STORY 7: The Hero's Quest (Difficulty 3) - Medium =====
    // Total stars: 90 (contributes to Level 2-3)
    const chapter7_1 = await prisma.chapter.create({
      data: {
        storyId: story7.id,
        title: "The Call of the Ancient Kingdom",
        content:
          "You arrive at the gates of a legendary kingdom where heroic deeds are celebrated. Ancient warriors gather to witness your trials. The air crackles with magic and possibility.",
        order: 1,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter7_1.id,
        type: "MORAL_DECISION" as ChallengeType,
        question:
          "An ancient warrior challenges you to a contest. How do you respond?",
        description: "Show courage and respect",
        maxAttempts: 3,
        baseStars: 20,
        order: 1,
        hints: ["True heroes are humble", "Respect the challenge ahead"],
        answers: {
          create: [
            {
              text: "Bow with respect and accept with honor",
              isCorrect: true,
              order: 1,
            },
            {
              text: "Boast about your strength and abilities",
              isCorrect: true,
              order: 2,
            },
            { text: "Refuse and walk away in fear", isCorrect: true, order: 3 },
            {
              text: "Try to cheat your way to victory",
              isCorrect: true,
              order: 4,
            },
          ],
        },
      },
    });

    const chapter7_2 = await prisma.chapter.create({
      data: {
        storyId: story7.id,
        title: "The Three Trials of Valor",
        content:
          "You face three legendary trials: a test of strength, a test of wisdom, and a test of heart. Each trial is harder than the last, but legend says you can succeed through courage and cleverness.",
        order: 2,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter7_2.id,
        type: "MULTIPLE_CHOICE" as ChallengeType,
        question: "To defeat the Trial Guardian, what do you need most?",
        description: "Choose the path of a true hero",
        maxAttempts: 3,
        baseStars: 25,
        order: 1,
        hints: [
          "Strength alone is not enough",
          "Heroes combine many qualities",
          "Wisdom guides strength",
        ],
        answers: {
          create: [
            {
              text: "A combination of courage, wisdom, and compassion",
              isCorrect: true,
              order: 1,
            },
            { text: "Only physical strength", isCorrect: false, order: 2 },
            { text: "Magical powers", isCorrect: false, order: 3 },
            { text: "Help from others only", isCorrect: false, order: 4 },
          ],
        },
      },
    });

    const chapter7_3 = await prisma.chapter.create({
      data: {
        storyId: story7.id,
        title: "Recognition of the Hero",
        content:
          "As you complete the trials, the ancient warriors bow to you. You are declared a true hero of the kingdom and invited to stand with the legends of old.",
        order: 3,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter7_3.id,
        type: "MORAL_DECISION" as ChallengeType,
        question: "Now that you're recognized as a hero, what will you do?",
        description: "A hero's greatest purpose",
        maxAttempts: 3,
        baseStars: 45,
        order: 1,
        hints: ["Heroes inspire others", "Pass on your knowledge"],
        answers: {
          create: [
            {
              text: "Mentor young warriors and help others become heroes too",
              isCorrect: true,
              order: 1,
            },
            {
              text: "Rule over the kingdom as a tyrant",
              isCorrect: true,
              order: 2,
            },
            {
              text: "Retire and enjoy your fame alone",
              isCorrect: true,
              order: 3,
            },
            { text: "Seek an even greater power", isCorrect: true, order: 4 },
          ],
        },
      },
    });

    // ===== STORY 9: Jungle Explorer's Expedition (Difficulty 4) - Medium to Hard =====
    // Total stars: 130 (contributes to Level 3-4)
    const chapter9_1 = await prisma.chapter.create({
      data: {
        storyId: story9.id,
        title: "Deep in the Jungle",
        content:
          "You stand at the edge of a vast, unexplored jungle. Ancient vines hang from towering trees, and exotic bird calls echo through the canopy. Your compass spins wildly—something magnetic about this place disrupts normal navigation.",
        order: 1,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter9_1.id,
        type: "MULTIPLE_CHOICE" as ChallengeType,
        question: "Your compass won't work. How do you navigate the jungle?",
        description: "Think like a true explorer",
        maxAttempts: 3,
        baseStars: 20,
        order: 1,
        hints: [
          "Observe nature's signs",
          "Trees grow toward the sun",
          "Animals follow water",
        ],
        answers: {
          create: [
            {
              text: "Follow natural signs like moss, sun direction, and animal tracks",
              isCorrect: true,
              order: 1,
            },
            {
              text: "Just wander randomly hoping to find something",
              isCorrect: false,
              order: 2,
            },
            {
              text: "Climb to the top and hope for rescue",
              isCorrect: false,
              order: 3,
            },
            { text: "Turn back immediately", isCorrect: false, order: 4 },
          ],
        },
      },
    });

    const chapter9_2 = await prisma.chapter.create({
      data: {
        storyId: story9.id,
        title: "Encounter with Wildlife",
        content:
          "You discover a hidden waterfall and a family of rare creatures. They seem curious about you. Ancient carved symbols are visible on rocks near the water.",
        order: 2,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter9_2.id,
        type: "RIDDLE" as ChallengeType,
        question:
          "I have cities but no houses, forests but no trees, and water but no fish. What am I?",
        description: "Decipher the ancient carving",
        maxAttempts: 4,
        baseStars: 25,
        order: 1,
        hints: [
          "It's something explorers use",
          "It shows geography",
          "You can hold it in your hands",
        ],
        answers: {
          create: [
            { text: "A map", isCorrect: true, order: 1 },
            { text: "A painting", isCorrect: false, order: 2 },
            { text: "A globe", isCorrect: false, order: 3 },
            { text: "A photograph", isCorrect: false, order: 4 },
          ],
        },
      },
    });

    const chapter9_3 = await prisma.chapter.create({
      data: {
        storyId: story9.id,
        title: "The Lost Temple Discovery",
        content:
          "Deep in the jungle, you find ruins of an ancient temple covered in vines and moss. Inscriptions suggest a great civilization once thrived here. You discover artifacts that tell stories of their knowledge.",
        order: 3,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter9_3.id,
        type: "MORAL_DECISION" as ChallengeType,
        question: "You find valuable artifacts in the temple. What do you do?",
        description: "Be a responsible explorer",
        maxAttempts: 3,
        baseStars: 35,
        order: 1,
        hints: [
          "Artifacts belong to their culture",
          "Preservation is more important than possession",
        ],
        answers: {
          create: [
            {
              text: "Document everything and tell museums/scholars about the site",
              isCorrect: true,
              order: 1,
            },
            {
              text: "Take the artifacts for personal profit",
              isCorrect: true,
              order: 2,
            },
            {
              text: "Destroy the site to keep it secret",
              isCorrect: true,
              order: 3,
            },
            { text: "Leave without telling anyone", isCorrect: true, order: 4 },
          ],
        },
      },
    });

    const chapter9_4 = await prisma.chapter.create({
      data: {
        storyId: story9.id,
        title: "Return of the Explorer",
        content:
          "You emerge from the jungle with invaluable knowledge about a lost civilization. Your discovery will help scientists understand ancient cultures and protect the jungle ecosystem.",
        order: 4,
      },
    });

    await prisma.challenge.create({
      data: {
        chapterId: chapter9_4.id,
        type: "CHOOSE_ENDING" as ChallengeType,
        question: "How will your discovery impact the world?",
        description: "Consider the future of exploration and conservation",
        maxAttempts: 3,
        baseStars: 50,
        order: 1,
        hints: [
          "True exploration serves humanity",
          "Protect what you discover",
        ],
        answers: {
          create: [
            {
              text: "Work with scientists to study and protect the site for future generations",
              isCorrect: true,
              order: 1,
            },
            {
              text: "Lead tours to make money from the discovery",
              isCorrect: true,
              order: 2,
            },
            {
              text: "Keep the location secret forever",
              isCorrect: true,
              order: 3,
            },
            {
              text: "Allow developers to build on the site",
              isCorrect: true,
              order: 4,
            },
          ],
        },
      },
    });

    console.log("✅ All roadmap stories with chapters and challenges created!");

    // ============================================
    // Create Levels based on Level System
    // ============================================
    console.log("⭐ Creating levels...");
    const levelData = [
      { levelNumber: 1, requiredStars: 0, title: "Beginner", emoji: "🟢" },
      {
        levelNumber: 2,
        requiredStars: 100,
        title: "Young Reader",
        emoji: "🔵",
      },
      {
        levelNumber: 3,
        requiredStars: 250,
        title: "Story Explorer",
        emoji: "🟣",
      },
      {
        levelNumber: 4,
        requiredStars: 500,
        title: "Riddle Solver",
        emoji: "🟠",
      },
      {
        levelNumber: 5,
        requiredStars: 900,
        title: "Logic Master",
        emoji: "🔴",
      },
      {
        levelNumber: 6,
        requiredStars: 1500,
        title: "Story Champion",
        emoji: "🟡",
      },
    ];

    const levels = await Promise.all(
      levelData.map((l) =>
        prisma.level.create({
          data: {
            levelNumber: l.levelNumber,
            requiredStars: l.requiredStars,
          },
        }),
      ),
    );

    // ============================================
    // Create Badges linked to Levels
    // ============================================
    console.log("🏆 Creating badges...");
    const badgeData = [
      {
        levelId: levels[0].id,
        name: "Beginner",
        description:
          "Welcome to your journey! You took your first step into a world of stories and challenges.",
        iconUrl: "/badges/beginner.png",
      },
      {
        levelId: levels[1].id,
        name: "Young Reader",
        description:
          "You completed your first big adventure! You're learning to read, think, and explore bravely.",
        iconUrl: "/badges/young-reader.png",
      },
      {
        levelId: levels[2].id,
        name: "Story Explorer",
        description:
          "You explored new worlds and uncovered hidden paths. Curiosity is your superpower!",
        iconUrl: "/badges/story-explorer.png",
      },
      {
        levelId: levels[3].id,
        name: "Riddle Solver",
        description:
          "You solved clever riddles and tricky puzzles. Your brain is getting stronger every day!",
        iconUrl: "/badges/riddle-solver.png",
      },
      {
        levelId: levels[4].id,
        name: "Logic Master",
        description:
          "You make smart choices and think before acting. You understand not just stories — but lessons inside them.",
        iconUrl: "/badges/logic-master.png",
      },
      {
        levelId: levels[5].id,
        name: "Story Champion",
        description:
          "You've conquered worlds, solved mysteries, and grown wiser with every challenge. You are a true Story Champion!",
        iconUrl: "/badges/story-champion.png",
      },
    ];

    await Promise.all(
      badgeData.map((b) =>
        prisma.badge.create({
          data: {
            levelId: b.levelId,
            name: b.name,
            description: b.description,
            iconUrl: b.iconUrl,
          },
        }),
      ),
    );

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Age Groups: 3`);
    console.log(`   - Themes: 4`);
    console.log(`   - Roadmaps: 3`);
    console.log(`   - Worlds: 4`);
    console.log(`   - Stories: 5`);
    console.log(`   - Chapters: 18`);
    console.log(`   - Challenges: 18`);
    console.log(`   - Levels: 6`);
    console.log(`   - Badges: 6`);
    console.log("\n⭐ Total Stars Available:");
    console.log(`   - Story 1 (The Lost Treasure): 75 stars`);
    console.log(`   - Story 2 (Whispering Trees): 85 stars`);
    console.log(`   - Story 3 (Castle of Riddles): 120 stars`);
    console.log(`   - Story 4 (Brave Knight): 140 stars`);
    console.log(`   - Story 5 (Alien Contact): 95 stars`);
    console.log(
      `   - TOTAL: 515 stars (plenty for progression to Story Champion)`,
    );
    console.log("\n🎖️ Level Progression:");
    levelData.forEach((l) => {
      console.log(
        `   ${l.emoji} Level ${l.levelNumber} - ${l.title}: ${l.requiredStars} stars`,
      );
    });
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
