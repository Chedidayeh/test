/**
 * Database Seed Script for Content Service
 * Populates the database with test data for development and testing
 * 
 * Structure:
 * - 1 Age Group (6-7 years)
 * - 2 Roadmaps (Adventure, Mystery)
 * - 2 Worlds per Roadmap (4 total)
 * - 4 Stories per World (16 total)
 * - 8 Chapters per Story (128 total)
 * - 2-4 Challenges per Story (~50 total)
 *
 * Run with: npx ts-node scripts/seed-content.ts
 * Or: npm run seed
 */

import { PrismaClient, ChallengeType } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

interface CreateChapterInput {
  storyId: string;
  title: string;
  content: string;
  order: number;
  imageUrl?: string;
  audioUrl?: string;
}

interface CreateChallengeInput {
  chapterId: string;
  type: ChallengeType;
  question: string;
  description?: string;
  baseStars: number;
  maxAttempts?: number;
  hints?: string[];
  answers: Array<{ text: string; isCorrect: boolean }>;
  order: number;
}

async function createChapter(input: CreateChapterInput) {
  return prisma.chapter.create({
    data: {
      storyId: input.storyId,
      title: input.title,
      content: input.content,
      order: input.order,
      imageUrl: input.imageUrl,
      audioUrl: input.audioUrl,
    },
  });
}

async function createChallenge(input: CreateChallengeInput) {
  return prisma.challenge.create({
    data: {
      chapterId: input.chapterId,
      type: input.type,
      question: input.question,
      description: input.description,
      baseStars: input.baseStars,
      maxAttempts: input.maxAttempts,
      hints: input.hints || [],
      order: input.order,
      answers: {
        create: input.answers.map((ans, idx) => ({
          text: ans.text,
          isCorrect: ans.isCorrect,
          order: idx + 1,
        })),
      },
    },
  });
}

async function createStory(
  worldId: string,
  title: string,
  difficulty: number,
  order: number,
) {
  return prisma.story.create({
    data: {
      worldId,
      title,
      difficulty,
      isMandatory: true,
      order,
    },
  });
}

// Story content templates for rich narratives
// Image URLs for chapters - thematic Unsplash images
const chapterImages: { [key: string]: string[] } = {
  "The Lost Map": [
    "https://picsum.photos/800/600?random=1", // map
    "https://picsum.photos/800/600?random=2", // forest
    "https://picsum.photos/800/600?random=3", // nature
    "https://picsum.photos/800/600?random=4", // quest
    "https://picsum.photos/800/600?random=5", // journey
    "https://picsum.photos/800/600?random=6", // discovery
    "https://picsum.photos/800/600?random=7", // treasure
    "https://picsum.photos/800/600?random=8", // resolution
  ],
  "River Crossing": [
    "https://picsum.photos/800/600?random=9", // river
    "https://picsum.photos/800/600?random=10", // path
    "https://picsum.photos/800/600?random=11", // water
    "https://picsum.photos/800/600?random=12", // challenge
    "https://picsum.photos/800/600?random=13", // journey
    "https://picsum.photos/800/600?random=14", // success
    "https://picsum.photos/800/600?random=15", // celebration
    "https://picsum.photos/800/600?random=16", // reflection
  ],
  "The Hidden Cave": [
    "https://picsum.photos/800/600?random=17", // cave entrance
    "https://picsum.photos/800/600?random=18", // cave exploration
    "https://picsum.photos/800/600?random=19", // ancient art
    "https://picsum.photos/800/600?random=20", // underground
    "https://picsum.photos/800/600?random=21", // discovery
    "https://picsum.photos/800/600?random=22", // mystery
    "https://picsum.photos/800/600?random=23", // revelation
    "https://picsum.photos/800/600?random=24", // responsibility
  ],
  "The Mountain Climb": [
    "https://picsum.photos/800/600?random=25", // mountain peak
    "https://picsum.photos/800/600?random=26", // climb
    "https://picsum.photos/800/600?random=27", // snow
    "https://picsum.photos/800/600?random=28", // struggle
    "https://picsum.photos/800/600?random=29", // stars night
    "https://picsum.photos/800/600?random=30", // determination
    "https://picsum.photos/800/600?random=31", // summit
    "https://picsum.photos/800/600?random=32", // achievement
  ],
  "The Mirage": [
    "https://picsum.photos/800/600?random=33", // desert
    "https://picsum.photos/800/600?random=34", // desert dunes
    "https://picsum.photos/800/600?random=35", // caravan
    "https://picsum.photos/800/600?random=36", // challenge
    "https://picsum.photos/800/600?random=37", // doubt
    "https://picsum.photos/800/600?random=38", // water
    "https://picsum.photos/800/600?random=39", // oasis
    "https://picsum.photos/800/600?random=40", // wisdom
  ],
  "The Oasis": [
    "https://picsum.photos/800/600?random=41", // oasis water
    "https://picsum.photos/800/600?random=42", // desert journey
    "https://picsum.photos/800/600?random=43", // palm trees
    "https://picsum.photos/800/600?random=44", // desert markers
    "https://picsum.photos/800/600?random=45", // storm
    "https://picsum.photos/800/600?random=46", // hidden paradise
    "https://picsum.photos/800/600?random=47", // community
    "https://picsum.photos/800/600?random=48", // preservation
  ],
  "The Sandstorm": [
    "https://picsum.photos/800/600?random=49", // desert caravan
    "https://picsum.photos/800/600?random=50", // storm approaching
    "https://picsum.photos/800/600?random=51", // storm chaos
    "https://picsum.photos/800/600?random=52", // survival
    "https://picsum.photos/800/600?random=53", // nighttime
    "https://picsum.photos/800/600?random=54", // aftermath
    "https://picsum.photos/800/600?random=55", // new landscape
    "https://picsum.photos/800/600?random=56", // strength
  ],
  "The Pyramid": [
    "https://picsum.photos/800/600?random=57", // pyramid
    "https://picsum.photos/800/600?random=58", // pyramid entrance
    "https://picsum.photos/800/600?random=59", // tomb
    "https://picsum.photos/800/600?random=60", // hieroglyphics
    "https://picsum.photos/800/600?random=61", // discovery
    "https://picsum.photos/800/600?random=62", // tools
    "https://picsum.photos/800/600?random=63", // connection
    "https://picsum.photos/800/600?random=64", // legacy
  ],
  "The Disappearance": [
    "https://picsum.photos/800/600?random=65", // missing doll
    "https://picsum.photos/800/600?random=66", // investigation
    "https://picsum.photos/800/600?random=67", // clues
    "https://picsum.photos/800/600?random=68", // detection
    "https://picsum.photos/800/600?random=69", // mystery
    "https://picsum.photos/800/600?random=70", // realization
    "https://picsum.photos/800/600?random=71", // compassion
    "https://picsum.photos/800/600?random=72", // kindness
  ],
  "Following Clues": [
    "https://picsum.photos/800/600?random=73", // vandalism
    "https://picsum.photos/800/600?random=74", // investigation
    "https://picsum.photos/800/600?random=75", // clue finding
    "https://picsum.photos/800/600?random=76", // interviewing
    "https://picsum.photos/800/600?random=77", // understanding
    "https://picsum.photos/800/600?random=78", // art mentoring
    "https://picsum.photos/800/600?random=79", // restoration
    "https://picsum.photos/800/600?random=80", // success
  ],
  "The Red Herring": [
    "https://picsum.photos/800/600?random=81", // museum
    "https://picsum.photos/800/600?random=82", // investigation
    "https://picsum.photos/800/600?random=83", // suspect
    "https://picsum.photos/800/600?random=84", // evidence
    "https://picsum.photos/800/600?random=85", // deception
    "https://picsum.photos/800/600?random=86", // truth
    "https://picsum.photos/800/600?random=87", // justice
    "https://picsum.photos/800/600?random=88", // resolution
  ],
  "The Old House": [
    "https://picsum.photos/800/600?random=89", // old house
    "https://picsum.photos/800/600?random=90", // exploring
    "https://picsum.photos/800/600?random=91", // clues
    "https://picsum.photos/800/600?random=92", // searching
    "https://picsum.photos/800/600?random=93", // discovery
    "https://picsum.photos/800/600?random=94", // breakthrough
    "https://picsum.photos/800/600?random=95", // final test
    "https://picsum.photos/800/600?random=96", // truth revealed
  ],
};

const storyContent: { [key: string]: { [chapterIndex: number]: string } } = {
  "The Lost Map": {
    0: "You wake up in a cozy cabin deep in an enchanted forest. Sunlight streams through the windows, painting everything in shades of gold and green. Your grandmother sits by the fireplace, an old leather journal in her hands. 'I have something special for you,' she says with a mysterious smile. She hands you a torn piece of ancient parchment. It's a map! But it's incomplete, with faded markings and missing pieces. 'Will you help me find what it leads to?' your grandmother asks. An adventure is about to begin...",
    1: "You step out of the cabin into the cool forest. The air smells like pine needles and morning dew. A winding path stretches before you, disappearing into a thick grove of tall trees. Your heart beats with excitement and a little nervousness. The map in your pocket crinkles as you move. You notice strange symbols carved into nearby trees—the same symbols on your map! Following these clues, you walk deeper into the forest. Birds chirp all around you, as if cheering you on. Which direction should you go?",
    2: "After walking for an hour, you discover something incredible hidden behind a waterfall! The water sparkles in the sunlight, creating a magical rainbow. Behind it, you spot ancient stone steps leading upward into the hillside. Your breath catches in your throat. This must be what the map was guiding you to! However, the path looks steep and mysterious. You notice claw marks on the rocks—recent ones. What could live here? The mystery deepens.",
    3: "You gather your courage and climb the stone steps. Each step echoes with history. Halfway up, you encounter a guardian—a magnificent silver wolf with intelligent eyes. It doesn't look mean, but it's clearly protecting something. Your map shows a special marking right here. You remember your grandmother saying, 'The guardian will test your heart.' This must be the challenge she mentioned!",
    4: "The wolf circles you slowly, studying you carefully. Then it does something unexpected—it bows its head in respect! It seems the kindness in your heart was the real test all along. The wolf steps aside, revealing an ancient stone door. Golden light glows from behind it. You feel like you're on the edge of discovering something wonderful and important. The door creaks open slowly...",
    5: "Inside the stone chamber, your eyes go wide with amazement. Shelves carved into the walls hold hundreds of glowing crystals, each one shimmering with different colors. In the center sits a pedestal, and on it rests a beautifully bound golden journal. This is your family's secret treasure—not gold or jewels, but stories! Your grandmother's ancestors documented every adventure they ever had in these pages. You feel the weight of history in your hands.",
    6: "As you open the journal, the crystals around you glow even brighter, as if celebrating your discovery. The first page shows your grandmother's handwriting from many years ago, with a message written just for you: 'To my brave grandchild, you have proven yourself worthy. This book of adventures is now yours to continue. Add your own stories. The forest protects those with pure hearts who seek knowledge and truth.' Your adventure has found its purpose!",
    7: "You carefully carry the golden journal back through the forest, the silver wolf walking beside you like a faithful friend. Your grandmother is waiting outside the cabin, tears of joy in her eyes. When you show her the journal, she hugs you tightly. She tells you stories from the book late into the night—tales of her own adventures, of bravery and discovery. From that day on, you visit the enchanted forest every season, and you begin writing your own adventure stories in the golden journal. The magic of the forest becomes part of your life forever.",
  },
  "River Crossing": {
    0: "The morning sun finds you standing at the edge of a wide, rushing river. You've heard legends about what lies on the other side—a hidden village where ancient maps are kept. But there's no bridge, and the river is fierce and wild. The water crashes against the rocks, creating a thunderous roar. Your guide, an old boatman named Captain Moss, shakes his head. 'This river is dangerous today,' he says. 'We need to find another way, or wait for the water to calm.' But you don't have time to wait. A challenge awaits!",
    1: "You walk along the riverbank, studying the terrain. Your boots crunch on pebbles and smooth river stones. The water spray cools your face. Then you spot something—a series of large, flat rocks jutting out from the water, creating a stepping-stone path! However, they're wet and slippery, and some are far apart. Captain Moss nods slowly. 'That's the old way,' he says. 'Many have tried. Not all have succeeded.' He moves toward the boatman's cottage to gather supplies. You must choose your path forward carefully.",
    2: "You return to the stepping stones at sunrise, when the light is strongest. You've packed rope and watched how the water moves. Captain Moss has taught you about reading currents. You notice the rocks are covered with a green moss—beautiful but very slippery. If you lose your footing, the river will sweep you away. You take a deep breath and feel the weight of responsibility. But you also feel something else: determination and hope. The village beyond the river is waiting.",
    3: "You grip the rope Captain Moss tied around your waist and step onto the first rock. It's smaller than you expected and very slick. Your heart pounds as you balance carefully. One step at a time. One breath at a time. You're halfway across when the river current suddenly strengthens. Panic rises in your chest. The rope pulls taut. This is the test. Can you stay calm and focused when things get difficult?",
    4: "The memory of your grandmother's words comes to you: 'When fear rises, remember your strength.' You steady your breathing. Your feet find better purchase on the rock. You move with purpose now, not panic. The current still pushes, but you're stronger. Step by step, you advance. Behind you, Captain Moss watches in amazement. 'You've done it,' he calls out. 'You read the river like a true navigator!' Two more stones between you and the other side.",
    5: "Your final leap carries you onto the larger rocks near the shore. You've done it! You've crossed the river! Captain Moss claps you on the back, shaking water from his beard. 'I've seen many people attempt that crossing. Your courage and your control impressed me.' He pulls out a worn map. 'The village is just through those trees. They've been expecting someone brave enough to reach them. Come. We're close now.'",
    6: "The hidden village appears like magic through the trees. Colorful houses with rounded roofs nestle against the hillside. Smoke rises from chimneys, carrying the smell of baking bread and cooking spices. The villagers emerge from their homes, welcoming you warmly. They wear clothes in bright colors and move with gentle grace. The oldest villager, a woman with silver braids, smiles at you. 'You've passed the river test. You're ready to learn our secrets.'",
    7: "In the village's ancient library, you're shown maps older than anyone's memory. Maps showing paths to places that might not even exist anymore—or perhaps exist in ways beyond the ordinary world. The villagers teach you their navigation secrets, passed down through countless generations. As the sun sets over the river you crossed, you realize something profound: the greatest journeys aren't just about reaching a destination. They're about who you become along the way. You're stronger now. Braver. Wiser.",
  },
  "The Hidden Cave": {
    0: "Storm clouds gather above the mountain as you approach with your climbing team. You've come seeking the legendary Hidden Cave, rumored to contain ancient paintings created by forgotten artists. The wind howls through the peaks, making strange whistling sounds that almost seem like voices. Your team is nervous, but you press on. The cave entrance is hidden behind a waterfall—you can only see it when the light hits the water at a certain angle. Today, the sunset creates that perfect angle.",
    1: "Behind the waterfall, the cave entrance is smaller than you expected—you have to squeeze through a narrow opening. The temperature drops immediately. Your breath fogs in front of you. One by one, your team enters. The sound of the waterfall blocks all other noise. Your flashlights cut through the darkness, revealing walls made of smooth stone. Strange mineral deposits sparkle like stars. The deeper you go, the more you sense you're walking through time itself.",
    2: "After traveling through a passage that seems to never end, you enter a massive underground chamber. Your team gasps in unison. The walls are covered with paintings—thousands of them! Animals in graceful poses, human figures dancing, stars and moons, symbols that tell forgotten stories. The paintings glow softly in your flashlight beams, as if animated from within. Some are so old that stone dust covers them, yet their beauty is undeniable. 'This is impossible,' whispers your team leader. 'These paintings are thousands of years old.'",
    3: "As you study the paintings, you notice something extraordinary. The paintings seem to tell a story when viewed in sequence—like an ancient comic book. They show people celebrating, then growing sad, then celebrating again. Stories of seasons changing, of hunts and harvests, of love and loss. Then you notice something that makes you freeze. One painting shows a great danger approaching—a massive creature or disaster. What does this warning mean? Why did the ancient artists feel the need to record it?",
    4: "Your team leader points to a section of the wall where the paintings depict people escaping into the cave itself. 'I think this is the answer,' she says. 'The cave was a sanctuary. A place of safety during danger.' You feel a deep respect for those ancient people. They faced challenges just like modern people do. They sought shelter and safety. They created beautiful art to preserve their story. In protecting this cave, you're helping to keep their memory alive forever.",
    5: "As if in response to your thoughts, you notice something glowing beneath ancient ash on the cave floor. Your team carefully clears away the dust and discovers a stone tablet with symbols etched into it. The symbols match some of the paintings on the walls! This is a key—a way to understand the ancient language. Your discovery will help archaeologists around the world understand a lost civilization. The ancient artists are reaching across thousands of years to communicate with you.",
    6: "That night, wrapped in sleeping bags in the cave, you listen to the waterfall echo in the distance. Your team talks quietly about the responsibility of your discovery. 'We have to protect this place,' you say. 'Future explorers should experience this wonder just like we did.' Everyone agrees. You begin planning how to document everything carefully without damaging anything. This becomes more than an adventure—it becomes a sacred duty.",
    7: "Months later, the Hidden Cave is recognized as an important historical site. Scientists and artists travel from around the world to study it. But access is carefully controlled to preserve it. You're invited back as a guardian of the cave, helping teach others about its significance. You stand where those ancient artists stood, separated by thousands of years yet connected by the same sense of wonder and the desire to create something meaningful. You've become part of the cave's story now.",
  },
  "The Mountain Climb": {
    0: "The peak of Skyreach Mountain disappears into the clouds above you. This is the highest point in the entire region, and nobody your age has ever summited it. The village people think you're crazy for trying. 'The mountain is unpredictable,' the old weatherman warns. But something calls to you from that summit. You've trained for months. You've studied the mountain carefully. Today, you begin your climb. As you take the first step on the rocky trail, you feel ready.",
    1: "Three hours into the climb, your legs burn and your lungs feel tight from the thin air. Behind you, the village becomes smaller and smaller until it looks like a toy. The air is getting colder. Your breath comes in white puffs. But the view—the view is beyond anything you imagined. Forests spread below like a green ocean. Rivers sparkle like silver ribbons. You can see the edge of three different countries from here. You pause at a rocky ledge and simply breathe in the immensity of it all.",
    2: "The sun begins to set as you reach a small shelter built by previous climbers. Snow begins to fall—unexpected and worrying. The trail disappears under white. Your supplies include a warm sleeping bag and some hot food. You could push on or wait for morning. The voice of doubt creeps in: maybe you should give up, go down, try another day. You sit at the shelter entrance, watching sunset paint the clouds gold and purple. The mountain seems to be testing your resolve.",
    3: "During the night, something incredible happens. The clouds part, revealing a sky absolutely filled with stars. More stars than you've ever seen. They scatter across the darkness like spilled diamonds. Your fear transforms into awe. If you can see the stars this clearly, maybe you can find your way in the morning. You realize something important: the mountain isn't trying to stop you. It's teaching you. Fear, determination, wonder, perseverance—these are all part of the journey.",
    4: "Morning comes with clear skies and fresh snow. Every surface glitters in the early light. The trail is visible again, though more dangerous with ice. You move carefully, using the handholds you memorized during training. Your fingers grow numb. Your legs shake with exhaustion. But you're getting closer. You can see the summit now—a flat rocky outcropping just a few hundred feet above. You've got this. You push toward it.",
    5: "Your foot touches the summit rock. You've done it! You stand on Skyreach Mountain's peak! The world spread below takes your breath away. You can see further than fifty miles in every direction. Clouds swirl around lower peaks like rushing rivers. Eagles soar below you—below, not above! In that moment, all the struggle, all the doubt, all the pain dissolves. You're not the same person who started climbing this morning.",
    6: "You spend two hours at the summit, wanting to memorize every detail. You notice a small stone pile—other climbers have marked this spot. You add a stone, becoming part of a chain of adventurers stretching back years. You write a message on paper and place it in a protected container: 'We are stronger than our doubts. We can reach the heights we dream of.' Future climbers will read your words and be encouraged.",
    7: "The descent takes all day, but it feels easier somehow. You're tired, but joyful. As you reach the village, people gather in surprise and celebration. The old weatherman shakes your hand, with tears in his eyes. 'You taught me something today,' he says. 'That sometimes impossibility is just another word for not-yet-tried.' From that day forward, your name is spoken with respect in the village. You became the first, but you know you won't be the last. The mountain, you realize, changed you forever.",
  },
  "The Mirage": {
    0: "The desert stretches endlessly in every direction—golden sand dunes under a blazing sun. Your caravan left the city three days ago, following ancient trade routes. Water is precious. Everyone walks quietly, conserving energy. Your guide, Hassan, is a desert expert who has crossed this route fifty times. But even he looks uncertain today. 'Something's different,' he keeps saying. Then you see it—a shimmering vision in the distance. A lake? No... it must be a mirage. But it looks so real...",
    1: "The excitement spreads through the caravan. 'Water!' someone shouts. People move faster, drawn toward the shimmering vision like moths to flame. Hassan pulls you back. 'No,' he says firmly. 'That's the desert playing tricks. But mirages happen for a reason. Thirst makes mirages. We must find real water soon.' He's right—three camels are struggling now, their eyes dull and empty. The real water must be somewhere. Hassan studies the horizon carefully. 'Old maps show a well to the east. We must not be distracted.'",
    2: "You help Hassan navigate using only the sun and the stars he teaches you to read. It's harder than you thought. The desert looks the same in every direction. Hour after hour. The mirage reappears, still shimmering in the distance. It looks so real that several people check their supplies, wondering if they're mistaken about seeing it. Your lips become dry. Your throat feels like sandpaper. But you focus on what Hassan teaches you. Real survival comes from clear thinking, he explains.",
    3: "Near sunset, you see a different kind of shimmering—true heat waves rising from sand. But Hassan smiles. 'Look there,' he says, pointing to a slight depression in the sand. 'In the desert, water leaves signs. Salt crystals. Different colored sand. A gathering of certain plants.' You climb down into the depression and find it—dried rock with slight moisture underneath. Hassan digs carefully, and suddenly cool water flows up! It's not much, but it's real. Your team celebrates quietly, taking turns with careful sips.",
    4: "That night, around a small fire under stars, Hassan tells you why mirages appear. 'The desert shows you what you desire most. But desires can fool us,' he says. 'A strong person in the desert sees what is real. That's the real magic—knowing the difference.' You understand now. The mirage wasn't trying to hurt you. It was a test. And by resisting it, by trusting Hassan's wisdom and your own observation, you proved you could survive anything the desert threw at you.",
    5: "The next morning, you reach an ancient oasis. Real water! Date palms! A small village of people who have guarded this place for generations. Hassan is greeted warmly—he's been coming here for decades. The villagers recognize the mark you saw (the mirage that led you to real water discovery). 'The desert teaches lessons,' the village elder says. 'The most dangerous thing is false desire. The greatest strength is knowing truth.'",
    6: "In the village, you learn ancient desert navigation techniques passed down for thousands of years. They show you how to read sand patterns like books, how to find water by understanding animal behavior, how to navigate using stars unknown to modern maps. This knowledge could save lives. You realize that mirages aren't the desert trying to deceive you—they're the desert testing whether you truly belong there.",
    7: "When your caravan finally reaches the next city, you're different. Stronger. Wiser about desire and reality. Hassan recommends you as a guide's apprentice for next season. You dream of the desert at night, of the shimmering mirages you learned to see past. You understand now that the most valuable journeys aren't about reaching destinations—they're about what you learn about yourself along the way.",
  },
  "The Oasis": {
    0: "Legend speaks of the Eternal Oasis—a place where water never runs dry, where fruit trees produce year-round, where people live in perfect harmony with the desert. Most people think it's just a myth. But your grandmother swears she visited it once, years ago. She's given you a map, hand-drawn from memory. 'Find it for me,' she asks. 'I want to know it still exists.' You set out from the city with supplies and determination, ready to prove the legend true.",
    1: "Days into the desert, you meet other travelers. Some mock you for searching for an impossible place. Others warn you about getting lost and dying of thirst. But each person you meet shares pieces of information—hints about where the oasis might be, signs to look for, stories from their families. You realize the oasis exists mainly in stories, in shared knowledge passed between travelers. But maybe, just maybe, that makes it more real, not less real.",
    2: "You discover an ancient trade route—barely visible, being reclaimed by the sand. Stone markers stand at intervals, so weathered that their carvings are almost unreadable. But they're pointing in a consistent direction. Your heart quickens. These markers were placed by people who knew something you don't. You clean one carefully and find symbols matching your grandmother's map. You're on the right path! The excitement almost makes you forget your thirst.",
    3: "A sandstorm appears without warning. The sky turns brown. Sand gets into everything—your eyes, your mouth, your supplies. You can't see more than a few feet ahead. Hassan's lessons come back to you. You remember: find shelter, wait it out, stay calm. You spot a rocky outcropping and huddle behind it, protecting your supplies. The storm rages for hours. It's terrifying and lonely. But you survive it, and when the sand settles, you see something incredible—the markers are still visible ahead, as if pointing the way out of the storm.",
    4: "The landscape changes. The sand becomes richer, darker. Plants begin appearing—first just hardy desert shrubs, then actual trees. You smell something new—moisture in the air. Your animals sense it too, walking faster, their heads up. Then you turn around a rocky hill... and there it is. The Oasis. It's real! Water so clear you can see the bottom. Palm trees heavy with dates and coconuts. Flowers blooming in impossible colors. The sight takes your breath away.",
    5: "The oasis is small but perfectly formed, like a jewel set into the desert. People are already here—a community that has lived here for generations, hidden from the world. They welcome you warmly because your grandmother once found them, was sheltered here, and promised never to reveal its exact location. They knew someone would eventually return. You're greeted as family, even though you're a stranger. This is the magic of the oasis—it teaches kindness to travelers.",
    6: "You spend days at the oasis, learning how they maintain this paradise. Water comes from an underground spring. They have irrigation systems developed through centuries of knowledge. They grow food in specific patterns that work with the desert's seasons. They've created something beautiful and sustainable through patience and deep knowledge of their environment. This isn't magic in the fantasy sense—it's something better. It's human wisdom.",
    7: "When you finally leave the oasis, you carry gifts—dates, seeds for your grandmother, and a leather map case containing an updated map. The community asks you to share the oasis's story, but not its exact location. 'Tell people it exists,' they say. 'But let them find their own path to it.' You understand. The journey is more important than the destination. Just knowing the oasis exists is enough to inspire people to believe in the impossible. Your grandmother receives the gifts with tears of joy, and keeps the new map hidden, waiting for the day to pass it to the next seeker.",
  },
  "The Sandstorm": {
    0: "The caravan has been traveling through the deep desert for two weeks when the sky changes color. It shifts from bright blue to an ominous orange-red. The old traders stop their camels and exchange worried looks. 'A great storm comes,' Hassan announces. 'The kind that can swallow entire caravans.' You've read about sandstorms in books, but seeing the sky transform like this—it's terrifying. The first wind gusts nearly knock you over. The temperature drops instantly. This is serious.",
    1: "The caravan rushes to prepare. Tents are secured with multiple stakes. Animals are brought close together. Water containers are sealed. Everyone ties cloth around their faces. The wind arrives with a sound like a thousand voices screaming. The sky disappears—replaced by a wall of swirling sand. You can't see beyond arm's length. The sound is deafening. Sand gets through every gap, every sealed container. This is what chaos feels like. This is what nature's power really means.",
    2: "Inside the tent, covered in sand, you and three other people huddle together, taking turns being the anchor so the tent doesn't blow away. The storm rages with no sign of stopping. One person panics, screaming that they're going to die. You remember Hassan's teachings about staying calm. You speak firmly to the panicked person, sharing knowledge, reminding them that the storm will pass. By calming someone else, you calm yourself. Fear decreases when purpose increases.",
    3: "The storm lasts through the entire night. You barely sleep, listening to the wind create an ever-changing symphony of sounds. Sometimes it's a roar. Sometimes it's a gentle whisper. Sometimes it sounds like distant songs. Your mind starts playing tricks. You imagine the wind is alive, that it's speaking to you. In a way, you realize, it is alive—it's a living phenomenon, more powerful than any single human. Yet humans have survived it for millennia.",
    4: "Morning reveals an eerie, changed landscape. The sand has shifted, creating new dunes, burying old landmarks. The caravan emerges to survey the damage. One tent is torn, but repairable. Most supplies survived. No lives were lost. Hassan looks at you with respect. 'You helped keep the group calm,' he says. 'That matters more than strength. In crisis, courage means choosing calm over panic.' You realize something important: the most powerful thing in a disaster is human unity and clear thinking.",
    5: "As the caravan moves on, the altered landscape is both dangerous and beautiful. Sandsailors (experienced desert travelers) navigate by subtle signs—the feel of the sand, the angle of sun, natural markers. You help Hassan watch for hidden dangers like quicksand areas. The storm has made the desert more challenging, but it's also made you more skilled. Each danger overcome strengthens your confidence.",
    6: "That evening, Hassan teaches you about sandstorms' role in the desert. 'Storms reshape the land,' he explains. 'They clear away the old, reveal what's hidden, create new paths. Without storms, the desert would stagnate. Storms are part of the desert's life cycle.' You realize the storm wasn't punishment—it was natural. The desert isn't cruel. It's just powerful, and humans must learn to work with it intelligently.",
    7: "The caravan finally reaches a coastal city, where you say goodbye to Hassan. You've faced a true sandstorm and survived. More than that—you've learned to respect the desert while maintaining your own strength and purpose. You write to your family about the experience. When others ask if you'll return to the desert, you smile. 'Absolutely,' you say. 'The storm taught me that I'm stronger than I thought.'",
  },
  "The Pyramid": {
    0: "The pyramid rises from the golden sand like a mountain built by giants. You've dreamed of seeing this wonder of the ancient world your whole life. Now you're here, standing at its base, looking up at stones so massive that dozens of people would struggle to move just one. Your guide is Dr. Samir, an archaeologist who has studied pyramids for forty years. 'We're going inside today,' he says. 'Few people get to touch a pharaoh's tomb. Prepare yourself.'",
    1: "The entrance tunnel is narrow and slants downward into darkness. Your torch creates dancing shadows on precisely-cut stone walls. Workers long dead laid these blocks with such precision that you can barely fit a knife blade between them. How did ancient people do this without modern technology? You walk step by step, feeling the weight of thousands of years bearing down. The air becomes cooler. The sounds change. It's like you're walking back in time.",
    2: "The tunnel opens into a vast chamber—the king's burial room. Your torch light isn't enough to illuminate everything. Dr. Samir uses more torches, and the chamber begins to reveal itself. The ceiling is a smooth vault. The walls are covered with paintings—gods, hieroglyphics, scenes of the pharaoh being guided to the afterlife. A massive stone coffin sits in the center, its lid carved with the image of the ancient king. You feel something between sadness and awe. Someone you'll never know lived thousands of years ago, and here's their eternal resting place.",
    3: "Dr. Samir points to symbols on the walls. 'This is a story,' he says. 'The ancient Egyptians told stories with pictures, just like modern comic books. Look—the pharaoh is hunting. Here he's celebrating with his family. This shows him receiving gifts from the gods.' The symbols aren't just decoration—they're a narrative. The pharaoh was a real person who loved, worked, celebrated, and died. Someone who wanted to be remembered. Just like people today.",
    4: "Behind the main chamber, you discover a hidden room that even Dr. Samir didn't know about. Inside are jars containing ancient provisions—dried grain, dates, offerings for the pharaoh's journey. Some jars are still sealed. You carefully break the wax on one. The contents smell ancient, spicy, and complex. Four thousand year old food. Someone prepared this with care and love, never imagining it would be discovered again. 'This is incredible,' Dr. Samir whispers. 'This will change our understanding of pyramid construction.'",
    5: "As you explore, you find inscriptions that appear to be the workers' handwriting—not the formal royal scribes, but the regular people who built this pyramid. Some have etched their names into stones, leaving messages. 'I built this brick.' 'Khenti was here.' These workers wanted their existence recorded, acknowledged. They wanted to matter. Thousands of years later, finding their marks is like hearing their voices across the ages.",
    6: "You discover a shaft filled with what appear to be tools—copper chisels, wooden hammers, ropes. 'These are exactly what we thought they used,' Dr. Samir says excitedly. 'But finding them here, seeing them, holding them—it brings it all to life.' He lets you carefully pick up a tool. Its weight surprises you. The wood is worn from thousands of hands gripping it. An ancient worker's grip, preserved in time. You're connected to that person across thousands of years.",
    7: "When you exit the pyramid hours later, the sun is setting. The limestone blocks glow orange and gold. Dr. Samir puts his hand on your shoulder. 'What you've learned today took archaeologists centuries to understand. You walked where pharaohs walked. You touched what their workers touched. You're part of a chain of people who remember, who preserve history, who honor those who came before. That's incredibly important work.' You look at the pyramid, new respect in your eyes. It's not just a building—it's an entire civilization speaking to the future.",
  },
  "The Disappearance": {
    0: "Maya's favorite doll, Rainbow, vanishes from her bedroom without explanation. She's had Rainbow since she was born—the doll has traveled everywhere with her, slept in her bed every night, watched her grow up. Rainbow is missing. Maya is devastated. Her parents search the house but find nothing. Then Maya's best friend, Alex, arrives to comfort her. 'We can solve this,' Alex says. 'We're smart. We can find out what happened.' Together, they become detectives. Someone—or something—has taken the most precious thing in Maya's world.",
    1: "Maya and Alex search for clues systematically. They ask everyone in the house: Did anyone move Rainbow? Did they see anything unusual? What was strange today? They learn that the kitchen door was left open that afternoon—unusual in a house where security is important. They find a piece of blue thread caught on the door handle. Was Rainbow taken out? On purpose or accident? The mystery deepens. Alex pulls out a notebook. 'We need to organize what we know,' she says, like a professional detective. Fear transforms into purpose.",
    2: "The investigation takes them around the neighborhood. They ask neighbors if anyone saw anything unusual. Mrs. Chen, who lives next door, mentions seeing 'something blue' in the park that morning. Maya's stomach drops. Could Rainbow really be in the park? But why? The girls walk to the park carefully, looking for any hint of blue fabric. They find nothing obvious, but they do notice something odd—Mrs. Chen's grandson, Tommy, watching them from near the playground. He quickly looks away. Why is he watching them? Is he involved?",
    3: "Maya and Alex confront Tommy. He's shy and nervous. They're ready to accuse him, but then Tommy surprises them. 'I took Rainbow,' he admits. 'But I didn't mean to steal her. I borrowed her. My little sister is very sick in the hospital. She's scared and sad. I borrowed Rainbow to show her because you always talk about how Rainbow makes you feel better. I was planning to return her today.' He pulls Rainbow from his backpack. The doll is pristine, unharmed. Maya's anger dissolves instantly.",
    4: "Maya realizes something profound. Tommy wasn't being mean. He was being kind—maybe awkwardly, maybe wrongly, but with good intentions. 'Can I come with you to see your sister?' Maya asks. 'Rainbow misses her friend.' Together, the three children visit the hospital. Tommy's sister, Elena, lights up when she sees Rainbow. For the first time in days, she smiles genuinely. Maya lets Elena hold the doll. In that moment, the mystery isn't important anymore. Helping someone matters more.",
    5: "Maya makes a decision that surprises her parents. 'Elena can stay with Rainbow as long as she needs to,' she says. Tommy and Alex look shocked. 'But Rainbow is your special doll,' Tommy stammers. Maya nods. 'I know. That's why I want her to comfort Elena. Rainbow is supposed to help people feel better. Elena needs that more than I do right now. Plus,' Maya smiles at Alex, 'now we can have new adventures together without Rainbow.' She hugs Alex. True friendship, she realizes, is more valuable than possessions.",
    6: "The hospital staff is moved by Maya's generosity. They take photos of Maya and Elena together with Rainbow. The story gets shared—the girl who gave her most precious possession to a stranger's sister. Other children at the hospital start feeling braver about their own medical challenges. Rainbow becomes known as the 'Courage Doll,' helping kids face difficult treatments. Teachers at school encourage Maya to tell her story. What started as a mystery became a movement of kindness.",
    7: "Months later, when Elena is released from the hospital, she returns Rainbow to Maya with a gift—a new doll she names 'Hope' that she made in art therapy. But more important than gifts, Maya has learned that the greatest treasures aren't things. They're the people we care about. She and Alex are officially detective partners now, solving neighborhood mysteries and helping people. Rainbow sits on Maya's shelf, not forgotten, but understood now. She taught Maya something more valuable than any doll ever could—that true magic is kindness.",
  },
  "Following Clues": {
    0: "Detective partners Maya and Alex wake early, excited for their second official case. A local arttist's paintings have been vandalized—deliberately damaged during the night. Mr. Foster, the artist, is heartbroken. 'Someone destroyed three months of work,' he says sadly. 'But they left clues—I think they wanted to be caught.' He shows the girls the evidence: footprints in paint, a torn piece of dark fabric, and most interesting—a drawing left at the scene. 'That drawing wasn't made by me,' Mr. Foster says. 'Someone left it intentionally.'",
    1: "The girls examine the left-behind drawing carefully. It shows a boy holding a paintbrush, with words written below: 'I wanted to be noticed. Mr. Foster never notices me.' The torn fabric appears to be from school uniforms. The girls know someone has been trying to get Mr. Foster's attention, but used destruction. Their mystery is no longer just solving a crime—it's understanding why someone would do this. 'We need to find who drew this,' Alex determines. 'And we need to understand them.'",
    2: "At the local school, the girls search for someone who draws well and feels invisible. They notice a boy named Marcus sketching in the cafeteria corner, unnoticed by everyone else. His drawings are extraordinary—better than some professionals. Nobody talks to him. Nobody acknowledges his talent. But when they approach him, Marcus gets defensive. He won't admit anything. Instead, he challenges them: 'Can you figure out why I need Mr. Foster to notice me?'",
    3: "The girls investigate Marcus's home life. They learn his family just moved to the city. His father wants him to become an engineer, not an artist. At school, nobody recognizes his talent because he sits alone and doesn't speak much. Marcus didn't vandalize Mr. Foster's paintings to destroy them—he did it because he felt desperate to be noticed. Depression and isolation made him act out. Understanding the reason changes everything about how the girls see the situation.",
    4: "Instead of getting Marcus in trouble with police, Maya and Alex create a different solution. They show Mr. Foster Marcus's portfolio. The artist immediately recognizes the talent. He visits Marcus at school and offers something amazing: mentorship. 'I was invisible too once,' Mr. Foster tells Marcus. 'I almost gave up on art because nobody noticed. I'm so glad I didn't. I can help you understand that your talent matters, even if the world hasn't noticed yet.'",
    5: "Mr. Foster creates a summer apprenticeship for Marcus, teaching him professional techniques. In exchange, Marcus helps repair the damaged paintings, learning restoration skills. The destroyed artwork becomes Marcus's education. He learns that making art isn't just about creating—it's about problem-solving, technique, dedication, and service. Maya and Alex visit weekly, and Marcus teaches them what he's learning. What started as a mystery became a rescue mission.",
    6: "By summer's end, Marcus hosts his first real art show—displaying both his original work and the restored paintings. Mr. Foster introduces Marcus to the art community. Local galleries become interested in his unique style. But more important than gallery interest, Marcus has found his people—the community of artists who understand and value what he does. He's no longer invisible. He knows now that visibility isn't something forced; it comes from excellence and persistence.",
    7: "At the opening of Marcus's exhibit, he thanks Maya and Alex publicly. 'You could have gotten me arrested,' he says. 'Instead, you understood me and helped me find my path. You proved that mystery-solving isn't just about catching criminals. It's about understanding people and helping them become better.' The girls have learned that justice sometimes looks like compassion. As they leave the gallery, they're already thinking about their next case—something that will test their solving skills and their hearts.",
  },
  "The Red Herring": {
    0: "A precious jewelry box disappears from the town museum the night before the big auction. The most famous detective in the region arrives to solve the case. Detective Cross is confident and certain: The theft was obviously committed by international jewel thieves who have been operating in the region. The security guards report seeing a suspicious person in dark clothing and a hood. Detective Cross immediately arrests a traveler who fits that description. But something troubles Maya and Alex about how quickly the case was closed.",
    1: "The girls ask to speak with the arrested man. His name is David, and he's genuinely shocked to be accused. 'I wasn't even in the museum,' he protests. 'I was at the train station buying a ticket to leave town.' But the evidence seems to be against him—a witness saw someone in dark clothing, and David owns a dark jacket. Detective Cross seems satisfied with the case. But Maya's intuition says something is wrong. The evidence feels too obvious, too perfectly aligned. Like someone wanted the blame to land on David.",
    2: "Against the warning of their parents, Maya and Alex conduct their own investigation. They interview everyone who was at the museum that night. They discover something interesting: the 'suspicious witness' is a museum employee named Roger. He seemed very eager to identify David. The girls also learn that Roger has personal problems—gambling debts, in fact. He's desperately in need of money. Could Roger have set up David to take the blame while he stole the jewelry from inside the museum?",
    3: "The girls observe Roger carefully over several days. They notice he's in contact with someone—receiving messages, making quick trips away from work. They follow him (carefully, staying safe) and see him meeting someone at a local pawn shop. Through further investigation, they learn Roger has been selling jewelry—museum jewelry. David was set up as the 'red herring'—a false lead designed to distract everyone from Roger's actual guilt. The girls have found the truth, but now they need proof that will hold up legally.",
    4: "Maya and Alex bring their evidence to Detective Cross. He's initially defensive—admitting he made a mistake would damage his reputation. But the girls are persistent and thorough. They lay out their evidence: Roger's financial problems, the security camera footage (once examined carefully) showing Roger in the storage area, and the pawn shop records. Slowly, Detective Cross realizes they're right. He acknowledges his error to the girls privately: 'I made assumptions instead of investigating thoroughly. Thank you for reminding me to question my conclusions.'",
    5: "David is released with a sincere apology from the department. Detective Cross credits Maya and Alex in publicly acknowledging the real investigation that revealed Roger's guilt. The detective uses this case to completely change his investigation methods—he becomes less certain, more questioning, more thorough. He creates a training program for new detectives based partly on lessons from the girls. 'Good detecting means finding truth, not finding confirmation of what you already believe,' he tells new officers.",
    6: "The girls visit David before he leaves town. He's grateful but sad. 'Days of your life were stolen by being blamed for something you didn't do,' he says. 'Justice is good, but it doesn't give me back those days.' The conversation weighs on Maya and Alex. They realize that solving mysteries isn't just intellectual—it's about real people's lives. Getting it right matters tremendously because the consequences are real. This responsibility feels heavy and important.",
    7: "The case earns attention from a famous writer who follows Maya and Alex's detective work. A book is being written about them—but the main message, the girls insist, is about the danger of assumptions. The book becomes required reading at the police academy. David goes on to become a victims' advocate, helping people who've been wrongly accused. Marcus continues his art. The community is better because four young people refused to accept a convenient solution and dug for real truth. Mystery-solving, the girls learn, can make the world better.",
  },
};

// Function to get story content for a chapter
function getChapterContent(storyTitle: string, chapterIndex: number, worldName: string): string {
  // Return specific content for each story chapter
  return storyContent[storyTitle]?.[chapterIndex] || 
    `Chapter in ${storyTitle}: A new adventure unfolds in ${worldName}. As you progress through this chapter, you discover profound truths about courage, friendship, and the world around you.`;
}

// Function to get chapter image URL
function getChapterImageUrl(storyTitle: string, chapterIndex: number): string | undefined {
  return chapterImages[storyTitle]?.[chapterIndex];
}

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
    // 1. Create Levels and Badges
    // ============================================
    console.log("📚 Creating levels and badges...");
    const levelStars = [0, 50, 100, 150, 200, 250, 300, 400, 500, 600];
    const badges = [];

    for (let i = 0; i < levelStars.length; i++) {
      const level = await prisma.level.create({
        data: {
          levelNumber: i + 1,
          requiredStars: levelStars[i],
        },
      });

      const badge = await prisma.badge.create({
        data: {
          name: `Level ${i + 1}: ${
            i === 0
              ? "Story Starter"
              : i === 1
                ? "Story Explorer"
                : i === 2
                  ? "Story Enthusiast"
                  : i === 3
                    ? "Reading Ranger"
                    : i === 4
                      ? "Adventure Lover"
                      : i === 5
                        ? "World Discoverer"
                        : i === 6
                          ? "Challenge Master"
                          : i === 7
                            ? "Story Sage"
                            : i === 8
                              ? "Reading Champion"
                              : "Master Reader"
          }`,
          description: `Achieved ${levelStars[i]} stars`,
          levelId: level.id,
        },
      });
      badges.push(badge);
    }

    // ============================================
    // 2. Create Age Group
    // ============================================
    console.log("👦 Creating age group (6-7 years)...");
    const ageGroup = await prisma.ageGroup.create({
      data: {
        name: "6-7 years",
        minAge: 6,
        maxAge: 7,
      },
    });

    // ============================================
    // 3. Create Themes
    // ============================================
    console.log("🎨 Creating themes...");
    const adventureTheme = await prisma.theme.create({
      data: {
        name: "Adventure",
        description: "Explore magical worlds, face challenges, and discover new lands",
        imageUrl: "https://picsum.photos/800/600?random=97",
      },
    });

    const mysteryTheme = await prisma.theme.create({
      data: {
        name: "Mystery",
        description: "Solve puzzles, uncover secrets, and solve the mystery",
        imageUrl: "https://picsum.photos/800/600?random=98",
      },
    });

    // ============================================
    // 4. Create Roadmap 1: Adventure
    // ============================================
    console.log("🗺️  Creating Roadmap 1: Adventure...");
    const adventureRoadmap = await prisma.roadmap.create({
      data: {
        ageGroupId: ageGroup.id,
        themeId: adventureTheme.id,
      },
    });

    // ============================================
    // 5. Create Adventure World 1: Forest Quest
    // ============================================
    console.log("🌲 Creating World 1: Forest Quest...");
    const adventureWorld1 = await prisma.world.create({
      data: {
        roadmapId: adventureRoadmap.id,
        name: "Forest Quest",
        description: "Begin your adventure in an enchanted forest",
        order: 1,
        locked: false,
        requiredStarCount: 0,
      },
    });

    // Create 4 stories for Adventure World 1
    const adventureWorld1Stories = [];
    const world1StoryTitles = [
      { title: "The Lost Map", difficulty: 1 },
      { title: "River Crossing", difficulty: 2 },
      { title: "The Hidden Cave", difficulty: 3 },
      { title: "The Mountain Climb", difficulty: 3 },
    ];

    for (let s = 0; s < world1StoryTitles.length; s++) {
      const story = await createStory(
        adventureWorld1.id,
        world1StoryTitles[s].title,
        world1StoryTitles[s].difficulty,
        s + 1,
      );
      adventureWorld1Stories.push(story);

      // Create 8 chapters for each story
      const chapters = [];
      const chapterTitles = [
        "The Beginning",
        "First Steps",
        "The Discovery",
        "The Challenge",
        "Rising Tension",
        "The Twist",
        "The Climax",
        "The Resolution",
      ];

      for (let c = 0; c < 8; c++) {
        const chapter = await createChapter({
          storyId: story.id,
          title: chapterTitles[c],
          content: getChapterContent(world1StoryTitles[s].title, c, "Forest Quest"),
          order: c + 1,
          imageUrl: getChapterImageUrl(world1StoryTitles[s].title, c),
        });
        chapters.push(chapter);
      }

      // Create challenges for chapters 4, 5, 6, 8 only
      console.log(`  📖 ${story.title}: Creating challenges...`);

      // Chapter 4: MULTIPLE_CHOICE
      await createChallenge({
        chapterId: chapters[3].id,
        type: ChallengeType.MULTIPLE_CHOICE,
        question: `What is the main character trying to do in ${story.title}?`,
        description: "Test your understanding of the story so far.",
        baseStars: 20,
        maxAttempts: 3,
        hints: ["Think about what the character said at the beginning"],
        answers: [
          { text: "Find treasure", isCorrect: true },
          { text: "Find their way home", isCorrect: false },
          { text: "Meet new friends", isCorrect: false },
        ],
        order: 1,
      });

      // Chapter 5: RIDDLE
      await createChallenge({
        chapterId: chapters[4].id,
        type: ChallengeType.RIDDLE,
        question: "I have cities but no houses, forests but no trees, and water but no fish. What am I?",
        description: "Solve this riddle about the land our hero is exploring.",
        baseStars: 30,
        hints: ["It's something you look at", "You might find one in a classroom"],
        answers: [
          { text: "A map", isCorrect: true },
          { text: "A painting", isCorrect: false },
          { text: "A dream", isCorrect: false },
        ],
        order: 2,
      });

      // Chapter 6: MORAL_DECISION
      await createChallenge({
        chapterId: chapters[5].id,
        type: ChallengeType.MORAL_DECISION,
        question: "The character could help a stranger or continue their journey. What should they do?",
        description: "There is no wrong answer. What do you think is the right choice and why?",
        baseStars: 20,
        answers: [
          { text: "Help the stranger, even if it delays the journey", isCorrect: true },
          { text: "Help the stranger because they asked nicely", isCorrect: true },
          { text: "Continue the journey to reach the destination faster", isCorrect: true },
        ],
        order: 3,
      });

      // Chapter 8: CHOOSE_ENDING
      await createChallenge({
        chapterId: chapters[7].id,
        type: ChallengeType.CHOOSE_ENDING,
        question: "What happens next in the story?",
        description: "There is no wrong ending! Choose what you think would be best.",
        baseStars: 20,
        answers: [
          {
            text: "The hero discovers hidden treasure and becomes a legend",
            isCorrect: true,
          },
          {
            text: "The hero returns home with stories of adventure to share",
            isCorrect: true,
          },
          { text: "The hero meets companions for the next adventure", isCorrect: true },
        ],
        order: 4,
      });
    }

    // ============================================
    // 6. Create Adventure World 2: Desert Journey
    // ============================================
    console.log("🏜️  Creating World 2: Desert Journey...");
    const adventureWorld2 = await prisma.world.create({
      data: {
        roadmapId: adventureRoadmap.id,
        name: "Desert Journey",
        description: "Continue your adventure in a vast desert",
        order: 2,
        locked: true,
        requiredStarCount: 250,
      },
    });

    // Create 4 stories for Adventure World 2
    const world2StoryTitles = [
      { title: "The Mirage", difficulty: 3 },
      { title: "The Oasis", difficulty: 3 },
      { title: "The Sandstorm", difficulty: 4 },
      { title: "The Pyramid", difficulty: 4 },
    ];

    for (let s = 0; s < world2StoryTitles.length; s++) {
      const story = await createStory(
        adventureWorld2.id,
        world2StoryTitles[s].title,
        world2StoryTitles[s].difficulty,
        s + 1,
      );

      // Create 8 chapters for each story
      const chapters = [];
      const chapterTitles = [
        "The Beginning",
        "First Steps",
        "The Discovery",
        "The Challenge",
        "Rising Tension",
        "The Twist",
        "The Climax",
        "The Resolution",
      ];

      for (let c = 0; c < 8; c++) {
        const chapter = await createChapter({
          storyId: story.id,
          title: chapterTitles[c],
          content: getChapterContent(world2StoryTitles[s].title, c, "Desert Journey"),
          order: c + 1,
          imageUrl: getChapterImageUrl(world2StoryTitles[s].title, c),
        });
        chapters.push(chapter);
      }

      // Create challenges for chapters 4, 5, 6, 8 only
      console.log(`  📖 ${story.title}: Creating challenges...`);

      // Chapter 4: TRUE_FALSE
      await createChallenge({
        chapterId: chapters[3].id,
        type: ChallengeType.TRUE_FALSE,
        question: "In the story, the hero was prepared for this adventure.",
        description: "Determine if this statement is true or false based on the story.",
        baseStars: 15,
        maxAttempts: 2,
        answers: [
          { text: "True", isCorrect: false },
          { text: "False", isCorrect: true },
        ],
        order: 1,
      });

      // Chapter 5: RIDDLE
      await createChallenge({
        chapterId: chapters[4].id,
        type: ChallengeType.RIDDLE,
        question: "I come down but never go up. What am I?",
        description: "Think about what falls in the desert sky.",
        baseStars: 25,
        hints: ["It comes from clouds", "Plants need it to grow"],
        answers: [
          { text: "Rain", isCorrect: true },
          { text: "Sand", isCorrect: false },
          { text: "Wind", isCorrect: false },
        ],
        order: 2,
      });

      // Chapter 6: MULTIPLE_CHOICE
      await createChallenge({
        chapterId: chapters[5].id,
        type: ChallengeType.MULTIPLE_CHOICE,
        question: `How does the hero feel after the events in ${story.title}?`,
        baseStars: 20,
        maxAttempts: 3,
        answers: [
          { text: "Brave and determined", isCorrect: true },
          { text: "Scared and uncertain", isCorrect: false },
          { text: "Bored and tired", isCorrect: false },
        ],
        order: 3,
      });

      // Chapter 8: CHOOSE_ENDING
      await createChallenge({
        chapterId: chapters[7].id,
        type: ChallengeType.CHOOSE_ENDING,
        question: "How should this adventure end?",
        baseStars: 20,
        answers: [
          { text: "The hero finds peace in the desert", isCorrect: true },
          { text: "The hero helps others in the desert", isCorrect: true },
          { text: "The hero begins a new adventure", isCorrect: true },
        ],
        order: 4,
      });
    }

    // ============================================
    // 7. Create Roadmap 2: Mystery
    // ============================================
    console.log("🕵️ Creating Roadmap 2: Mystery...");
    const mysteryRoadmap = await prisma.roadmap.create({
      data: {
        ageGroupId: ageGroup.id,
        themeId: mysteryTheme.id,
      },
    });

    // ============================================
    // 8. Create Mystery World 1: The Missing Toy
    // ============================================
    console.log("🧩 Creating World 1: The Missing Toy...");
    const mysteryWorld1 = await prisma.world.create({
      data: {
        roadmapId: mysteryRoadmap.id,
        name: "The Missing Toy",
        description: "Help solve the mystery of the missing toy",
        order: 1,
        locked: false,
        requiredStarCount: 0,
      },
    });

    // Create 4 stories for Mystery World 1
    const mysteryWorld1Titles = [
      { title: "The Disappearance", difficulty: 1 },
      { title: "Following Clues", difficulty: 2 },
      { title: "The Red Herring", difficulty: 3 },
      { title: "The Truth Revealed", difficulty: 3 },
    ];

    for (let s = 0; s < mysteryWorld1Titles.length; s++) {
      const story = await createStory(
        mysteryWorld1.id,
        mysteryWorld1Titles[s].title,
        mysteryWorld1Titles[s].difficulty,
        s + 1,
      );

      // Create 8 chapters for each story
      const chapters = [];
      const chapterTitles = [
        "The Discovery",
        "Something's Wrong",
        "The Investigation",
        "First Clues",
        "A Suspect",
        "The Real Clue",
        "The Confrontation",
        "Mystery Solved",
      ];

      for (let c = 0; c < 8; c++) {
        const chapter = await createChapter({
          storyId: story.id,
          title: chapterTitles[c],
          content: getChapterContent(mysteryWorld1Titles[s].title, c, "The Missing Toy"),
          order: c + 1,
          imageUrl: getChapterImageUrl(mysteryWorld1Titles[s].title, c),
        });
        chapters.push(chapter);
      }

      // Create challenges for chapters 4, 5, 6, 8 only
      console.log(`  📖 ${story.title}: Creating challenges...`);

      // Chapter 4: MULTIPLE_CHOICE
      await createChallenge({
        chapterId: chapters[3].id,
        type: ChallengeType.MULTIPLE_CHOICE,
        question: `What is the first clue in ${story.title}?`,
        baseStars: 20,
        maxAttempts: 3,
        answers: [
          { text: "A mysterious note", isCorrect: true },
          { text: "A broken window", isCorrect: false },
          { text: "Missing money", isCorrect: false },
        ],
        order: 1,
      });

      // Chapter 5: RIDDLE
      await createChallenge({
        chapterId: chapters[4].id,
        type: ChallengeType.RIDDLE,
        question: "I have a face and two hands, but no arms or legs. What am I?",
        description: "Think about time and clues in mystery stories.",
        baseStars: 30,
        hints: ["It helps you know when something happened", "It's on many walls"],
        answers: [
          { text: "A clock", isCorrect: true },
          { text: "A map", isCorrect: false },
          { text: "A photo", isCorrect: false },
        ],
        order: 2,
      });

      // Chapter 6: MORAL_DECISION
      await createChallenge({
        chapterId: chapters[5].id,
        type: ChallengeType.MORAL_DECISION,
        question:
          "Should the detective tell their friend they are a suspect, even though it might hurt them?",
        description:
          "What do you think is the right thing to do in this situation?",
        baseStars: 20,
        answers: [
          { text: "Tell them, honesty is important", isCorrect: true },
          { text: "Wait until you have more proof", isCorrect: true },
          { text: "Never tell them to protect the friendship", isCorrect: true },
        ],
        order: 3,
      });

      // Chapter 8: CHOOSE_ENDING
      await createChallenge({
        chapterId: chapters[7].id,
        type: ChallengeType.CHOOSE_ENDING,
        question: "Who should have found the toy?",
        baseStars: 20,
        answers: [
          { text: "The detective solves it themselves", isCorrect: true },
          { text: "A friend reveals the truth", isCorrect: true },
          { text: "An unexpected person comes forward", isCorrect: true },
        ],
        order: 4,
      });
    }

    // ============================================
    // 9. Create Mystery World 2: Secret of the Old House
    // ============================================
    console.log("🏚️  Creating World 2: Secret of the Old House...");
    const mysteryWorld2 = await prisma.world.create({
      data: {
        roadmapId: mysteryRoadmap.id,
        name: "Secret of the Old House",
        description: "Uncover the secrets hidden in the old house",
        order: 2,
        locked: true,
        requiredStarCount: 250,
      },
    });

    // Create 4 stories for Mystery World 2
    const mysteryWorld2Titles = [
      { title: "The Old House", difficulty: 3 },
      { title: "Strange Sounds", difficulty: 3 },
      { title: "Hidden Passages", difficulty: 4 },
      { title: "The Secret Room", difficulty: 4 },
    ];

    for (let s = 0; s < mysteryWorld2Titles.length; s++) {
      const story = await createStory(
        mysteryWorld2.id,
        mysteryWorld2Titles[s].title,
        mysteryWorld2Titles[s].difficulty,
        s + 1,
      );

      // Create 8 chapters for each story
      const chapters = [];
      const chapterTitles = [
        "The Discovery",
        "Exploring",
        "The First Clue",
        "The Search Begins",
        "Getting Closer",
        "The Breakthrough",
        "The Final Test",
        "The Truth",
      ];

      for (let c = 0; c < 8; c++) {
        const chapter = await createChapter({
          storyId: story.id,
          title: chapterTitles[c],
          content: getChapterContent(mysteryWorld2Titles[s].title, c, "Secret of the Old House"),
          order: c + 1,
          imageUrl: getChapterImageUrl(mysteryWorld2Titles[s].title, c),
        });
        chapters.push(chapter);
      }

      // Create challenges for chapters 4, 5, 6, 8 only
      console.log(`  📖 ${story.title}: Creating challenges...`);

      // Chapter 4: MULTIPLE_CHOICE
      await createChallenge({
        chapterId: chapters[3].id,
        type: ChallengeType.MULTIPLE_CHOICE,
        question: `What does the explorer see in ${story.title}?`,
        baseStars: 20,
        maxAttempts: 3,
        answers: [
          { text: "An old portrait", isCorrect: true },
          { text: "A modern painting", isCorrect: false },
          { text: "A mirror", isCorrect: false },
        ],
        order: 1,
      });

      // Chapter 5: TRUE_FALSE
      await createChallenge({
        chapterId: chapters[4].id,
        type: ChallengeType.TRUE_FALSE,
        question: "The explorer is afraid of what they find.",
        baseStars: 15,
        maxAttempts: 2,
        answers: [
          { text: "True", isCorrect: true },
          { text: "False", isCorrect: false },
        ],
        order: 2,
      });

      // Chapter 6: MORAL_DECISION
      await createChallenge({
        chapterId: chapters[5].id,
        type: ChallengeType.MORAL_DECISION,
        question:
          "Should the explorer share the secret they found with the house's owner?",
        description: "What is the right thing to do?",
        baseStars: 20,
        answers: [
          { text: "Tell them immediately", isCorrect: true },
          { text: "Research first before telling", isCorrect: true },
          { text: "Keep it a secret to protect them", isCorrect: true },
        ],
        order: 3,
      });

      // Chapter 8: CHOOSE_ENDING
      await createChallenge({
        chapterId: chapters[7].id,
        type: ChallengeType.CHOOSE_ENDING,
        question: "What is the ultimate secret of the old house?",
        baseStars: 20,
        answers: [
          { text: "A hidden treasure from the past", isCorrect: true },
          { text: "A family's lost memories and love", isCorrect: true },
          { text: "A magical mystery that changes everything", isCorrect: true },
        ],
        order: 4,
      });
    }

    console.log("✅ Database seeding completed successfully!");
    console.log(`
      📊 Summary:
      - Age Groups: 1 (6-7 years)
      - Roadmaps: 2 (Adventure, Mystery)
      - Worlds: 4 (2 per Roadmap)
      - Stories: 16 (4 per World)
      - Chapters: 128 (8 per Story)
      - Challenges: ~50 (2-4 per Story)
      - Levels: 10
      - Badges: 10
    `);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
