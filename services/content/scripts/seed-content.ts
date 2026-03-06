/**
 * Database Seed Script for Content Service
 * Populates the database with test data for development and testing
 * 
 * Structure:
 * - 1 Age Group (6-7 years) with translations (EN, AR, FR)
 * - 2 Themes (Adventure, Mystery) with translations
 * - 2 Roadmaps with translations
 * - 2 Worlds per Roadmap (4 total) with translations
 * - 4 Stories per World (16 total) with translations
 * - 8 Chapters per Story (64 total for one story) with translations
 * - Challenges per Story with full translations
 * - 10 Levels with Badges and translations
 *
 * Run with: npx ts-node scripts/seed-content.ts
 * Or: npm run seed
 */

import { PrismaClient, ChallengeType, LanguageCode, ReadingLevel } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================
// STORY CONTENT DATA
// ============================================

const storyContent: { [key: string]: { [chapterIndex: number]: string } } = {
  "The Lost Map": {
    0: "You wake up to the sound of birds singing outside a cozy cabin nestled deep in an enchanted forest. Warm sunlight streams through the round windows, painting everything in shades of gold and green. The smell of fresh bread fills the air. Your grandmother sits quietly by a crackling fireplace, her weathered hands holding an ancient leather journal bound with golden string. She looks up at you with twinkling eyes and a mysterious smile. 'I have something very special for you today,' she whispers. 'Something no one in our family has ever found...'",
    1: "You step out of the cabin and gasp! The forest is alive with magic. Tall trees with emerald leaves reach toward the sky, and the air is cool and sweet, smelling of pine needles and morning dew. A winding path of smooth white stones stretches before you, disappearing into a thick grove where shafts of sunlight break through in golden rays. You hear the distant sound of running water—like nature's music—calling you forward. Your heart beats with excitement as you take your first step on the adventure of a lifetime.",
    2: "After walking for what feels like hours, following the sound of rushing water, you discover something that takes your breath away! A magnificent waterfall tumbles down from moss-covered cliffs, spraying water into the air. The water catches the sunlight and transforms into thousands of dancing rainbows—one for each color you can imagine. Behind the waterfall, you can see the faint outline of a cave entrance. It's magical, mysterious, and waiting just for you.",
    3: "You gather every bit of courage in your heart and approach the stone steps carved into the cliff face. Each step echoes beneath your feet—tap, tap, tap—like the heartbeat of the mountain itself. The steps spiral upward, and the air grows cooler. Halfway up, your breath catches. Standing blocking your path is a magnificent silver wolf! Its fur shimmers like moonlight, and its eyes are wise and intelligent, studying you carefully. You freeze. The wolf doesn't look angry—it looks... curious.",
    4: "Your hands tremble, but you stand still. The wolf circles around you slowly, never taking its piercing silver eyes off yours. Then, something magical happens—the wolf does something you never expected. It lowers its great head and bows! The gesture is respectful, almost welcoming. The wolf moves to the side, clearing your path up the mountain. As you pass, it places its soft nose gently against your hand. You realize the wolf was never a threat—it was a guardian, protecting this sacred place until someone worthy arrived.",
    5: "You climb the remaining stones and step into an ancient stone chamber carved deep within the mountain. Your eyes grow wide with amazement! The walls seem to glow softly from within. Carved into the stone shelves around you are hundreds—maybe thousands—of crystals that sparkle with their own inner light. Blue crystals like sapphires, purple amethysts, and green emeralds catch the light and dance across the walls. The air tingles with magic, and you realize you've entered a place more wonderful than any treasure.",
    6: "With shaking hands, you carefully open the golden journal your grandmother gave you. As the pages unfold, something miraculous happens! The crystals around you begin to glow even brighter, filling the chamber with brilliant light. It's as if they're celebrating your discovery! The journal contains a written record of your family's greatest adventures, spanning generations. Each page tells a story of kindness, courage, and love. You understand now that this journey was never about finding treasure—it was about finding your family's heart.",
    7: "You carefully wrap the journal and begin your descent. At the bottom of the mountain, your silver wolf friend is waiting. Together, you walk back through the forest as sunset paints the sky in shades of orange, pink, and purple. The wolf walks beside you like a faithful companion, and you know this adventure has changed you forever. You've learned that the greatest treasures aren't gold or jewels—they're the stories of love and courage passed down through families, and the friends we make along the way.",
  },
  "River Crossing": {
    0: "The morning sun finds you standing at the edge of a wide, rushing river. The water flows fast and powerful, churning white with foam. Your guide, Captain Moss, a weathered explorer with kind eyes, shakes his head slowly. 'This river is very dangerous today,' he says seriously. 'The spring rains have made the current stronger than ever. Most people would turn back.' He looks at you carefully. 'But I have a feeling you might be braver than most.'",
    1: "You walk along the rocky riverbank for nearly an hour, studying the terrain carefully. The sound of rushing water fills your ears. Then suddenly, you spot it! A series of large, smooth, flat rocks juts out from the water like stepping stones, creating a natural path across the river. They're spaced far enough apart to jump from one to the next. 'Look!' you shout to Captain Moss. He examines them and laughs. 'I've crossed this river a hundred times, and I've never seen these rocks positioned quite this perfectly. It's almost as if the river itself is helping you.'",
    2: "You return at dawn the next day, ready for your crossing. The morning mist rises from the water like ghostly fingers. The rocks are visible now in the growing light, but they look slippery and smooth. Water splashes over them constantly, sending up spray. The air is cold and damp. Captain Moss checks your rope and gives you an encouraging nod. 'Remember,' he says, 'stay calm, move carefully, and trust in your own balance. The river tests not just your body, but also your mind and spirit.'",
    3: "You grip the sturdy rope Captain Moss has strung across the stones, and with a deep breath, you step onto the first rock. Your heart pounds in your chest like a drum. The stone is wet and round beneath your feet, and the river roars beside you. One step at a time, you whisper to yourself. Jump. Balance. Breathe. Jump again. Water splashes up, soaking your legs, but you don't falter. You're doing it! Each stone brings you one step closer to the other side, one step closer to proving you can do this.",
    4: "Halfway across, the current suddenly strengthens. A massive surge of water hits your legs, nearly sweeping you off your stone! You wobble, your arms spinning for balance. The rope is the only thing keeping you from being swept downstream. Your muscles burn with effort. This is the true test, you realize. Not the physical crossing, but staying calm when things become difficult. You close your eyes for just a moment, breathe deeply, and find your center. Your body settles. Your feet grip the stone more firmly. You continue, one careful step at a time.",
    5: "One more jump! Your foot lands on the final stone, and suddenly, you're leaping onto the soft grass of the far bank! Captain Moss is waiting for you, arms outstretched. He claps you on the back with such force you nearly fall over, laughing with joy. 'You did it!' he shouts. 'I saw courage in every step. The river tested you, and you proved that you have the heart of a true explorer!'",
    6: "As you rest on the riverbank, still catching your breath, something magical happens. The mist parts, and a hidden village appears through the trees as if conjured by magic. Colorful houses with rounded roofs painted in reds, yellows, and blues greet you. Smoke curls from chimneys, carrying the smell of cooking and warm hearths. People emerge from doorways, waving in welcome. It's a place that has been hidden from the world, protected by the river you just crossed.",
    7: "The village elder takes you to their ancient library, a building carved from stone and wood. Inside, candles flicker, and the air smells of old leather and parchment. You're shown maps older than anyone can remember—maps that chart forgotten lands, hidden passages, and secret journeys. The elder places a worn, beautiful map in your hands. 'You've earned the right to possess this,' she says. 'It shows the path to inner wisdom. Guard it well, and one day, you'll understand why crossing that river was so important.'",
  },
  "The Hidden Cave": {
    0: "Deep within a vast forest filled with towering trees and mysterious shadows lies a secret that few have ever discovered. Your mentor, a wise woman with eyes that seem to hold a thousand stories, points toward a moss-covered rock formation hidden behind vines. The rocks are ancient and smooth, shaped by water and time. 'Behind there,' she whispers, her voice barely above a breath, 'lies a cave filled with ancient wonders. Something precious that has been hidden for thousands of years. Only the truly curious and kind can find it,' she says with a knowing smile.",
    1: "You squeeze through the narrow entrance into a vast underground chamber, and your torch illuminates a scene that steals your breath. The walls are covered in magnificent paintings—hundreds of them! Ancient artists created these images by mixing crushed stones and natural colors with water. The paintings seem to move in the flickering torchlight. Handprints, animals, hunters, and scenes of daily life leap out at you from the stone. You realize you're standing in an art gallery created thousands of years ago.",
    2: "As your torch illuminates each painting, you begin to understand what you're seeing. The paintings tell stories of ancient peoples who lived in connection with nature. Hunters track great beasts across stone plains. Dancers celebrate under moon and stars. Children play in forests. Families gather around fires. Animals of all kinds—bison, deer, horses, and birds—are painted with such detail and love that they seem almost alive. These aren't just random drawings; they're a record of a civilization's heart and soul frozen in time.",
    3: "You kneel before a particularly magnificent painting of a great bison. The artist has captured every detail—the powerful muscles, the proud stance, even the intelligence in the animal's eye. The work is so skilled, so beautiful, that tears fill your eyes. How long did this take? you wonder. Were there artists here thousands of years ago, just like the painters you know today? Did someone stand here and say, 'I want to create something beautiful that will last forever'? The answer seems to shimmer in the ancient stone.",
    4: "Deeper into the cave, you discover an entire gallery dedicated to handprints. Hands of all sizes—children's small hands, adults' strong hands—have been pressed against the stone and outlined in natural pigments. Each handprint is unique, each one a personal mark. You place your own hand against some of the ancient prints, palm-to-palm, across thousands of years of time. It's as though you're shaking hands with the past, connecting with people who lived when your great-great-grandparents' ancestors were just being born.",
    5: "As you venture deeper, the cave opens dramatically into a vast underground lake. The water is crystal-clear, so pure that it reflects every detail of the torchlight. It's like liquid moonlight, creating a mirror image of the chamber above. The silence is profound, broken only by the soft drip of water echoing through the cavern. It's the most peaceful, most beautiful place you've ever seen. You realize that traveling through darkness, you've found light in the most unexpected place.",
    6: "Your mentor joins you and places a gentle hand on your shoulder. 'These caves are sacred places,' she says with deep respect. 'The ancient peoples who created these paintings understood something we sometimes forget—that art is the language of the soul. They created these paintings not for fame or money, but to leave a piece of themselves for future generations. You are honored to witness this. This knowledge carries responsibility. These caves must be protected and revered.'",
    7: "As you make your way back through the darkness toward the cave entrance, with torchlight dancing on the ancient walls, you feel transformed. You now understand why people traveled so far and worked so hard to create these masterpieces in the darkness these paintings were never meant to be seen by many. They were created from the heart, for the heart—a conversation between the artist and the eternal. You carry this understanding with you as you step back into the sunlight, forever changed by your encounter with the ancient ones.",
  },
  "The Mountain Climb": {
    0: "You stand at the base of the tallest mountain in all the land. Its peak rises so high it pierces the clouds like a needle, disappearing into white mist far above you. The mountain is both beautiful and terrifying. Snow covers its upper slopes, and you can see avalanche paths where nothing grows. This mountain challenges anyone who dares to attempt its summit. Most people look at it and see an impossible obstacle. But you see an opportunity for the greatest adventure of your life.",
    1: "The first path winds gently upward through a lush forest. Ancient trees with thick trunks and emerald canopies stretch upward so tall they seem to touch the sky. Shafts of golden sunlight break through the leaves. The air is fresh and alive with the sounds of birds and running water. It's so beautiful that you feel like you're walking through a magical realm. The trees themselves seem to be climbing upward with you, their roots digging deeper, their branches reaching higher, as if they too are challenging themselves to reach the summit.",
    2: "Higher and higher you climb, and the forest grows thinner. The air grows colder and thinner too. You have to breathe deeper to fill your lungs. Your legs begin to feel heavy. The trees become smaller and smaller until there are no trees at all, only rocks, hardy shrubs, and sparse grass. You wrap your cloak tighter around yourself as the wind picks up and bites at your cheeks. The world below grows smaller, but your determination grows larger. You are entering the realm where the mountain truly tests your resolve.",
    3: "You finally reach a wide plateau and pause to rest. When you turn around and look back down the mountain, your heart swells with accomplishment. The forest far below looks like a green blanket. Rivers appear as silver threads. Villages look like tiny toys. You had no idea you'd climbed this high! Your legs ache, and your lungs burn, but the view fills you with a sense of triumph. You've already accomplished more than you thought possible. And you haven't even reached the summit yet.",
    4: "The final stretch of mountain looms before you. It's the steepest part of the entire climb. The path is narrow and rockier, with loose stones that shift beneath your boots. Your legs burn with exhaustion and effort. Every step seems to require all your strength. But then you look up, and the summit is so close you feel like you could reach out and touch it! Your spirit soars even though your body is tired. You can do this. Just a little bit more. The summit is within reach. You will not give up now.",
    5: "Without warning, the sky darkens. Black clouds boil up from nowhere like something alive. Thunder rumbles with a sound like the earth breaking apart. Lightning flashes brilliantly around you, followed by thunder so loud it echoes off the mountainside. Rain erupts from the sky like an ocean pouring down. The wind becomes fierce and tries to push you backward, trying to throw you off the narrow path. Do you turn back now? Your warm, safe camp is only a few hours of scrambling down. Or do you push forward through this terrifying storm?",
    6: "You grit your teeth and push forward, head lowered against the wind and rain. You refuse to turn back. One step at a time. That's all you can do. The path is slippery, and visibility is nearly zero, but you can feel the slope changing. You're climbing even more steeply now. The wind howls like a living thing, trying to tell you to stop, to quit, to go back. But something inside you—something deep and strong and determined—keeps moving forward. The summit is within reach. You can almost feel it.",
    7: "Suddenly, the rain stops. The clouds part. And then you see it—you've reached the summit! You plant your flag at the peak, and it flutters bravely in the wind. You've done it! You've conquered the mountain! The view from the top steals your breath away. You can see forever—mountains stretching to every horizon, valleys far below, clouds drifting like ships in a cotton-white sea. From down there, the mountain looked impossible. But now that you're here, you know that the impossible becomes possible through determination, courage, and the refusal to give up.",
  },
  "The Mirage": {
    0: "The desert sun beats down mercilessly, turning the sand into a shimmering ocean of heat. You've been walking for days and days in this endless landscape, following what you believe is an ancient map leading to treasure. Your lips are dry, your skin is burned, and your water supply is running lower each day. But you press on, because the map feels right, and your heart tells you that something precious waits ahead. Sometimes, you think, faith and determination are all that keep us moving forward.",
    1: "Then, something impossible happens. On the horizon, you see a beautiful city! Green gardens fill with date palms and fruit trees. Streams of water flow through streets. People and animals move about. Buildings shimmer with color and life. It looks so real, so inviting. You squint at it, thinking it's a trick of the light, but no—it's definitely there. Your heart soars. After days of walking through nothing but sand and heat, you've found civilization! You begin walking faster, almost running toward it, desperate to reach shelter, food, and water.",
    2: "You approach the city slowly, but something doesn't feel right. The closer you get, the less solid it seems. The edges are blurry, like a painting done in watercolors beginning to run. The people and animals you saw seem to be getting farther away, even though you're walking toward them. The temperature around you remains blazing hot, and you notice your shadow doesn't fall quite right. It's subtly wrong. Your mind begins to understand what your heart doesn't want to accept.",
    3: "You reach out your hand to touch a building wall, and your hand passes right through it! There's nothing there but air. It's a mirage—a trick of light and heat and desperate hope. But how can a mirage be so detailed? How can it include people and animals and entire buildings? You feel confused and disappointed. The illusion shimmers and fades. What was the point of that vision? Why did the universe show you something that isn't real?",
    4: "Then you hear a voice behind you. 'Many set out to seek what they see, but wisdom lies in what they understand, not what they observe.' You spin around to see an old desert dweller, weathered by sun and time, standing in the shade of a rock formation. Her eyes hold the wisdom of someone who has lived many years in this harsh land. She beckons you to sit in the shade and gives you water—real water. You drink gratefully, barely believing the relief it brings.",
    5: "The old woman points toward the eastern horizon, beyond where the mirage was. 'The true city lies not in the sand, but in the hearts of those who search with purpose,' she says. 'The mirage you saw was a test. It showed truth in false form. Now I can show you the real thing because you have learned the difference.' She leads you along a hidden path you never would have found yourself, moving carefully through the dunes with the knowledge of someone who truly understands this land.",
    6: "Following her guidance, you discover real oasis settlements hidden in the desert. These aren't cities of illusion—they're real communities where people have lived for generations, tending date palms and managing the precious water that sustains them. They welcome you warmly, sharing dates and stories. You learn their irrigation techniques and their understanding of the desert's rhythms. These people are real, and their wisdom is real. The work they do is real.",
    7: "As you sit with the desert dwellers, sharing food and conversation, you finally understand. The greatest treasure wasn't a single city or a hoard of gold. The greatest treasure was the journey itself—the lessons learned, the people met, and the understanding gained that true wealth comes not from what glimmers in the distance, but from what's built with care and intention in the present moment. You realize you've found something more valuable than any mirage—you've found the truth.",
  },
  "The Oasis": {
    0: "Legends throughout the desert speak of an oasis that never dries up, even during the harshest droughts. Some say it's a myth. Others say it's cursed. Still others claim it holds magic. You've heard these stories all your life, and now, finally, you've decided to search for it. Your guides think you're crazy. Your family thinks you're foolish. But you pack your supplies anyway. If the oasis exists, you'll find it. And if it doesn't, at least you'll have tried.",
    1: "After weeks of searching through endless dunes, your persistence finally pays off. You crest a high sand dune and stop, barely daring to breathe. Below you stretches a hidden valley surrounded by towering cliffs of red stone that seem to glow in the sunlight. At the center of the valley, water sparkles like liquid diamonds, and green vegetation surrounds it in a perfect circle. The oasis! It exists! It's real! It's more beautiful than any legend described. You stumble down into the valley, almost unable to believe your eyes.",
    2: "As you enter the oasis, you're surrounded by wonders. Tall palm trees create a canopy of shade that feels like a blessing after days in the burning sun. The air is cool and filled with the sound of flowing water—streams and fountains fed by springs that seem never to stop flowing. Flowers bloom in impossible colors—violets, yellows, reds, and oranges. This place is a paradise, an Eden in the middle of the desert. The water is so clear you can see the bottom. You cup it in your hands and drink, and it's the sweetest, purest water you've ever tasted.",
    3: "As you explore deeper, you discover that the oasis is populated. People live here! A settlement of perhaps fifty families has built homes and gardens and established a life around these precious springs. They greet you with surprising warmth and curiosity. You ask them how they came to live here, and they tell you stories spanning generations. Ancestors discovered this place centuries ago and chose to stay, protecting it and building a society based on sharing and conservation.",
    4: "The settlement's leader, an elderly woman with kind eyes, takes you on a tour of the oasis's mysteries. She teaches you about the underground rivers that feed the oasis—great rivers flowing beneath the sand that have never dried up in recorded history. 'Nature has hidden plumbing,' she jokes, showing you how the water rises through natural springs and is channeled into gardens. You learn that the water is so abundant here that they're able to grow crops and fruit trees while still having enough to drink, bathe, and play in. It's a perfect balance carefully maintained over centuries.",
    5: "The community teaches you ancient techniques for water conservation that have allowed this oasis to thrive for over a thousand years. You learn how to channel water without waste, how to create terraces for gardens that use every drop, and how to preserve the springs so they continue flowing. Every person, from the smallest child to the eldest elder, understands their responsibility in maintaining this delicate gift. Water isn't just used; it's respected, honored, and protected. This lesson transforms your understanding of nature's precious resources.",
    6: "Before you leave the oasis, the community ceremonially presents you with seeds of rare desert plants—plants that bloom with beautiful flowers and bear fruit. 'So you can bring the desert to life wherever you go,' they say. 'Share these seeds. Help others understand that even the harshest places can be transformed through caring intention and knowledge.' You accept the seeds with tears in your eyes, knowing you've been given something far more valuable than gold.",
    7: "As you make your way back out of the valley toward the desert beyond, you feel transformed. The oasis wasn't just a place of water and vegetation. It was a lesson in persistence, a demonstration of community, and proof that even in the harshest environments, life can flourish through balanced effort and mutual care. You depart with new knowledge, renewed hope, and seeds to plant. The oasis wasn't just a destination—it was an awakening. And you know that everywhere you go, you'll carry its wisdom with you.",
  },
  "The Sandstorm": {
    0: "The sky darkens ominously, and the temperature suddenly drops. You've only been in the desert for a few hours when you notice it—a wall of sand and wind approaching from the horizon like a living creature. It's a sandstorm, and it's massive. Visibility drops from miles to feet in seconds. The wind howls like a thousand wolves, and sand stings your skin like needles. Everyone around you begins to panic. This is one of nature's most terrifying forces, and you're caught in its path.",
    1: "You scramble desperately to prepare before the storm reaches you. You secure your tent, gather your supplies, tie everything down that might blow away. Sand already fills the air, reducing visibility to almost nothing. You can barely see your own hands in front of your face. The wind is so strong it nearly knocks you over. You find shelter and huddle down, pulling cloth over your mouth and nose, waiting for the storm to pass. It's terrifying. Everything is chaos.",
    2: "The wind howls with a force that sounds almost alive, almost angry. It batters your shelter from all sides. Sand pours in through every crack and crevice, grinding between your teeth, filling your eyes, coating every inch of skin. It feels like the whole world is being torn apart. You wonder if this storm might last forever, if you'll be buried here in the sand, becoming part of the desert itself. The force is so overwhelming that rational thought becomes difficult. You must take shelter and hold on, or risk being lost forever in this chaos.",
    3: "You find a large rock formation to hide behind and wedge yourself into a small cave opening. Sand batters you relentlessly, but the rock shields you from the worst of it. Your heart pounds like a drum. The sound is deafening. The wind tries to blow you out of your shelter. Your hands grip to the rocks with all their strength. You won't let go. You won't give up. You'll hold on to this shelter and survive. Around you, the storm rage on, powerful and uncaring, a force of nature that dwarfs human strength.",
    4: "Hours pass. Or is it days? Time becomes meaningless in the darkness of the storm. Your throat is dry from sand. Your muscles burn from tension. The storm continues without pause or mercy. You wonder if it will ever end, if this is just how the world is now—endless storm, endless sand, endless noise. But then you remember something you once read: all storms pass eventually. They always do. Even the most powerful storms eventually run out of energy. Knowing this helps. You close your eyes and wait, trying to stay calm, trying to breathe slowly.",
    5: "Your supplies are running lower. You've drunk most of your water, and you need to be careful about what's left. The sand dust makes everything harder. You must stay calm and think clearly, because panic wastes energy and consumes water. You count your supplies mentally. You have enough to last, as long as the storm doesn't continue for more than a few more days. But you push away the fear that it might. Fear is the enemy now. Calm thinking is your ally. You breathe slowly and wait.",
    6: "Then, gradually—so gradually you almost don't notice—the wind begins to weaken. The sound, which has been a constant roar, begins to diminish. The sand, which poured down like rain, begins to ease. You can see slightly farther now—maybe ten feet instead of three. Your heart begins to hope. The storm is finally passing! Almost imperceptibly, it continues to diminish until finally, after what feels like an eternity, the wind dies to a breeze. The air clears. The sand settles. The storm is gone. You're alive!",
    7: "As the sun breaks through the clearing dust and takes on a golden hue again, you emerge from your shelter and look at the transformed landscape. Sand dunes that didn't exist yesterday have appeared. Landmarks you recognized are buried. But you're alive. You survived something that would have destroyed many people. You realize that surviving this storm has made you stronger, more confident, more resilient. You understand now that you're capable of enduring hardship. That knowledge—that you can survive even the most terrifying challenges—is something no storm can take away from you.",
  },
  "The Disappearance": {
    0: "Your best friend Maya is absolutely heartbroken. Her most favorite possession in the entire world, a beloved doll named Rosie with a porcelain face and golden hair, has vanished without a trace. Maya cries and cries, and you hate seeing her so sad. 'Don't worry,' you promise her, putting your arm around her shoulders. 'I will find Rosie. I promise you. I won't stop searching until I bring her home.'",
    1: "You begin an investigation, searching Maya's room carefully and methodically. Under the bed, hidden in the dust, you find a clue—a small button that definitely doesn't match Rosie's dress. The button is blue with white stripes, and Rosie wears a pink dress. How did it get there? Who does it belong to? You pocket the button carefully. It's the first real clue in the mystery.",
    2: "The button leads you to investigate the neighbor's yard. Maybe someone accidentally borrowed Rosie somehow? As you search their garden, looking carefully at the ground and around their back porch, you try to imagine how Rosie might have ended up here. Did a child take her innocently, not realizing how much Maya loved her? Is she hidden somewhere nearby? You search behind bushes, near the fence, and around a small shed.",
    3: "You interview family members carefully, being respectful but persistent. Your parents, Maya's older brother, her aunt—everyone has stories to tell, but no one admits to moving the doll. Some people barely remember what Rosie looks like. Others haven't been to Maya's room in weeks. Everyone denies involvement. But the button is still a mystery. Someone wears something with a button like that. You just haven't found them yet.",
    4: "Days pass. Then, while playing in the garden, you spot a strange footprint in the soft mud near the garden shed. It's a small footprint—a child's footprint. You follow the trail carefully, seeing where it enters the bushes and disappears. Your heart beats faster. This might be the discovery you need. You follow the trail to a location behind the neighbor's house where you find what looks like a secret hideaway—a place where a child might play and keep treasures.",
    5: "Behind the garden shed, hidden from view by dense bushes and tall grasses, you discover a child's secret hideaway. It's filled with toys—some worn, some newer. Dolls, toy animals, blocks, and treasures. And there, in the center of the collection, sits Rosie in her pink dress! You reach for her carefully, examining her to make sure she's not damaged. She looks fine, cared for even. But why is she here? Then you notice something—a small blanket spread out, and what looks like tea set made of tin. Someone has been having tea parties with Rosie.",
    6: "It doesn't take you long to discover the truth. The neighbor's young child, a girl about four years old, had taken Rosie for playdates. She didn't steal her out of meanness. She took her because she was lonely—she had very few toys and even fewer friends. She loved Rosie as much as Maya did, maybe in her own way. She was caring for Rosie, playing with her, treating her gently. It was a misunderstanding born from loneliness, not malice.",
    7: "You reunite Maya with Rosie, and her joy at being reunited fills your heart. But then you do something even more important. You introduce Maya to the neighbor's child. At first, both children are shy. But then Maya shows the neighbor girl how to properly make Rosie a tea party. Soon, both girls are laughing and playing together. Rosie has gained a new friend, and more importantly, a lonely child has gained friendship. You realize that sometimes, the best solutions to mysteries aren't about who took what—they're about bringing people together and turning a conflict into a friendship.",
  },
  "Following Clues": {
    0: "A valuable painting has disappeared from the art gallery overnight! It was a masterpiece worth a fortune, locked inside a special case. Security was tight, but somehow, the thief got past all of it and vanished with the painting without a trace. The gallery director is desperate. 'Help us solve this mystery,' she pleads. 'We need someone with a sharp mind and keen observation skills.' You nod eagerly. A real mystery to solve! This is your chance to be a detective.",
    1: "You interview everyone, starting with the security guard. He's nervous and keeps fidgeting. 'I saw strange footprints near the storage room,' he mentions hesitantly. You examine the footprints closely, noting their size, the pattern of the sole, the depth of the impression. The footprints are recent. Whoever made them walked in wet shoes, leaving water droplets that have dried. The pattern suggests someone moving quickly and carefully—like someone who was trying not to be heard.",
    2: "In the gallery office, you search carefully and find a torn piece of cloth caught on a broken window. The window's lock has been forced. This must be how the thief entered! You examine the cloth closely. It's made of a specific type of fabric—a dark color with a distinctive pattern. You bag it carefully as evidence. The torn cloth means the thief was moving quickly or had something heavy to carry. Someone entered through this window.",
    3: "You take the cloth to different people in the gallery and carefully show it to them. You watch their reactions carefully—sometimes people's faces reveal more than their words. When you show the cloth to the janitor, his eyes widen with recognition. The cloth matches his uniform! Your heart jumps. Did the janitor steal the painting? But then he explains that his uniform is made from a common material that many work clothes are made from. It could be anyone's.",
    4: "Your detective work continues. You find the janitor's work schedule and examine it carefully. According to the records, the janitor wasn't even working on the night the painting was stolen! He had the night off and was at home. But someone made the footprints near the storage room. And someone forced the window. So if the janitor wasn't here, who was wearing similar clothing? Your mind races with new possibilities.",
    5: "You convince the gallery director to show you the security camera footage. You watch it carefully, looking at every frame. And then you see it—a figure in dark clothing, moving quickly, wearing gloves. The person moves with the confidence of someone who knows the gallery layout. The thief doesn't hesitate or look lost. They move directly to the painting, remove it quickly, and leave through the forced window. But the camera doesn't capture the thief's face. You need another clue.",
    6: "By piecing together all the clues—the footprint size, the window damage, the torn cloth, the camera footage, the knowledge of gallery layout—you slowly identify the real thief. It's the gallery's assistant director, someone who's been trusted for years. Everyone is shocked. She had keys. She knew the security codes. She knew exactly where the valuable painting was kept. She was essentially a trusted insider. The realization is difficult: sometimes, the people we trust the most can disappoint us.",
    7: "The case is finally solved, and justice is served. But more importantly, you've learned something crucial: careful observation and logical thinking can reveal the truth behind any mystery. You've learned that eyewitness testimony can be misleading, that solid evidence matters more than suspicion, and that a good detective must follow the clues wherever they lead, even if the answer isn't what you expect. You've proven that being smart, systematic, and patient can solve even the most confusing puzzles.",
  },
  "The Red Herring": {
    0: "A mystery surrounds a magnificent old mansion filled with treasures and art. A priceless jeweled crown has been stolen, and the whole town is talking about it. 'The wealthy family's son must have taken it,' everyone whispers. 'He's spoiled and irresponsible. He probably wanted money or wanted to spite his parents.' The evidence seems overwhelming, but something in your mind says wait—nothing is ever as obvious as it first appears.",
    1: "You interview the son first, and he seems incredibly guilty. He's nervous, fidgeting with his hands. He can't look you in the eye. When you ask direct questions about the crown, he becomes evasive, offering vague answers. He sweats even though the room isn't warm. He looks like someone with something to hide. This must be it, you think. The case seems simple. But intuition whispers a warning: be careful. Don't assume. Investigate more.",
    2: "Something nags at you—a small voice in your mind that says something isn't quite right. Yes, the son appears guilty. But good detectives look beyond the obvious. You decide to keep investigating before jumping to conclusions. You question him again about his behavior, and finally, with reluctant words, he admits something else entirely.",
    3: "The son confesses that he was being blackmailed by someone else to act suspiciously! The real reason for his nervousness wasn't guilt about the crown—it was fear about his blackmailer's threats. He wasn't protecting himself; he was protecting a secret. He was being manipulated into appearing guilty, the perfect red herring to distract everyone from the true criminal. His relief at finally telling someone is obvious.",
    4: "You dig deeper into the blackmail situation, and it leads you to discover something surprising. The real criminal is the family's trusted accountant, a woman who has worked for the family for decades. She needed money desperately due to gambling debts. No one suspected her because she was trusted and respected. She had keys to every safe and room in the mansion. She knew the crown's location and security. She took advantage of the son's secrets and blackmailed him into appearing guilty, knowing everyone would suspect him.",
    5: "Now the entire mystery becomes clear. The obvious suspect was a red herring—a false clue deliberately designed and used to distract from the real culprit. The son's guilty behavior was intentional misdirection. While everyone focused on blaming the son, the real thief was free to hide the crown and continue living her life as a trusted employee. Without careful investigation and the willingness to question obvious conclusions, the real criminal would never have been discovered.",
    6: "As you explain the solution to the family, they realize an important lesson. You tell them: 'The most suspicious person isn't always the guilty one. You must look beyond first impressions. Don't let emotions or expectations cloud your judgment. A good investigator follows evidence and logic, not gossip or assumptions.' The family listens carefully to your words, understanding that they nearly destroyed a young man's reputation based on false suspicion.",
    7: "You complete your investigation and solve the real crime, helping the family understand that trust can be misplaced in anyone, even those closest to us. The accountant, driven by desperation, made terrible choices. The son, blackmailed and frightened, made understandable but mistaken choices. And the family learned that assuming guilt based on appearance and behavior can be dangerously wrong. You've proven that the truth often hides beneath layers of deception, and finding it requires patience, intelligence, and careful thought.",
  },
  "The Old House": {
    0: "You inherit a mysterious old house from a relative you never met. The key arrives at your home with a letter containing just two words: 'Find yourself.' Inside your inherited house, everything is dusty and quiet. Sunlight streams through aging windows, revealing particles of dust floating like tiny worlds. The air smells of old wood, aged paper, and memory itself. You stand in the entrance hall, surrounded by furniture covered in white sheets like ghosts. This house is filled with secrets waiting to be uncovered, waiting for someone brave enough to explore.",
    1: "Dusty paintings line the halls, each frame holding a face or scene from the past. Some paintings show people you vaguely recognize from old family photos. Others show strangers, but faces with your chin or your eyes looking back at you across generations. Each one seems to whisper stories of the family's past. Where should you begin? The paintings become your guide. You run your fingers along frames, reading names and dates written on brass plaques. These are your ancestors—people whose blood runs in your veins, whose lives shaped the life you now live.",
    2: "In the kitchen, while reaching for a glass, you notice something odd. One brick in the fireplace looks newer than the others. You push on it, and with a soft click, the brick shifts. Behind it lies a hidden space containing an old diary bound in worn leather. The handwriting is elegant and old-fashioned, the ink faded with age. Your hands tremble as you carefully open the first page. A name is written there—a name you recognize from family stories. This diary has been waiting in darkness for decades.",
    3: "As you read the diary entries, a story emerges that changes your understanding of your family. An ancestor was a secret artist—someone with desperately burning passion for creating art. But they came from a strict family that considered art frivolous, wasteful, unworth the time of 'respectable' people. So they hid their true passion, hiding their art supplies, sketching secretly, painting in stolen moments. The diary entries are filled with longing and frustration, with the pain of hiding who you truly are.",
    4: "Following clues in the diary, you climb the narrow stairs to the attic. You reach for the ceiling board, and it pushes up easily, revealing a hidden room no one in the family even knew existed. Your breath catches. This room is like stepping back in time. Dozens of paintings lean against walls. Hundreds of sketches cover surfaces. Every inch of the small room is filled with art—beautiful, skillful, emotional art. Some paintings are unfinished. Some are dated from decades ago. All of them show an artist pouring their heart into their work in secret.",
    5: "Through the ancestor's art, you begin to understand their life—not from facts or dates, but from their emotional truth captured in pigment and pencil. The paintings tell stories of hardship, love, and dreams deferred. You see paintings of the restrictive family members, not with anger, but with understanding and sad acceptance. You see paintings of the beauty in ordinary moments—a sunrise, a flower, a child playing. The artist was acutely sensitive to life's beauty, and all that sensitivity was channeled into art that no one was ever meant to see.",
    6: "In a carved wooden box, you find letters written but never sent. Letters addressed to family members, expressing regrets, hopes, and dreams. Letters apologizing for not being stronger, not being brave enough to pursue art openly. Letters expressing love for people who never understood them. This house holds the heart of a whole family history—not the history told in public, but the true, private history of love and longing and hidden dreams. Each letter is a piece of a soul laid bare on paper.",
    7: "By unwinding this mystery, you've connected with your past in a profound way. You understand that every house holds secrets, and every family carries untold stories. Your ancestor's courage in creating art in secret, your family's struggle to understand and accept different dreams, the balance between family duty and personal passion—these are universal human struggles. As you stand in the hidden art studio surrounded by generations of secret creativity, you realize that your family's history isn't just something in the past. It flows through you. The artist in your ancestor calls to something in you. And now, finally, their secret art is no longer hidden. It's found. It's honored. It's home.",
  },
};

const chapterImages: { [key: string]: string[] } = {
  "The Lost Map": [
    "https://picsum.photos/800/600?random=1",
    "https://picsum.photos/800/600?random=2",
    "https://picsum.photos/800/600?random=3",
    "https://picsum.photos/800/600?random=4",
    "https://picsum.photos/800/600?random=5",
    "https://picsum.photos/800/600?random=6",
    "https://picsum.photos/800/600?random=7",
    "https://picsum.photos/800/600?random=8",
  ],
  "River Crossing": [
    "https://picsum.photos/800/600?random=9",
    "https://picsum.photos/800/600?random=10",
    "https://picsum.photos/800/600?random=11",
    "https://picsum.photos/800/600?random=12",
    "https://picsum.photos/800/600?random=13",
    "https://picsum.photos/800/600?random=14",
    "https://picsum.photos/800/600?random=15",
    "https://picsum.photos/800/600?random=16",
  ],
  "The Hidden Cave": [
    "https://picsum.photos/800/600?random=17",
    "https://picsum.photos/800/600?random=18",
    "https://picsum.photos/800/600?random=19",
    "https://picsum.photos/800/600?random=20",
    "https://picsum.photos/800/600?random=21",
    "https://picsum.photos/800/600?random=22",
    "https://picsum.photos/800/600?random=23",
    "https://picsum.photos/800/600?random=24",
  ],
  "The Mountain Climb": [
    "https://picsum.photos/800/600?random=25",
    "https://picsum.photos/800/600?random=26",
    "https://picsum.photos/800/600?random=27",
    "https://picsum.photos/800/600?random=28",
    "https://picsum.photos/800/600?random=29",
    "https://picsum.photos/800/600?random=30",
    "https://picsum.photos/800/600?random=31",
    "https://picsum.photos/800/600?random=32",
  ],
  "The Mirage": [
    "https://picsum.photos/800/600?random=33",
    "https://picsum.photos/800/600?random=34",
    "https://picsum.photos/800/600?random=35",
    "https://picsum.photos/800/600?random=36",
    "https://picsum.photos/800/600?random=37",
    "https://picsum.photos/800/600?random=38",
    "https://picsum.photos/800/600?random=39",
    "https://picsum.photos/800/600?random=40",
  ],
  "The Oasis": [
    "https://picsum.photos/800/600?random=41",
    "https://picsum.photos/800/600?random=42",
    "https://picsum.photos/800/600?random=43",
    "https://picsum.photos/800/600?random=44",
    "https://picsum.photos/800/600?random=45",
    "https://picsum.photos/800/600?random=46",
    "https://picsum.photos/800/600?random=47",
    "https://picsum.photos/800/600?random=48",
  ],
  "The Sandstorm": [
    "https://picsum.photos/800/600?random=49",
    "https://picsum.photos/800/600?random=50",
    "https://picsum.photos/800/600?random=51",
    "https://picsum.photos/800/600?random=52",
    "https://picsum.photos/800/600?random=53",
    "https://picsum.photos/800/600?random=54",
    "https://picsum.photos/800/600?random=55",
    "https://picsum.photos/800/600?random=56",
  ],
  "The Disappearance": [
    "https://picsum.photos/800/600?random=57",
    "https://picsum.photos/800/600?random=58",
    "https://picsum.photos/800/600?random=59",
    "https://picsum.photos/800/600?random=60",
    "https://picsum.photos/800/600?random=61",
    "https://picsum.photos/800/600?random=62",
    "https://picsum.photos/800/600?random=63",
    "https://picsum.photos/800/600?random=64",
  ],
  "Following Clues": [
    "https://picsum.photos/800/600?random=65",
    "https://picsum.photos/800/600?random=66",
    "https://picsum.photos/800/600?random=67",
    "https://picsum.photos/800/600?random=68",
    "https://picsum.photos/800/600?random=69",
    "https://picsum.photos/800/600?random=70",
    "https://picsum.photos/800/600?random=71",
    "https://picsum.photos/800/600?random=72",
  ],
  "The Red Herring": [
    "https://picsum.photos/800/600?random=73",
    "https://picsum.photos/800/600?random=74",
    "https://picsum.photos/800/600?random=75",
    "https://picsum.photos/800/600?random=76",
    "https://picsum.photos/800/600?random=77",
    "https://picsum.photos/800/600?random=78",
    "https://picsum.photos/800/600?random=79",
    "https://picsum.photos/800/600?random=80",
  ],
  "The Old House": [
    "https://picsum.photos/800/600?random=81",
    "https://picsum.photos/800/600?random=82",
    "https://picsum.photos/800/600?random=83",
    "https://picsum.photos/800/600?random=84",
    "https://picsum.photos/800/600?random=85",
    "https://picsum.photos/800/600?random=86",
    "https://picsum.photos/800/600?random=87",
    "https://picsum.photos/800/600?random=88",
  ],
};

// ============================================
// TRANSLATION DATA - ALL IN THREE LANGUAGES
// ============================================

const translations = {
  ageGroups: {
    "6-7years": {
      EN: "6-7 years",
      AR: "6-7 سنوات",
      FR: "6-7 ans",
    },
  },
  themes: {
    Adventure: {
      EN: "Adventure",
      AR: "المغامرة",
      FR: "Aventure",
      description: {
        EN: "Explore magical worlds, face challenges, and discover new lands",
        AR: "استكشف عوالم سحرية، واجه التحديات، واكتشف أراضي جديدة",
        FR: "Explorez des mondes magiques, relevez des défis et découvrez de nouvelles terres",
      },
    },
    Mystery: {
      EN: "Mystery",
      AR: "الغموض",
      FR: "Mystère",
      description: {
        EN: "Solve puzzles, uncover secrets, and solve the mystery",
        AR: "حل الألغاز واكتشف الأسرار وحل اللغز",
        FR: "Résolvez des énigmes, découvrez des secrets et résolvez le mystère",
      },
    },
  },
  roadmaps: {
    Adventure: {
      EN: "Adventure Roadmap",
      AR: "خارطة المغامرة",
      FR: "Parcours Aventure",
    },
    Mystery: {
      EN: "Mystery Roadmap",
      AR: "خارطة الغموض",
      FR: "Parcours Mystère",
    },
  },
  worlds: {
    "Forest Quest": {
      EN: "Forest Quest",
      AR: "مهمة الغابة",
      FR: "Quête de la Forêt",
      description: {
        EN: "Begin your adventure in an enchanted forest",
        AR: "ابدأ مغامرتك في غابة ساحرة",
        FR: "Commencez votre aventure dans une forêt enchantée",
      },
    },
    "Desert Journey": {
      EN: "Desert Journey",
      AR: "رحلة الصحراء",
      FR: "Voyage du Désert",
      description: {
        EN: "Continue your adventure in a vast desert",
        AR: "واصل مغامرتك في صحراء شاسعة",
        FR: "Continuez votre aventure dans un vaste désert",
      },
    },
    "The Missing Toy": {
      EN: "The Missing Toy",
      AR: "اللعبة المفقودة",
      FR: "Le Jouet Disparu",
      description: {
        EN: "Help solve the mystery of the missing toy",
        AR: "ساعد في حل لغز اللعبة المفقودة",
        FR: "Aidez à résoudre le mystère du jouet disparu",
      },
    },
    "Secret of the Old House": {
      EN: "Secret of the Old House",
      AR: "سر البيت القديم",
      FR: "Le Secret de la Vieille Maison",
      description: {
        EN: "Uncover the secrets hidden in the old house",
        AR: "اكتشف الأسرار المخفية في البيت القديم",
        FR: "Découvrez les secrets cachés dans la vieille maison",
      },
    },
  },
  stories: {
    "The Lost Map": {
      EN: "The Lost Map",
      AR: "الخريطة المفقودة",
      FR: "La Carte Perdue",
      description: {
        EN: "A mysterious map leads to ancient treasure",
        AR: "تقود خريطة غامضة إلى كنز قديم",
        FR: "Une carte mystérieuse mène à un trésor antique",
      },
    },
    "River Crossing": {
      EN: "River Crossing",
      AR: "عبور النهر",
      FR: "Traversée de la Rivière",
      description: {
        EN: "Navigate dangerous waters to reach a hidden village",
        AR: "تنقل عبر مياه خطيرة للوصول إلى قرية مخفية",
        FR: "Naviguer dans les eaux dangereuses pour atteindre un village caché",
      },
    },
    "The Hidden Cave": {
      EN: "The Hidden Cave",
      AR: "الكهف المخفي",
      FR: "La Grotte Cachée",
      description: {
        EN: "Discover ancient paintings in a legendary cave",
        AR: "اكتشف الرسومات القديمة في كهف أسطوري",
        FR: "Découvrez les peintures anciennes dans une grotte légendaire",
      },
    },
    "The Mountain Climb": {
      EN: "The Mountain Climb",
      AR: "تسلق الجبل",
      FR: "L'Ascension de la Montagne",
      description: {
        EN: "Reach the summit of the highest peak",
        AR: "اصل إلى قمة أعلى قمة",
        FR: "Atteindre le sommet du plus haut pic",
      },
    },
    "The Mirage": {
      EN: "The Mirage",
      AR: "السراب",
      FR: "Le Mirage",
      description: {
        EN: "Find truth in a world of illusions in the desert",
        AR: "ابحث عن الحقيقة في عالم من الأوهام في الصحراء",
        FR: "Trouver la vérité dans un monde d'illusions au désert",
      },
    },
    "The Oasis": {
      EN: "The Oasis",
      AR: "الواحة",
      FR: "L'Oasis",
      description: {
        EN: "Search for the legendary eternal oasis",
        AR: "ابحث عن الواحة الأسطورية الأبدية",
        FR: "Recherchez l'oasis éternelle légendaire",
      },
    },
    "The Sandstorm": {
      EN: "The Sandstorm",
      AR: "العاصفة الرملية",
      FR: "La Tempête de Sable",
      description: {
        EN: "Survive the ultimate test of the desert",
        AR: "تحمل الاختبار النهائي للصحراء",
        FR: "Survivez au test ultime du désert",
      },
    },
    "The Disappearance": {
      EN: "The Disappearance",
      AR: "الاختفاء",
      FR: "La Disparition",
      description: {
        EN: "Maya's favorite doll vanishes mysteriously",
        AR: "تختفي دمية مايا المفضلة بغموض",
        FR: "La poupée préférée de Maya disparaît mystérieusement",
      },
    },
    "Following Clues": {
      EN: "Following Clues",
      AR: "تتابع الأدلة",
      FR: "Suivre les Indices",
      description: {
        EN: "Help solve an art gallery mystery",
        AR: "ساعد في حل لغز معرض الفن",
        FR: "Aidez à résoudre le mystère de la galerie d'art",
      },
    },
    "The Red Herring": {
      EN: "The Red Herring",
      AR: "الرنجة الحمراء",
      FR: "Le Faux Indice",
      description: {
        EN: "Discover the truth behind false clues",
        AR: "اكتشف الحقيقة وراء الأدلة الزائفة",
        FR: "Découvrez la vérité derrière les faux indices",
      },
    },
    "The Old House": {
      EN: "The Old House",
      AR: "البيت القديم",
      FR: "La Vieille Maison",
      description: {
        EN: "Explore secrets hidden for generations",
        AR: "استكشف الأسرار المخفية لأجيال",
        FR: "Explorez des secrets cachés pendant des générations",
      },
    },
  },
  chapters: {
    "The Beginning": {
      EN: "The Beginning",
      AR: "البداية",
      FR: "Le Commencement",
    },
    "First Steps": {
      EN: "First Steps",
      AR: "الخطوات الأولى",
      FR: "Les Premiers Pas",
    },
    "The Discovery": {
      EN: "The Discovery",
      AR: "الاكتشاف",
      FR: "La Découverte",
    },
    "The Challenge": {
      EN: "The Challenge",
      AR: "التحدي",
      FR: "Le Défi",
    },
    "Rising Tension": {
      EN: "Rising Tension",
      AR: "تصاعد التوتر",
      FR: "Tension Croissante",
    },
    "The Twist": {
      EN: "The Twist",
      AR: "المفاجأة",
      FR: "Le Revirement",
    },
    "The Climax": {
      EN: "The Climax",
      AR: "الذروة",
      FR: "L'Apogée",
    },
    "The Resolution": {
      EN: "The Resolution",
      AR: "الحل",
      FR: "La Résolution",
    },
  },
  badges: {
    "Story Starter": {
      EN: "Story Starter",
      AR: "بادئ القصة",
      FR: "Débutant en Histoires",
      description: {
        EN: "You have taken your first step into the world of stories",
        AR: "لقد اتخذت خطوتك الأولى في عالم القصص",
        FR: "Vous avez pris votre premier pas dans le monde des histoires",
      },
    },
    "Story Explorer": {
      EN: "Story Explorer",
      AR: "مستكشف القصص",
      FR: "Explorateur d'Histoires",
      description: {
        EN: "You are beginning to explore the wonders of reading",
        AR: "أنت تبدأ في استكشاف عجائب القراءة",
        FR: "Vous commencez à explorer les merveilles de la lecture",
      },
    },
    "Story Enthusiast": {
      EN: "Story Enthusiast",
      AR: "عاشق القصص",
      FR: "Passionné d'Histoires",
      description: {
        EN: "You are showing real enthusiasm for stories",
        AR: "أنت تظهر حماسًا حقيقيًا للقصص",
        FR: "Vous montrez un vrai enthousiasme pour les histoires",
      },
    },
    "Reading Ranger": {
      EN: "Reading Ranger",
      AR: "رانجر القراءة",
      FR: "Garde de Lecture",
      description: {
        EN: "You are becoming skilled at navigating stories",
        AR: "أنت تصبح ماهرًا في التنقل بين القصص",
        FR: "Vous devenez compétent pour naviguer dans les histoires",
      },
    },
    "Adventure Lover": {
      EN: "Adventure Lover",
      AR: "محب المغامرات",
      FR: "Amoureux d'Aventures",
      description: {
        EN: "You love the thrill of adventure",
        AR: "تحب الإثارة والمغامرة",
        FR: "Vous aimez le frisson de l'aventure",
      },
    },
    "World Discoverer": {
      EN: "World Discoverer",
      AR: "مكتشف العوالم",
      FR: "Découvreur de Mondes",
      description: {
        EN: "You have discovered many new worlds",
        AR: "لقد اكتشفت العديد من العوالم الجديدة",
        FR: "Vous avez découvert de nombreux nouveaux mondes",
      },
    },
    "Challenge Master": {
      EN: "Challenge Master",
      AR: "سيد التحديات",
      FR: "Maître des Défis",
      description: {
        EN: "You are a master at solving challenges",
        AR: "أنت ماهر في حل التحديات",
        FR: "Vous êtes maître dans la résolution des défis",
      },
    },
    "Story Sage": {
      EN: "Story Sage",
      AR: "حكيم القصص",
      FR: "Sage des Histoires",
      description: {
        EN: "You have gained wisdom from stories",
        AR: "لقد اكتسبت الحكمة من القصص",
        FR: "Vous avez acquis de la sagesse grâce aux histoires",
      },
    },
    "Reading Champion": {
      EN: "Reading Champion",
      AR: "بطل القراءة",
      FR: "Champion de Lecture",
      description: {
        EN: "You are a champion reader",
        AR: "أنت قارئ بطل",
        FR: "Vous êtes un lecteur champion",
      },
    },
    "Master Reader": {
      EN: "Master Reader",
      AR: "قارئ ماهر",
      FR: "Maître Lecteur",
      description: {
        EN: "You have mastered the art of reading",
        AR: "لقد أتقنت فن القراءة",
        FR: "Vous avez maîtrisé l'art de la lecture",
      },
    },
  },
};

// ============================================
// CHAPTER TRANSLATIONS - AR & FR
// ============================================

const chapterTranslations: {
  [storyName: string]: {
    [chapterIndex: number]: { AR: string; FR: string };
  };
} = {
  "The Lost Map": {
    0: {
      AR: "تستيقظ على صوت الطيور تغني خارج كابينة مريحة ترقد عميقة في غابة ساحرة. تتدفق أشعة الشمس الدافئة من النوافذ المستديرة، ترسم كل شيء بظلال من الذهب والأخضر. رائحة الخبز الطازج تملأ الهواء. تجلس جدتك بهدوء بجانب موقد يطقطق، يداها المتجعدتان تمسكان بدفتر جلد قديم مربوط برباط ذهبي. تنظر إليك بعيون لامعة وابتسامة غامضة. 'لدي شيء خاص جداً لك اليوم،' تهمس. 'شيء لم يجده أحد في عائلتنا أبداً...'",
      FR: "Vous vous réveillez au son des oiseaux qui chantent à l'extérieur d'une cabine confortable nichée profondément dans une forêt enchantée. La lumière chaude du soleil se déverse par les fenêtres rondes, peignant tout en nuances d'or et de vert. L'odeur du pain frais remplit l'air. Votre grand-mère est assise tranquillement près d'une cheminée qui crépite, ses mains ridées tenant un ancien journal en cuir lié par un lacet doré. Elle vous regarde avec des yeux brillants et un sourire énigmatique. 'J'ai quelque chose de très spécial pour vous aujourd'hui,' murmure-t-elle. 'Quelque chose que personne dans notre famille n'a jamais trouvé...'",
    },
    1: {
      AR: "تخرج من الكابينة وتلهث! الغابة حية بالسحر. أشجار طويلة بأوراق زمردية تمتد نحو السماء، والهواء بارد وحلو، برائحة إبر الصنوبر والندى الصباحي. مسار متعرج من الحجارة البيضاء الناعمة يمتد أمامك، يختفي في بستان سميك حيث تخترق أشعة الشمس بأشعة ذهبية. تسمع صوت المياه الجارية البعيد - مثل موسيقى الطبيعة - تناديك للأمام. قلبك ينبض بالإثارة وأنت تخطو خطواتك الأولى في مغامرة العمر.",
      FR: "Vous sortez de la cabine et vous inspirez profondément! La forêt est vivante de magie. De grands arbres aux feuilles d'émeraude s'élèvent vers le ciel, et l'air est frais et sucré, sentant les aiguilles de pin et la rosée du matin. Un sentier sinueux de pierres blanches lisses s'étend devant vous, disparaissant dans un bosquet dense où les rayons du soleil se déversent en rayons dorés. Vous entendez le son lointain de l'eau qui coule - comme la musique de la nature - vous appelant d'aller de l'avant. Votre cœur bat d'excitation alors que vous faites votre premier pas dans l'aventure d'une vie.",
    },
    2: {
      AR: "بعد مشي لساعات تقريباً، تتبعاً صوت المياه المتدفقة، تكتشف شيئاً يأخذ أنفاسك! شلال رائع يتدفق من منحدرات مغطاة بالطحالب، يرش الماء في الهواء. يمسك الماء بأشعة الشمس ويتحول إلى آلاف قوس قزح الراقصة - واحد لكل لون يمكنك تخيله. خلف الشلال، يمكنك أن ترى الخطوط الباهتة لمدخل كهف. إنه سحري وغامض ويانتظرك.",
      FR: "Après avoir marché pendant ce qui semble des heures, en suivant le bruit de l'eau qui coule, vous découvrez quelque chose qui vous coupe le souffle! Une cascade magnifique dévale des falaises couvertes de mousse, vaporisant de l'eau dans l'air. L'eau capture la lumière du soleil et se transforme en milliers d'arcs-en-ciel dansants - un pour chaque couleur que vous pouvez imaginer. Derrière la cascade, vous pouvez voir les contours flous d'une entrée de grotte. C'est magique, mystérieux, et vous attend.",
    },
    3: {
      AR: "تجمع كل شجاعة في قلبك وتقترب من الدرجات الحجرية المنحوتة في وجه المنحدر. كل خطوة تصدر صدى تحت قدميك - تاب، تاب، تاب - مثل نبضات قلب الجبل نفسه. الدرجات تلتف صعوداً، والهواء يصبح أبرد. في منتصف الطريق، يتوقف تنفسك. واقفة تحجب طريقك ذئب فضي رائع! فروها يتلألأ مثل ضوء القمر، وعيناها حكيمتان وذكيتان، تدرسانك بعناية. تتجمد. الذئب لا يبدو غاضباً - يبدو... فضولياً.",
      FR: "Vous rassemblez tout le courage dans votre cœur et vous approchez des marches de pierre taillées dans la falaise. Chaque marche résonne sous vos pieds - tap, tap, tap - comme le battement de cœur de la montagne elle-même. Les marches s'enroulent vers le haut, et l'air devient plus froid. À mi-chemin, votre respiration s'arrête. Debout bloquant votre chemin est un magnifique loup argenté! Sa fourrure scintille comme la lumière de la lune, et ses yeux sont sages et intelligents, vous étudiant attentivement. Vous vous figez. Le loup ne semble pas en colère - il semble... curieux.",
    },
    4: {
      AR: "يرتجف يداك، لكنك تقف بسكون. الذئب يدور حولك ببطء، لا ينزع عينيه الفضيتين الثاقبتين عن عينيك. ثم يحدث شيء سحري - الذئب يفعل شيئاً لم تتوقعه أبداً. ينخفض رأسه العظيم وينحني! الحركة محترمة، تقريباً ترحيبية. الذئب يتحرك جانباً، مما يفسح الطريق صعوداً على الجبل. وأنت تمر، يضع أنفه الناعم برفق ضد يدك. تدرك أن الذئب لم يكن تهديداً أبداً - كان حارساً، يحمي هذا المكان المقدس حتى يصل شخص جدير به.",
      FR: "Vos mains tremblent, mais vous restez immobile. Le loup tourne lentement autour de vous, ne détournant jamais ses yeux argentés perçants des vôtres. Puis quelque chose de magique se produit - le loup fait quelque chose que vous n'aviez jamais attendu. Il baisse sa grande tête et s'incline! Le geste est respectueux, presque accueillant. Le loup se déplace sur le côté, dégageant votre chemin vers la montagne. En passant, il place son doux nez doucement contre votre main. Vous réalisez que le loup n'était jamais une menace - c'était un gardien, protégeant ce lieu sacré jusqu'à l'arrivée de quelqu'un qui en était digne.",
    },
    5: {
      AR: "تتسلق الحجارة المتبقية وتدخل حجرة حجرية قديمة محفورة عميقة في الجبل. تتسع عيناك من الدهشة! تبدو جدران الحجرة وكأنها تتوهج بنعومة من الداخل. محفورة في الرفوف الحجرية حول بك مئات - ربما آلاف - من البلورات التي تتلألأ بضوئها الداخلي الخاص. تمسك البلورات الزرقاء مثل الياقون، والزمرد الأرجواني، والزمرد الأخضر بالضوء وترقص عبر الجدران. الهواء يشعر بالوخز من السحر، وتدرك أنك دخلت مكاناً أكثر روعة من أي كنز.",
      FR: "Vous montez les pierres restantes et marchez dans une ancienne chambre de pierre taillée profondément dans la montagne. Vos yeux s'écarquillent d'émerveillement! Les murs semblent briller doucement de l'intérieur. Taillés dans les étagères de pierre autour de vous sont des centaines - peut-être des milliers - de cristaux qui scintillent de leur propre lumière intérieure. Les cristaux bleus comme les saphirs, les améthystes violettes et les émeraudes vertes capturent la lumière et dansent sur les murs. L'air fourmille de magie, et vous réalisez que vous êtes entré dans un endroit plus merveilleux que n'importe quel trésor.",
    },
    6: {
      AR: "بأيد ترتجف، تفتح بحذر الدفتر الذهبي الذي أعطتك جدتك. عندما تنفتح الصفحات، يحدث شيء معجزة! البلورات حول بك تبدأ في التوهج بشكل أكثر إشراقاً، تملأ الحجرة بضوء رائع. إنها كما لو أنها تحتفل باكتشافك! يحتوي الدفتر على سجل مكتوب لأعظم مغامرات عائلتك، يمتد عبر أجيال. كل صفحة تحكي قصة عن اللطف والشجاعة والحب. تفهم الآن أن هذه الرحلة لم تكن أبداً حول إيجاد كنز - كانت حول إيجاد قلب عائلتك.",
      FR: "Avec des mains tremblantes, vous ouvrez soigneusement le journal doré que votre grand-mère vous a donné. Alors que les pages se déplient, quelque chose de miraculeux se produit! Les cristaux autour de vous commencent à briller encore plus fort, remplissant la chambre de lumière brillante. C'est comme s'ils célébraient votre découverte! Le journal contient un enregistrement écrit des plus grandes aventures de votre famille, s'étendant sur des générations. Chaque page raconte une histoire de gentillesse, de courage et d'amour. Vous comprenez maintenant que ce voyage n'a jamais été sur la découverte d'un trésor - c'était sur la découverte du cœur de votre famille.",
    },
    7: {
      AR: "تلف الدفتر بحذر وتبدأ في النزول. في أسفل الجبل، صديقك الذئب الفضي ينتظرك. معاً، تسيران عبر الغابة بينما غروب الشمس يرسم السماء بظلال برتقالية وزهرية وأرجوانية. يسير الذئب بجانبك مثل رفيق مخلص، وتعرف أن هذه المغامرة غيرت حياتك للأبد. تعلمت أن أعظم الكنوز ليست من ذهب أو جواهر - إنها قصص الحب والشجاعة التي يتم تمريرها عبر العائلات، والأصدقاء الذين نصنعهم على طول الطريق.",
      FR: "Vous enveloppez soigneusement le journal et commencez votre descente. En bas de la montagne, votre ami loup argenté vous attend. Ensemble, vous marchez à travers la forêt tandis que le coucher de soleil peint le ciel en nuances d'orange, de rose et de violet. Le loup marche à vos côtés comme un compagnon fidèle, et vous savez que cette aventure vous a changé à jamais. Vous avez appris que les plus grands trésors ne sont pas l'or ou les bijoux - ce sont les histoires d'amour et de courage transmises par les familles, et les amis que nous nous faisons en chemin.",
    },
  },
  "River Crossing": {
    0: {
      AR: "تجدك شمس الصباح واقفًا على حافة نهر واسع وجارف. يجري الماء بقوة، ويتكسر إلى رغوة بيضاء. مرشدك، الكابتن موس، مستكشف ذو وجه متجعد وعيون طيبة، يهزّ رأسه ببطء. 'هذا النهر خطير جدًا اليوم،' يقول بجدية. 'أمطار الربيع جعلت التيار أقوى من أي وقت مضى. معظم الناس سيعودون.' ينظر إليك بعناية. 'لكن لدي شعور أنك قد تكون أكثرَ شجاعةً من الآخرين.'",
      FR: "Le soleil du matin vous trouve debout au bord d'une large rivière impétueuse. L'eau coule avec force, moussant et bouillonnant. Votre guide, le Capitaine Moss, un explorateur buriné aux yeux bienveillants, secoue la tête lentement. «Cette rivière est très dangereuse aujourd'hui,» dit-il sérieusement. «Les pluies du printemps ont rendu le courant plus fort que jamais. La plupart des gens feraient demi‑tour.» Il vous regarde attentivement. «Mais j'ai le sentiment que vous pourriez être plus courageux que la plupart.»",
    },
    1: {
      AR: "تمشي على طول ضفة نهرٍ صخرية لوقتٍ ممتد، تدرس التضاريس بعين فاحصة. صوت المياه يملأ أذنيك. ثم تراه فجأة — صف من الصخور الكبيرة الملساء يبرز من الماء كأنها أحجار عبور! الحجرات متباعدة بما يكفي للقفز بينها. 'انظر!' تصيح للكابتن موس. يفحصها ويضحك قليلاً. 'عبرت هذا النهر مئات المرات، ولم أرَ الصخور مصطفةً بهذه الكيفية أبدًا. كأن النهر نفسه يساعدك.'",
      FR: "Vous marchez le long de la rive rocheuse pendant presque une heure, étudiant le terrain avec attention. Le bruit de l'eau vous entoure. Et puis, soudain, vous le remarquez : une série de larges rochers lisses émergeant de l'eau, formant un chemin de pierres sur lesquelles on peut poser le pied. Ils sont espacés de façon à pouvoir sauter d'une pierre à l'autre. «Regardez !» criez‑vous au Capitaine Moss. Il les examine et rit. «J'ai traversé cette rivière cent fois, et je n'ai jamais vu ces pierres si bien disposées. C'est comme si la rivière elle‑même vous aidait.»",
    },
    2: {
      AR: "تعود عند الفجر في اليوم التالي، مستعدًا للعبور. يرتفع الضباب فوق الماء مثل أصابع أشباح. الصخور تبدو واضحة الآن في الضوء الخافت، لكنها زلقة وبلّالة بسبب رذاذ الماء الذي يتطاير عليها. الهواء بارد ورطب. يفحص الكابتن موس الحبل ويعطيك إيماءة تشجيع. 'تذكّر،' يقول، 'ابقَ هادئًا، تحرّك بحذر، وثق بتوازنك. النهر يختبر جسدك وعقلك وروحك.'",
      FR: "Vous revenez au lever du jour le lendemain, prêt pour la traversée. La brume s'élève de l'eau comme des doigts fantomatiques. Les rochers sont visibles dans la lumière croissante, mais ils semblent glissants et lisses, constamment baignés par des éclaboussures. L'air est froid et humide. Le Capitaine Moss vérifie votre corde et vous adresse un signe encourageant. «Souvenez‑vous,» dit‑il, «restez calme, avancez prudemment et faites confiance à votre équilibre. La rivière teste non seulement votre corps, mais aussi votre esprit et votre courage.»",
    },
    3: {
      AR: "تمسك الحبل المتين الذي ربطه الكابتن موس عبر الصخور، وتأخذ نفسًا عميقًا ثم تخطو على الحجر الأول. ينبض قلبك بقوة كطبلة. الحجر مبلّل ومدوّر تحت قدميك، والنهر يزمجر بجانبك. خطوة بخطوة تهمس لنفسك: اقفز. توازن. تنفس. اقفز مرة أخرى. الماء يتطاير ويبلل ساقيك، لكنك لا تتهاوى. كل حجر يقرّبك خطوة إلى الجانب الآخر، خطوة نحو إثبات شجاعتك.",
      FR: "Vous vous agrippez à la corde solide que le Capitaine Moss a tendue au‑dessus des pierres et, après une profonde inspiration, vous posez le pied sur la première pierre. Votre cœur bat comme un tambour. La pierre est humide et arrondie sous votre pied, et la rivière gronde à côté de vous. Pas après pas, vous vous répétez : sauter, équilibrer, respirer, sauter encore. L'eau gicle, mouillant vos jambes, mais vous ne faiblissez pas. Chaque pierre vous rapproche de l'autre rive, chaque pas prouve votre courage.",
    },
    4: {
      AR: "في منتصف الطريق، يقوى التيار فجأة. موجةٌ هائلة تضرب ساقيك، تكاد تجرفك عن حجرتك! تتمايل، وتدور ذراعاك للحفاظ على التوازن. الحبل هو الشيء الوحيد الذي يمنعك من السقوط في التيار. تحترق عضلاتك من الجهد. هذا هو الاختبار الحقيقي — ليس العبور، بل البقاء هادئًا عند اشتداد المخاطر. تغمض عينيك للحظة، تتنفس بعمق، وتجد مركزك الداخلي. يستقر جسدك وتثبّت قدماك. تستمر خطوة بخطوة.",
      FR: "À mi‑parcours, le courant se renforce soudainement. Une énorme vague frappe vos jambes, manquant de peu de vous emporter ! Vous vacillez, vos bras cherchent l'équilibre. La corde est la seule chose qui vous retient de vous laisser emporter. Vos muscles brûlent d'effort. Vous comprenez que l'épreuve réelle, ce n'est pas le passage physique, mais rester calme quand tout devient difficile. Vous fermez les yeux un instant, respirez profondément et retrouvez votre centre. Votre corps se stabilise et vos pieds s'accrochent à la pierre. Vous continuez, un pas prudent après l'autre.",
    },
    5: {
      AR: "قفزة أخيرة! تهبط قدمك على الحجر النهائي، ثم تقفز إلى العشب الطري على الضفة الأخرى فجأة! الكابتن موس بانتظارك، ذراعايه مفتوحتان. يصفعك على ظهرك بقوة حتى تكاد تسقط من الفرح وضحك. 'أحسنت!' يصرخ. 'رأيت الشجاعة في كل خطوة. النهر اختبرك، وأثبت أنك تمتلك قلب مستكشف حقيقي!'",
      FR: "Un dernier saut ! Votre pied atterrit sur la pierre finale, puis vous bondissez sur l'herbe douce de la rive opposée ! Le Capitaine Moss vous attend, les bras ouverts. Il vous tape dans le dos avec tant de force que vous manquez de tomber, riant de joie. «Vous l'avez fait !» s'écrie‑t‑il. «J'ai vu du courage à chaque pas. La rivière vous a testé, et vous avez prouvé que vous avez le cœur d'un vrai explorateur !»",
    },
    6: {
      AR: "أنت تستريح على ضفة النهر، لا تزال تلهث، ثم يحدث شيء سحري. ينشق الضباب وتظهر من خلال الأشجار قرية مخفية كما لو أنّها استُحضرت بسحر. منازل ملونة ذات أسقف مستديرة مطلية بالحمرة والصفراء والزرقاء ترحب بك. يخرج الناس من أبوابهم ويهللون بيد ملوّحة. تنبعث روائح الطعام والدفء من المدافئ. إنّه مكان كان مخفيًا عن العالم، محميًا بالنهر الذي عبرته للتو.",
      FR: "Alors que vous vous reposez sur la rive, encore essoufflé, quelque chose de magique se produit. La brume se dissipe et, à travers les arbres, apparaît un village caché comme par enchantement. Des maisons colorées aux toits arrondis, peintes de rouges, jaunes et bleus, vous saluent. De la fumée s'enroule des cheminées, apportant l'odeur de la cuisine et des foyers chaleureux. Des gens sortent et vous font signe. C'est un lieu qui a été caché du monde, protégé par la rivière que vous venez de traverser.",
    },
    7: {
      AR: "يأخذك كبير شيوخ القرية إلى مكتبته العتيقة المنحوتة من الحجر والخشب. داخلها، تومض الشموع ويُشم رائحة الجلود القديمة والرق. يعرضون عليك خرائط أقدم من ذاكرة أي إنسان — خرائط ترسم أراضٍ منسية وممرات مخفية ورحلات سرية. يضع أحد الشيوخ خريطةٍ مهتى جميلة في يديك. 'لقد استحققت حق امتلاك هذا،' يقول. 'إنها ترشد إلى طريق الحكمة الداخلية. احفظها جيدًا، ويومًا ما ستفهم لماذا كان عبور ذلك النهر مهمًا.'",
      FR: "L'ancien du village vous conduit à leur bibliothèque ancestrale, un bâtiment taillé dans la pierre et le bois. À l'intérieur, des bougies vacillent et l'air sent le vieux cuir et le parchemin. On vous montre des cartes plus anciennes que la mémoire de quiconque — des cartes qui tracent des terres oubliées, des passages secrets et des voyages cachés. L'aîné vous remet une carte usée et belle entre les mains. «Tu as mérité le droit de la posséder,» dit‑il. «Elle montre le chemin vers la sagesse intérieure. Garde‑la précieusement, et un jour, tu comprendras pourquoi traverser cette rivière était si important.»"
    },
  },
  "The Hidden Cave": {
    0: {
      AR: "عميقاً في غابة شاسعة مملوءة بأشجار شاهقة وظلال غامضة يكمن سر قلة من الناس اكتشفوه على الإطلاق. معلمتك، امرأة حكيمة بعيون تبدو وكأنها تحمل ألف قصة، تشير نحو تكوين صخري مغطى بالطحالب مختبئ خلف الكروم. الصخور قديمة وناعمة، شكلتها المياه والزمن. 'خلف هناك،' تهمس بصوت بالكاد فوق التنفس، 'تكمن كهف مملوءة بالعجائب القديمة. شيء ثمين تم إخفاؤه لآلاف السنين. فقط الفضوليون الحقيقيون واللطيفون يمكنهم العثور عليها،' تقول بابتسامة عارفة.",
      FR: "Au cœur d'une vaste forêt remplie d'arbres imposants et d'ombres mystérieuses se cache un secret que peu ont jamais découvert. Votre mentor, une femme sage aux yeux qui semblent contenir mille histoires, pointe vers une formation rocheuse couverte de mousse cachée derrière des vignes. Les rochers sont anciens et lisses, façonnés par l'eau et le temps. 'Derrière là,' murmure-t-elle, sa voix à peine au-dessus d'un souffle, 'gît une grotte remplie de merveilles anciennes. Quelque chose de précieux qui a été caché pendant des milliers d'années. Seuls les vraiment curieux et bienveillants peuvent le trouver,' dit-elle avec un sourire entendu.",
    },
    1: {
      AR: "تضغطين من خلال المدخل الضيق إلى حجرة تحتية شاسعة، وشعلتك تضيء مشهداً يأخذ أنفاسك! جدران الحجرة مغطاة برسومات رائعة - مئات منها! الفنانون القدماء أنشأوا هذه الصور بخلط الحجارة المسحوقة والألوان الطبيعية مع الماء. تبدو الرسومات وكأنها تتحرك في ضوء الشعلة الوميض. بصمات الأيدي والحيوانات والصيادون ومشاهد الحياة اليومية تنهال عليك من الحجر. تدركين أنك واقفة في معرض فني أنشأه الناس القدماء منذ آلاف السنين.",
      FR: "Vous vous faufilez à travers l'entrée étroite dans une vaste chambre souterraine, et votre torche illumine une scène qui vous coupe le souffle. Les murs sont couverts de magnifiques peintures - des centaines! Les artistes anciens ont créé ces images en mélangeant des pierres broyées et des couleurs naturelles avec de l'eau. Les peintures semblent bouger à la lumière vacillante de la torche. Les empreintes de mains, les animaux, les chasseurs et les scènes de la vie quotidienne surgissent du rocher. Vous réalisez que vous vous tenez dans une galerie d'art créée par les peuples anciens il y a des milliers d'années.",
    },
    2: {
      AR: "بينما تضيء شعلتك كل رسمة، تبدئي في فهم ما تشهدينه. الرسومات تحكي قصص الشعوب القديمة التي عاشت في اتصال مع الطبيعة. الصيادون يتتبعون الحيوانات العظيمة عبر الهضاب الحجرية. الراقصات يحتفلن تحت القمر والنجوم. الأطفال يلعبون في الغابات. العائلات تجتمع حول النيران. حيوانات من جميع الأنواع - الجاموس والغزلان والخيول والطيور - مرسومة بتفاصيل وحب بحيث تبدو حية تقريباً. هذه ليست رسومات عشوائية؛ إنها سجل لقلب وروح حضارة متجمدة في الزمن.",
      FR: "Alors que votre torche illumine chaque peinture, vous commencez à comprendre ce que vous voyez. Les peintures racontent des histoires de peuples anciens qui vivaient en connexion avec la nature. Les chasseurs traquent les grands animaux à travers les plaines rocheuses. Les danseurs célèbrent sous la lune et les étoiles. Les enfants jouent dans les forêts. Les familles se réunissent autour des feux. Des animaux de toutes sortes - bisons, cerfs, chevaux et oiseaux - sont peints avec tant de détails et d'amour qu'ils semblent presque vivants. Ce ne sont pas des dessins aléatoires; c'est un enregistrement du cœur et de l'âme d'une civilisation gelés dans le temps.",
    },
    3: {
      AR: "تركعين أمام رسمة بشكل خاص لجاموس عظيم. الفنان قد التقط كل تفصيل - العضلات القوية والموقف الفخور، حتى الذكاء في عين الحيوان. العمل ماهر جداً وجميل جداً بحيث تملأ الدموع عينيك. كم من الوقت استغرق هذا؟ تتساءلي. هل كان هناك فنانون هنا منذ آلاف السنين، تماماً مثل الرسامين الذين تعرفينهم اليوم؟ هل وقف شخص ما هنا وقال، 'أريد أن أنشئ شيئاً جميلاً يدوم للأبد'؟ يبدو أن الإجابة تتلألأ في الحجر القديم.",
      FR: "Vous vous agenouilles devant une peinture particulièrement magnifique d'un grand bison. L'artiste a capturé chaque détail - les muscles puissants, la posture fière, même l'intelligence dans l'œil de l'animal. L'ouvrage est si compétent, si beau, que des larmes remplissent vos yeux. Combien de temps cela a-t-il pris? vous vous demandez. Y avait-il des artistes ici il y a des milliers d'années, comme les peintres que vous connaissez aujourd'hui? Est-ce que quelqu'un s'est tenu ici et a dit: 'Je veux créer quelque chose de beau qui durera à jamais'? La réponse semble scintiller dans la pierre ancienne.",
    },
    4: {
      AR: "أعمق في الكهف، تكتشفين معرض كامل مكرس لبصمات الأيدي. أيدي بجميع الأحجام - أيادي الأطفال الصغيرة وأيادي البالغين القوية - تم الضغط عليها ضد الحجر وتحديدها بالصبغات الطبيعية. كل بصمة يد فريدة، كل واحدة علامة شخصية. تضعين يدك الخاصة ضد بعض البصمات القديمة، راحة في راحة، عبر آلاف السنين. إنها كما لو أنك تهزين أيادي الماضي، متصلة بأشخاص عاشوا عندما كان أسلاف أسلاف جد أجدادك للتو يولدون.",
      FR: "Plus profond dans la grotte, vous découvrez une galerie entière consacrée aux empreintes de mains. Des mains de toutes les tailles - petites mains d'enfants, mains fortes d'adultes - ont été appuyées contre la pierre et ont été tracées avec des pigments naturels. Chaque empreinte de main est unique, chacune une marque personnelle. Vous placez votre propre main contre certaines des anciennes empreintes, paume contre paume, à travers des milliers d'années. C'est comme si vous serriez la main au passé, vous connectant à des gens qui vivaient quand les ancêtres de vos ancêtres venaient de naître.",
    },
    5: {
      AR: "أثناء تجولك أعمق، تفتح الكهف بشكل دراماتيكي إلى بحيرة تحتية شاسعة. الماء شفاف تماماً وصافٍ جداً بحيث ينعكس كل تفصيل من أضواء الشعلة. إنه مثل ضوء القمر السائل، ينشئ صورة معكوسة للحجرة أعلاه. الصمت عميق، ينقطع فقط بقطرات ناعمة من الماء تصدى عبر التجويف. إنه أكثر مكان سلمياً وجميل شهدتيه على الإطلاق. تدركين أنك بعد السفر عبر الظلام، وجدتي نوراً في أكثر مكان غير متوقع.",
      FR: "Alors que vous vous aventurez plus profondément, la grotte s'ouvre dramatiquement sur un vaste lac souterrain. L'eau est cristalline, si pure qu'elle reflète chaque détail de la lumière de la torche. C'est comme du clair de lune liquide, créant une image miroir de la chambre ci-dessus. Le silence est profond, rompu seulement par le léger goutte-à-goutte de l'eau résonnant à travers la caverne. C'est l'endroit le plus paisible et le plus beau que vous ayez jamais vu. Vous réalisez qu'en voyageant dans l'obscurité, vous avez trouvé la lumière au endroit le plus inattendu.",
    },
    6: {
      AR: "معلمتك تنضم إليك وتضع يداً حنونة على كتفك. 'هذه الكهوف أماكن مقدسة،' تقول باحترام عميق. 'الشعوب القديمة التي أنشأت هذه الرسومات فهمت شيئاً نحن أحياناً ننساه - أن الفن هو لغة الروح. لقد أنشأوا هذه الرسومات ليس من أجل الشهرة أو المال، بل لتركوا قطعة من أنفسهم للأجيال المستقبلية. أنت مشرفة على مشاهدة هذا. تحمل هذه المعرفة مسؤولية. يجب حماية هذه الكهوف وتقديسها.'",
      FR: "Votre mentor vous rejoint et place une main bienveillante sur votre épaule. 'Ces grottes sont des lieux sacrés,' dit-elle avec un profond respect. 'Les peuples anciens qui ont créé ces peintures ont compris quelque chose que nous oublions parfois - que l'art est le langage de l'âme. Ils ont créé ces peintures non pas pour la célébrité ou l'argent, mais pour laisser un morceau d'eux-mêmes aux générations futures. Vous avez l'honneur de témoigner cela. Cette connaissance porte la responsabilité. Ces grottes doivent être protégées et vénérées.'",
    },
    7: {
      AR: "أثناء عودتك عبر الظلام نحو مدخل الكهف، مع ضوء الشعلة يرقص على جدران قديمة، تشعرين بالتحول. تفهمين الآن لماذا سافر الناس بعيداً جداً وعملوا بجد جداً لإنشاء هذه الروائع في الظلام - هذه الرسومات لم تكن أبداً من المفروض أن يراها الكثيرون. تم إنشاؤها من القلب، للقلب - محادثة بين الفنان والأبدية. تحملين هذا الفهم معك وأنت تخطين عائداً إلى أشعة الشمس، مغيرة إلى الأبد بلقاءك مع الأولين القدماء.",
      FR: "Alors que vous faites votre chemin dans l'obscurité vers l'entrée de la grotte, avec la lumière de la torche dansant sur les anciens murs, vous vous sentez transformée. Vous comprenez maintenant pourquoi les gens ont voyagé si loin et ont travaillé dur pour créer ces chefs-d'œuvre dans l'obscurité - ces peintures n'étaient jamais censées être vues par beaucoup. Ils ont été créés du cœur, pour le cœur - une conversation entre l'artiste et l'éternel. Vous portez cette compréhension avec vous en marchant vers le soleil, transformée à jamais par votre rencontre avec les anciens.",
    },
  },
  "The Mountain Climb": {
    0: {
      AR: "أنت واقف عند قاعدة أطول جبل في كل الأراضي. تخترق قمته الغيوم مثل إبرة، تختفي في الضباب الأبيض بعيداً فوقك. الجبل جميل ومرعب في نفس الوقت. يغطي الثلج منحدراته العليا، ويمكنك رؤية مسارات الانهيار حيث لا ينمو شيء. هذا الجبل يتحدى أي شخص يتجرأ على محاولة قمته. معظم الناس ينظرون إليه ويرون عائقاً مستحيلاً. لكنك ترى فرصة لأعظم مغامرة في حياتك.",
      FR: "Vous vous tenez au pied de la plus haute montagne de tout le pays. Son pic percent les nuages comme une aiguille, disparaissant dans la brume blanche bien au-dessus de vous. La montagne est belle et terrifiante à la fois. La neige couvre ses pentes supérieures, et vous pouvez voir des chemins d'avalanches où rien ne pousse. Cette montagne défie quiconque tente d'atteindre son sommet. La plupart des gens la regardent et voient un obstacle impossible. Mais vous voyez une opportunité pour la plus grande aventure de votre vie.",
    },
    1: {
      AR: "المسار الأول يتعرج بلطف صعوداً عبر غابة خصبة. أشجار قديمة ذات جذوع سميكة وأغطية أوراق زمردية تمتد صعوداً بحيث تبدو وكأنها تلمس السماء. تخترق أشعة شمس ذهبية الأوراق. الهواء منعش وحي برائحة الطيور والمياه الجارية. إنه جميل جداً بحيث تشعري أنك تسيرين عبر عالم سحري. تبدو الأشجار نفسها وكأنها تتسلقين صعوداً معك، جذورها تحفر أعمق، فروعها تمتد أعلى، كما لو أنها أيضاً تحدين نفسهن للوصول إلى القمة.",
      FR: "Le premier sentier sinue doucement vers le haut à travers une forêt luxuriante. Des arbres anciens aux troncs épais et aux canopées d'émeraude s'élèvent si haut qu'ils semblent toucher le ciel. Les rayons de soleil dorés percent les feuilles. L'air est frais et vivant avec le bruit des oiseaux et de l'eau qui coule. C'est tellement beau que vous vous sentez comme si vous marchiez à travers un monde magique. Les arbres eux-mêmes semblent grimper avec vous, leurs racines creusant plus profondément, leurs branches s'étendant plus haut, comme s'ils se mettaient eux aussi au défi d'atteindre le sommet.",
    },
    2: {
      AR: "أعلى وأعلى تتسلقي، والغابة تصبح أرق. الهواء يصبح أبرد وأرق أيضاً. عليك أن تتنفسي بعمق أكثر لملء رئتيك. تبدأ ساقاك بالشعور بالثقل. تصبح الأشجار أصغر وأصغر حتى لا توجد أشجار على الإطلاق، فقط صخور ونبات جريء وحشائش نادرة. تلفين عباءتك بقوة أكبر حول نفسك بينما تقوى الريح وتعضين على خديك. ينمو العالم أدناه أصغر، لكن عزمك ينمو أكبر. أنت تدخلين العالم حيث يختبرك الجبل حقاً.",
      FR: "Plus haut et plus haut vous montez, et la forêt devient plus mince. L'air devient aussi plus froid et plus mince. Vous devez respirer plus profondément pour remplir vos poumons. Vos jambes commencent à se sentir lourdes. Les arbres deviennent de plus en plus petits jusqu'à ce qu'il n'y ait plus du tout d'arbres, juste des rochers, des arbustes robustes et de l'herbe clairsemée. Vous enroulez votre cape plus étroitement autour de vous alors que le vent se lève et mord vos joues. Le monde en dessous devient plus petit, mais votre détermination grandit. Vous entrez dans le royaume où la montagne vous teste vraiment.",
    },
    3: {
      AR: "تصلين أخيراً إلى هضبة عريضة وتتوقفي لتستريحي. عندما تلتفتي وتنظري للخلف أسفل الجبل، ينتفخ قلبك بالإنجاز. تبدو الغابة البعيدة أدناه مثل بطانية خضراء. تظهر الأنهار كخيوط فضية. تبدو القرى مثل ألعاب صغيرة. لم تكوني تعرفي أنك تسلقت هذا الارتفاع! ساقاك تؤلمك وتحترق رئتاك، لكن المنظر يملأك بشعور بالنصر. لقد حققت بالفعل أكثر مما ظننت ممكناً. وأنت لم تصلي حتى القمة بعد.",
      FR: "Vous atteignez enfin un large plateau et vous arrêtez pour vous reposer. Vous vous tournez et regardez en arrière en bas de la montagne, votre cœur se gonfle d'accomplissement. La forêt lointaine en dessous ressemble à une couverture verte. Les rivières apparaissent comme des fils d'argent. Les villages ressemblent à de petits jouets. Vous n'aviez aucune idée que vous aviez grimpé aussi haut! Vos jambes font mal et vos poumons brûlent, mais la vue vous remplit d'un sentiment de triomphe. Vous avez déjà réalisé plus que vous ne le pensiez possible. Et vous n'avez même pas encore atteint le sommet.",
    },
    4: {
      AR: "تنبثق مقطع الجبل النهائي أمامك. إنه أكثر جزء حاد من التسلق بأكمله. المسار ضيق وصخري أكثر، مع حجارة رخوة تتحرك تحت حذائك. تحترق ساقاك من الإرهاق والجهد. تبدو كل خطوة وكأنها تتطلب كل قوتك. لكن ثم تنظري للأعلى، والقمة قريبة جداً فتشعري أنك تستطيعي الوصول إليها! تحلق روحك حتى وإن كانت جسدك متعباً. يمكنك أن تفعلي هذا. فقط قليل أكثر. القمة في متناول اليد. لن تستسلمي الآن.",
      FR: "Le dernier tronçon de montagne se dresse devant vous. C'est la partie la plus raide de l'escalade entière. Le sentier est étroit et plus rocheux, avec des pierres libres qui se déplacent sous vos bottes. Vos jambes brûlent d'épuisement et d'effort. Chaque pas semble nécessiter toute votre force. Mais puis vous regardez vers le haut, et le sommet est si proche que vous sentez que vous pourriez le toucher! Votre esprit s'envole même si votre corps est fatigué. Vous pouvez le faire. Un peu plus seulement. Le sommet est à portée de main. Vous ne renoncerez pas maintenant.",
    },
    5: {
      AR: "بدون تحذير، تظلم السماء. سحب سوداء تغلي من العدم مثل شيء حي. يرعد الرعد برعب يبدو مثل الأرض تنقسم. يومض البرق بألق حول بك، متبوعاً برعد عظيم يصدى عن جانب الجبل. تنفجر المطر من السماء مثل محيط يصب أسفل. تصبح الريح شرسة وتحاول أن تدفعك للخلف، تحاول أن تلقيك من المسار الضيق. هل تعودي الآن؟ معسكرك الدافئ الآمن بعيد فقط عن ساعات قليلة. أم هل تضغطي لأمام عبر هذه العاصفة المرعبة؟",
      FR: "Sans avertissement, le ciel s'assombrit. Des nuages noirs bouillonnent de nulle part comme quelque chose de vivant. Le tonnerre gronde avec un son comme la terre se brisant. L'éclair clignote brillamment autour de vous, suivi d'un tonnerre si fort qu'il résonne du flanc de la montagne. La pluie éclate du ciel comme un océan qui se déverse. Le vent devient féroce et essaie de vous repousser, essayant de vous jeter du sentier étroit. Vous revenez en arrière maintenant? Votre camp chaud et sûr est à seulement quelques heures de descente. Ou continuez-vous à avancer dans cette tempête terrifiante?",
    },
    6: {
      AR: "تنحني وتضغطي للأمام، الرأس منخفض ضد الريح والمطر. أنت ترفضي العودة للخلف. خطوة واحدة في كل مرة. هذا كل ما يمكنك فعله. المسار زلق، والرؤية كاد تكون صفر، لكن يمكنك أن تشعري بتغيير المنحدر. أنت تتسلقي حتى أكثر حدة الآن. تعوي الريح مثل شيء حي، محاولة أن تخبرك أن تتوقفي، أن تستسلمي، أن تعودي. لكن شيء بداخلك - شيء عميق وقوي وصمم - يستمر في الحركة للأمام. القمة في متناول اليد. يمكنك أن تشعري به تقريباً.",
      FR: "Vous serrez les dents et avancez, la tête baissée contre le vent et la pluie. Vous refusez de faire marche arrière. Un pas à la fois. C'est tout ce que vous pouvez faire. Le sentier est glissant, et la visibilité est presque nulle, mais vous pouvez sentir la pente changer. Vous montez encore plus raide maintenant. Le vent hurle comme quelque chose de vivant, essayant de vous dire d'arrêter, de renoncer, de revenir. Mais quelque chose en vous - quelque chose de profond et de fort et de déterminé - continue d'avancer. Le sommet est à portée de main. Vous pouvez presque le sentir.",
    },
    7: {
      AR: "فجأة، يتوقف المطر. تنقسم الغيوم. وثم تريه - لقد وصلتِ للقمة! تزرعي علمك في الذروة، ويرفرف بشجاعة في الريح. حققتِ ذلك! لقد فتحتِ الجبل! المنظر من الأعلى يأخذ أنفاسك. يمكنك أن ترري الجبال تمتد إلى كل أفق، والوديان بعيدة أدناه، والغيوم ت漂漂 مثل السفن في بحر قطني أبيض. من هناك، بدا الجبل مستحيلاً. لكن الآن بعد أن كنتِ هنا، تعرفي أن المستحيل يصبح ممكناً من خلال التصميم والشجاعة والرفض أن تستسلمي.",
      FR: "Soudainement, la pluie s'arrête. Les nuages se divisent. Et puis vous le voyez - vous avez atteint le sommet! Vous plantez votre drapeau au sommet, et il flotte bravement dans le vent. Vous l'avez fait! Vous avez conquis la montagne! La vue du sommet vous coupe le souffle. Vous pouvez voir les montagnes s'étendre à chaque horizon, les vallées loin en dessous, les nuages dérivant comme des navires dans une mer cotonneux blanc. De là-bas, la montagne semblait impossible. Mais maintenant que vous êtes ici, vous savez que l'impossible devient possible par la détermination, le courage, et le refus d'abandonner.",
    },
  },
  "The Mirage": {
    0: {
      AR: "شمس الصحراء تنهال بدون رحمة، تحول الرمل إلى محيط ساخن متلألأ. كنت تسير لأيام وأيام في هذا المشهد الطويل، متتبعاً ما تعتقد أنها خريطة قديمة تقود إلى الكنز. شفاهك جافة، جلدك محترق، وإمدادات المياه لديك تنخفض كل يوم. لكنك تستمري لأن الخريطة تشعر بأنها صحيحة، وقلبك يخبرك أن شيئاً ثميناً ينتظر قدماً. أحياناً، تعتقدي، الإيمان والعزم هما كل ما يجعلنا نستمر في المسير للأمام.",
      FR: "Le soleil du désert brûle impitoyablement, transformant le sable en un océan de chaleur scintillant. Vous marchez depuis des jours et des jours dans ce paysage sans fin, suivant ce que vous croyez être une ancienne carte menant au trésor. Vos lèvres sont sèches, votre peau est brûlée, et votre réserve d'eau baisse chaque jour. Mais vous continuez, car la carte semble juste, et votre cœur vous dit que quelque chose de précieux vous attend. Parfois, pensez-vous, c'est seulement la foi et la détermination qui nous font avancer.",
    },
    1: {
      AR: "ثم يحدث شيء مستحيل. هناك، على الأفق، ترين مدينة جميلة! حدائق خضراء مملوءة بأشجار التمر والفواكه. تيارات من الماء تتدفق عبر الشوارع. الناس والحيوانات يتحركون حول. المباني تتلألأ بألوان وحياة. إنها تبدو حقيقية جداً، مثيرة جداً. تتحدقين بها، معتقدتين أنها خدعة للضوء، لكن لا - إنها بالتأكيد هناك. يحلق قلبك. بعد أيام من المشي عبر لاشيء أكثر من الرمل والحرارة، وجدتِ الحضارة! تبدئي بالمشي بسرعة أكبر، يكاد تكونين تركضان، مائسة لتصلي إلى الملجأ والطعام والماء.",
      FR: "Puis quelque chose d'impossible se produit. Sur l'horizon, vous voyez une belle ville! Des jardins verts remplis de palmiers dattiers et d'arbres fruitiers. Des ruisseaux d'eau coulent dans les rues. Les gens et les animaux se déplacent. Les bâtiments scintillent de couleur et de vie. Cela semble si réel, si invitant. Vous le regardez fixement, pensant que c'est une illusion du lumière, mais non - c'est définitivement là. Votre cœur s'élève. Après des jours de marche à travers rien que du sable et de la chaleur, vous avez trouvé la civilisation! Vous commencez à marcher plus vite, presque à courir, désespéré de atteindre l'abri, la nourriture et l'eau.",
    },
    2: {
      AR: "تقتربين من المدينة ببطء، لكن شيء لا يشعر به بشكل صحيح. كلما اقتربتِ، قل الشعور بالصلابة. الحواف غير واضحة، مثل لوحة مصنوعة من الألوان المائية التي تبدأ في السيل. يبدو أن الناس والحيوانات التي رأيتِ تنجرف أبعد وأبعد، حتى وإن كنتِ تسيرين نحوهم. تبقى درجة الحرارة من حولك محرقة، وتلاحظي أن ظلك لا يسقط بالطريقة الصحيحة تماماً. إنه خطأ برقة. يبدأ عقلك في فهم ما لا تريد قلبك قبوله.",
      FR: "Vous vous rappanchez de la ville lentement, mais quelque chose ne semble pas right. Plus vous vous rapprochez, moins c'est solide. Les bords sont flous, comme une peinture à l'aquarelle qui commence à couler. Les gens et les animaux que vous avez vus semblent s'éloigner, même si vous marchez vers eux. La température autour de vous reste brûlante, et vous remarquez que votre ombre ne tombe pas tout à fait correctement. C'est subtilement faux. Votre esprit commence à comprendre ce que votre cœur ne veut pas accepter.",
    },
    3: {
      AR: "تمددين يدك لتلمسي جدار مبنى، ويدك تمرين من خلاله! لا يوجد شيء هناك سوى الهواء. إنه سراب - خدعة من الضوء والحرارة والأمل اليائس. لكن كيف يمكن لسراب أن يكون تفصيلياً جداً؟ كيف يمكنه أن يشمل الناس والحيوانات والمباني بأكملها؟ تشعرين بالارتباك والخيبة. تتلألأ الوهم وتختفي. ما الغرض من هذه الرؤية؟ لماذا أظهر لك الكون شيئاً ليس حقيقياً؟",
      FR: "Vous tendez votre main pour toucher un mur de bâtiment, et votre main passe à travers! Il n'y a rien là que l'air. C'est un mirage - une illusion de lumière et de chaleur et d'espoir désespéré. Mais comment un mirage peut-il être si détaillé? Comment peut-il inclure les gens et les animaux et les bâtiments entiers? Vous vous sentez confus et déçu. L'illusion scintille et s'estompe. Quel était le but de cette vision? Pourquoi l'univers vous a-t-il montré quelque chose qui n'est pas réel?",
    },
    4: {
      AR: "ثم تسمعي صوتاً خلفك. 'كثيرون يسعون لما يرون، لكن الحكمة تكمن في ما يفهمونه، وليس فيما يلاحظونه.' تستديرين حول لترري ساكنة صحراء عجوز، بالية من الشمس والوقت، واقفة في ظل تكوين صخري. عيناها تحملان حكمة شخص عاش سنوات كثيرة في هذه الأرض القاسية. هي تشيرين لك بالجلوس في الظل وتعطيك ماء - ماء حقيقي. تشربين بامتنان، بالكاد تصدقين الارتياح الذي يجلبه.",
      FR: "Puis vous entendez une voix derrière vous. 'Beaucoup cherchent ce qu'ils voient, mais la sagesse réside dans ce qu'ils comprennent, pas ce qu'ils observent.' Vous vous tournez pour voir une vieille habitante du désert, usée par le soleil et le temps, debout à l'ombre d'une formation rocheuse. Ses yeux contiennent la sagesse de quelqu'un qui avait vécu de nombreuses années dans cette terre difficile. Elle vous fait signe de vous asseoir à l'ombre et vous donne de l'eau - de l'eau réelle. Vous buvez avec gratitude, pouvant à peine croire au soulagement qu'elle vous apporte.",
    },
    5: {
      AR: "المرأة العجوز تشير نحو الأفق الشرقي، ما وراء حيث كان السراب. 'المدينة الحقيقية لا تكمن في الرمل، بل في قلوب أولئك الذين يبحثون بقصد،' تقول. 'كان السراب الذي رأيتِ اختباراً. أظهر الحقيقة في شكل كاذب. الآن يمكنني أن أريكِ الشيء الحقيقي لأنك تعلمتِ الفرق.' هي تقودك على طول مسار مخفي لن تكوني قد وجدتِ نفسك، تحركين بعناية عبر الكثبان مع معرفة شخص يفهم حقاً هذه الأرض.",
      FR: "La vieille femme pointe vers l'horizon oriental, au-delà de là où le mirage était. 'La vraie ville ne se trouve pas dans le sable, mais dans les cœurs de ceux qui cherchent avec but,' dit-elle. 'Le mirage que vous avez vu était un test. Il a montré la vérité dans une forme fausse. Maintenant, je peux vous montrer la vraie chose car vous avez appris la différence.' Elle vous guide sur un sentier caché que vous n'auriez jamais trouvé vous-même, se déplaçant soigneusement à travers les dunes avec la connaissance de quelqu'un qui comprend vraiment cette terre.",
    },
    6: {
      AR: "بعد إرشاداتها، تكتشفي مستوطنات واحة حقيقية مخفية في الصحراء. هذه ليست مدن من الوهم - إنها مجتمعات حقيقية حيث عاش الناس لأجيال، يرعون أشجار التمر وتنظيم المياه الثمينة التي تستديمهم. يستقبلونك بدفء متفاجيء، يشاركون التمر والقصص. تتعلمي تقنياتهم في الري وفهمهم لإيقاعات الصحراء. هؤلاء الناس حقيقيون، وحكمتهم حقيقية. العمل الذي يقومون به حقيقي.",
      FR: "En suivant ses conseils, vous découvrez de vrais établissements d'oasis cachés dans le désert. Ce ne sont pas des villes d'illusion - ce sont de vraies communautés où les gens ont vécu pendant des générations, s'occupant des palmiers dattiers et gérant l'eau précieuse qui les soutient. Ils vous accueillent chaleureusement, partageant des dattes et des histoires. Vous apprenez leurs techniques d'irrigation et leur compréhension des rythmes du désert. Ces gens sont réels, et leur sagesse est réelle. Le travail qu'ils font est réel.",
    },
    7: {
      AR: "أثناء جلوسك مع سكان الصحراء، تقاسمي الطعام والمحادثة، تفهمين أخيراً. أعظم كنز لم تكن مدينة واحدة أو كنز من الذهب. أعظم كنز كان الرحلة نفسها - الدروس المتعلمة والناس التقيتِ والفهم المكتسب أن الثروة الحقيقية لا تأتي من ما يتلألأ في المسافة، بل من ما يتم بناؤه بعناية ونية في اللحظة الحالية. تدركين أنك وجدتِ شيئاً أكثر قيمة من أي سراب - وجدتِ الحقيقة.",
      FR: "Lorsque vous êtes assis avec les habitants du désert, partageant la nourriture et la conversation, vous comprenez enfin. Le plus grand trésor n'était pas une seule ville ou un trésor d'or. Le plus grand trésor fut le voyage lui-même - les leçons apprises, les gens rencontrés, et la compréhension qu'obtenue que la vraie richesse ne vient pas de ce qui scintille au loin, mais de ce qui est construit avec soin et intention dans le moment présent. Vous réalisez que vous avez trouvé quelque chose de plus précieux qu'un mirage - vous avez trouvé la vérité.",
    },
  },
  "The Oasis": {
    0: {
      AR: "تحكي الأساطير عبر الصحراء عن واحة لا تجف أبدًا، حتى في أشد سنوات الجفاف. البعض يقول إنها أسطورة، والبعض الآخر يهمس بأنها ملعونة، بينما يعتقد آخرون أنها تحمل سحرًا. لقد سمعت هذه القصص طوال حياتك، والآن قررت أخيرًا البحث عنها بنفسك. يظن مرشدوك أنك مجنون، وتعتقد عائلتك أنك متهور، لكنك حزمت أمتعتك. إن وُجِدت الواحة، ستجدها؛ وإن لم توجد، فلن تندم على المحاولة.",
      FR: "Les légendes du désert parlent d'une oasis qui ne tarit jamais, même pendant les pires sécheresses. Certains la croient mythique, d'autres la considèrent maudite, et d'autres encore prétendent qu'elle renferme de la magie. Vous avez entendu ces récits toute votre vie, et maintenant, enfin, vous avez décidé de la chercher. Vos guides vous prennent pour un fou, votre famille vous juge imprudent, mais vous faites vos préparatifs. Si l'oasis existe, vous la trouverez ; sinon, au moins vous aurez essayé.",
    },
    1: {
      AR: "بعد أسابيع من المشي عبر كثبان لا تنتهي، تؤتي مثابرتك ثمارها أخيرًا. تصعد على تل رملي عالٍ وتتوقف، بالكاد تجرؤ على التنفس. تحتك تمتد وادٍ مخفي محاط بجدران من صخور حمراء تبدو وكأنها تتوهج تحت أشعة الشمس. في مركز الوادي، الماء يلمع كأنه ألماس سائل، والنباتات الخضراء تحيط به في دائرة كاملة. الواحة! إنها موجودة — أجمل مما وُصفت الأساطير. تتعثر نزولًا نحو الوادي وأنت تكاد لا تصدق عينيك.",
      FR: "Après des semaines de recherche à travers des dunes sans fin, votre persévérance porte enfin ses fruits. Vous atteignez le sommet d'une haute dune et vous arrêtez, à peine capable de respirer. En contrebas s'étend une vallée cachée entourée de falaises de pierre rouge qui semblent scintiller sous le soleil. Au centre, l'eau miroite comme des diamants liquides, et une végétation verdoyante l'entoure en cercle parfait. L'oasis ! Elle existe, et elle est plus belle que ne le décrivaient les légendes. Vous redescendez vers la vallée, presque incrédule.",
    },
    2: {
      AR: "عندما تدخل الواحة، تستقبلك عجائب. نخيلٌ طويل يُشكّل مظلة من الظل، والهواء بارد مليء بصوت المياه المتدفقة—جداول ونوافير تغذيها ينابيع لا تجف على ما يبدو. تزهر الأزهار بألوان لا تُصدّق—بنفسجية، صفراء، حمراء وبرتقالية. المكان يبدو كجنة في منتصف الصحراء. الماء صافي لدرجة أن قاعه يلمع، وتضع يداك في كأس الماء وتشرب—أحلى ماء تذوقته في حياتك.",
      FR: "À votre entrée dans l'oasis, vous êtes entouré d'émerveillements. De grands palmiers forment une canopée rafraîchissante—un vrai bénédiction après des jours au soleil. L'air est frais et ponctué du murmure d'eau qui coule: ruisseaux et fontaines alimentés par des sources régulières. Des fleurs aux teintes improbables—violettes, jaunes, rouges, oranges—épanouissent partout. L'eau est si claire que vous en voyez le fond ; vous la cuppez dans vos mains et buvez : c'est l'eau la plus pure et la plus douce que vous ayez jamais goûtée.",
    },
    3: {
      AR: "كلما تعمقت، تكتشف أن الواحة مأهولة. مستوطنة صغيرة من حوالي خمسين عائلة بنَت منازلها وحدائقها حول الينابيع الثمينة. يستقبلك الناس بدفء وفضول مفاجئين، ويشاركونك قصص أجدادهم الذين اكتشفوا هذا المكان قبل قرون وبقوا ليحافظوا عليه. تستمع إلى حكايات عن كيفية انتقال المعرفة عبر الأجيال وعن الاعتماد المتبادل بين الناس والطبيعة.",
      FR: "En poursuivant votre exploration, vous découvrez que l'oasis est habitée. Un village d'une cinquantaine de familles a établi des maisons et des jardins autour des sources précieuses. Les habitants vous accueillent avec une chaleur surprenante et une curiosité bienveillante. Ils vous racontent comment leurs ancêtres ont découvert ce lieu il y a des siècles et ont choisi de rester, protégeant l'oasis et fondant une société basée sur le partage et la conservation.",
    },
    4: {
      AR: "قائد المجتمع—امرأة عجوز ذات عيون حنونة—تأخذك في جولة وتشرح أسرار الواحة. تعلمك عن الأنهار الجوفية التي تغذي هذه الينابيع—أنهار كبيرة تسري تحت الرمال ولم تجف في السجل التاريخي. 'الطبيعة لها سباكتها المخفية،' تمزح، وهي تريك كيف يرتفع الماء عبر ينابيع طبيعية ويتم توجيهه إلى الحدائق. تُظهرك كيف يظل النظام متوازنًا بحيث تكفي المياه للشرب والري واللعب.",
      FR: "La cheffe de la communauté, une femme âgée aux yeux bienveillants, vous guide et vous montre les mystères de l'oasis. Elle vous enseigne les rivières souterraines qui alimentent les sources : de vastes cours d'eau sous le sable qui n'ont jamais tari dans l'histoire connue. «La nature a sa plomberie cachée», plaisante‑t‑elle, vous montrant comment l'eau jaillit par des sources naturelles et est canalisée dans les jardins. Vous comprenez que l'abondance apparente est le fruit d'un équilibre précieusement entretenu depuis des siècles.",
    },
    5: {
      AR: "يتعلم المجتمع ويعلمك تقنيات قديمة لحفظ المياه سمحت لهذه الواحة بالازدهار لألف عام أو أكثر. تعلم كيفية توجيه الماء بدون هدر، وكيفية إنشاء مصاطب للزراعة تستغل كل قطرة، وكيفية حماية الينابيع حتى تستمر في الجريان. من أصغر طفل إلى أقدم شيخ، يفهم الجميع مسؤوليتهم في الحفاظ على هذه النعمة. الماء هنا ليس مجرد مورد—إنه مقدس ومحترم.",
      FR: "La communauté vous transmet des techniques ancestrales de conservation de l'eau qui permettent à l'oasis de prospérer depuis des siècles. Vous apprenez à canaliser l'eau sans gaspillage, à aménager des terrasses de culture qui optimisent chaque goutte, et à préserver les sources pour qu'elles continuent de couler. Du plus petit enfant au doyen du village, chacun comprend sa responsabilité dans le maintien de ce précieux équilibre. L'eau n'est pas seulement utilisée : elle est respectée et honorée.",
    },
    6: {
      AR: "قبل المغادرة، يقدم لك أهل الواحة بذورًا نباتات صحراوية نادرة—نباتات تزهر وتثمر في ظروف قاسية. 'حتى تتمكن من إحياء الصحراء حيثما تذهب،' يقولون. تقبل البذور ودموع الشكر تلمع في عينيك؛ لقد أُعطيّت شيئًا أثمن من الذهب: أداة لنشر الحياة وفهم جديد للبيئة.",
      FR: "Avant votre départ, la communauté vous offre cérémoniellement des graines de plantes désertiques rares—plantes qui fleurissent et portent fruit dans des conditions arides. «Pour que tu puisses apporter la vie au désert où que tu ailles», disent‑ils. Vous acceptez ces graines les yeux embués de larmes de gratitude : on vous a remis quelque chose de bien plus précieux que l'or, un moyen de répandre la vie et la connaissance.",
    },
    7: {
      AR: "تغادر الوادي محملاً بمعرفة جديدة وأمل متجدد. الواحة لم تكن مجرد مكان من الماء والنباتات؛ كانت درسًا في الإصرار والمجتمع والتناغم مع الطبيعة. ترحل ومعك بذور لتزرعها وأفكار لتشاركها، وتعلم أن هذا الفهم سيصحبك إلى كل مكان تذهب إليه.",
      FR: "En quittant la vallée, vous partez transformé, porteur d'un savoir nouveau et d'un espoir renouvelé. L'oasis n'était pas seulement un lieu d'eau et de verdure : elle fut une leçon de persévérance, de communauté et d'harmonie avec la nature. Vous repartez avec des graines à semer et des leçons à partager, sachant que cette sagesse vous accompagnera où que vous alliez.",
    },
  },
  "The Sandstorm": {
    0: {
      AR: "السماء تظلم بشكل مريب، وتهب الرياح الأولى بينما تندهش من حجم الجدار الرملي الذي يظهر على الأفق. تبدو وكأنها موجة حية، تبتلع كل ما يعترض طريقها. الخوف يسري بين المخيمين، فهذه عاصفة رملية هائلة لا تشبه أي شيء رأيته من قبل.",
      FR: "Le ciel s'assombrit de façon inquiétante alors que les premiers vents se lèvent. À l'horizon, une muraille de sable se profile, semblant vivre et se mouvoir, avalant tout sur son passage. La peur se répand parmi les campeurs : c'est une tempête de sable massive, différente de tout ce que vous avez connu.",
    },
    1: {
      AR: "تتدافع لإعداد معسكرك قبل أن تضرب العاصفة تمامًا. تثبت الخيام، تجمع المستلزمات، وتربط كل شيء يمكن أن يطير. يبدأ الرمل في ملء الهواء لدرجة أن الرؤية تتقلص إلى بضعة أقدام فقط. تشعر كأن العالم قد تقلص إلى دائرة صغيرة من الأمان حولك.",
      FR: "Vous vous précipitez pour préparer votre camp avant que la tempête n'arrive. Vous stabilisez les tentes, rassemblez vos affaires et attacherez tout ce qui pourrait s'envoler. Le sable commence à remplir l'air, réduisant la visibilité à quelques mètres à peine. On a l'impression que le monde se réduit à un cercle minuscule de sécurité autour de vous.",
    },
    2: {
      AR: "الريح تعوي بعنف، وهي تصدر صوتًا كصرخة بعيدة. الرمل يضرب وجهك كإبر ويملأ كل شق صغير. عليك أن تجد مأوى أو تواجه خطر الضياع نهائيًا في هذا البحر المتحرك من الرمل. العقل يحاول أن يظل هادئًا بينما الغريزة تصرخ بالهرب.",
      FR: "Le vent hurle avec une violence terrifiante, comme une grande bête poussant un cri. Le sable frappe votre visage comme des aiguilles et s'insinue dans chaque fissure. Vous devez trouver un abri ou risquer d'être perdu à jamais dans cet océan mouvant de sable. L'esprit tente de rester calme tandis que l'instinct crie de fuir.",
    },
    3: {
      AR: "تكتشف تكوينًا صخريًا كبيرًا يمكنك الاختباء خلفه. تدفع نفسك إلى زاوية محمية، وكل حبة رمل تحاول أن تخترق ثوبك. قلبك يدق بعنف، لكن الصخور توفر ملاذًا جزئيًا من العاصفة. تمسك نفسك بقوة ضد الصخور ولا تدع الريح تسحرك بعيدًا.",
      FR: "Vous trouvez une formation rocheuse pour vous abriter derrière. Vous vous faufilez dans une anfractuosité protégée tandis que chaque grain de sable tente de s'infiltrer dans vos vêtements. Votre cœur bat la chamade, mais la roche offre un abri partiel contre la tempête. Vous vous accrochez fermement afin que le vent ne vous emporte pas.",
    },
    4: {
      AR: "تمر الساعات ببطء أو تتداخل الأيام؛ الوقت يفقد معناه داخل عواء العاصفة. يتحول البصر إلى وميض، ويصبح التنفس شاقًا بسبب رمال صغيرة تملأ الحلق. تتساءل إن كانت هذه المحنة ستنتهي أبداً، لكنك تتذكر أن العواصف دائمًا ما تزول في النهاية، وأن البقاء على الهدوء هو طريق النجاة.",
      FR: "Les heures s'étirent, ou peut‑être semblent‑elles se confondre ; le temps perd sa mesure sous le hurlement de la tempête. La vue devient floue et votre respiration se fait difficile, asséchée par le sable fin qui remplit la gorge. Vous vous demandez si cette épreuve prendra fin, mais vous vous souvenez que les tempêtes finissent toujours par s'apaiser, et que rester calme est la clé pour survivre.",
    },
    5: {
      AR: "الإمدادات تنفد ببطء؛ الماء الذي تحتفظ به قليل ويجب إدارته بحذر. الخوف قد يغريك بالذعر، لكنك تعلم أن الذعر يهدِر طاقتك ويستهلك الموارد. تجلس بهدوء وتخطط لتوزيع ما تبقى من الماء والغذاء وتقيّم موقفك حتى تمر العاصفة.",
      FR: "Vos provisions s'amenuisent ; l'eau que vous avez doit être rationnée avec soin. La panique pourrait vous gagner, mais vous savez que céder à la peur gaspille de l'énergie et consomme vos ressources. Vous vous asseyez, respirez lentement et planifiez comment répartir ce qui reste d'eau et de nourriture en attendant la fin de la tempête.",
    },
    6: {
      AR: "ببطء، وكأن عزم الريح يضعف، تبدأ الضبابية بالانحسار. تسمع صوت الريح يتلاشى شيئًا فشيئًا. الرمل يهدأ وينخفض. تشعر بارتياح متأخر ينساب إلى قلبك: العاصفة في طريقها إلى النهاية، وأنت ما تزال حيًا.",
      FR: "Progressivement, comme si la colère du vent s'affaiblissait, la visibilité s'améliore. Le bruit du vent diminue lentement. Le sable se dépose, et un sentiment de soulagement vous envahit lentement : la tempête est en train de passer, et vous êtes toujours en vie.",
    },
    7: {
      AR: "عندما تخترق الشمس الغبار المتبقي، تخرج من مخبئك وتنظر إلى أرضٍ تحولت. كثبان رملية جديدة تشق الطريق؛ العلامات التي عرفتها مدفونة. لكنك تعلم الآن أنك نجوت، وأن هذه التجربة جعلتك أقوى وأكثر مرونة. هذه القوة الداخلية لا يمكن أن تأخذها منك أي عاصفة.",
      FR: "Alors que le soleil perce la poussière résiduelle, vous sortez de votre abri et contemplez un paysage transformé : des dunes nouvelles ont été sculptées, des repères familiers sont ensevelis. Mais vous savez désormais que vous avez survécu, et que cette épreuve vous a rendu plus fort et plus résilient. Cette force intérieure, aucune tempête ne pourra vous l'enlever.",
    },
  },
  "The Disappearance": {
    0: {
      AR: "مايا كسيرة القلب. دميتها المفضلة، روزي، اختفت دون تتبع. تعد بمساعدة في العثور عليها.",
      FR: "Maya a le cœur brisé. Sa poupée préférée, Rosie, a disparu sans laisser de trace. Vous promettez d'aider à la trouver.",
    },
    1: {
      AR: "تبحث عن غرفة مايا بعناية. تحت السرير، تجد دليل - زر لا يطابق فستان روزي.",
      FR: "Vous fouille la chambre de Maya soigneusement. Sous le lit, vous trouvez un indice - un bouton qui ne correspond pas à la robe de Rosie.",
    },
    2: {
      AR: "يقودك الزر للتحقيق في ساحة الجار. ربما أخذ شخص ما روزي عن غير قصد؟",
      FR: "Le bouton vous amène à enquêter sur la cour du voisin. Peut-être que quelqu'un a accidentellement pris Rosie?",
    },
    3: {
      AR: "تقابل أفراد الأسرة. لكل شخص قصته الخاصة، لكن لا أحد يعترف بتحريك الدمية.",
      FR: "Vous interviewez les membres de la famille. Chacun a une histoire, mais personne n'admet d'avoir déplacé la poupée.",
    },
    4: {
      AR: "بصمة قدم غريبة في الحديقة تعطيك دليل جديد. تتبعها لاكتشاف شيء غير متوقع.",
      FR: "Une empreinte de pas bizarre dans le jardin vous donne un nouvel indice. Vous la suivez pour découvrir quelque chose d'inattendu.",
    },
    5: {
      AR: "خلف حظيرة الحديقة، تجد مخبأ الطفل مليء بالألعاب. هل روزي هنا؟ تبحث في هذا المكان السري بعناية.",
      FR: "Derrière la remise du jardin, vous trouvez une cachette d'enfant remplie de jouets. Est-ce que Rosie est ici? Vous fouille soigneusement cet endroit secret.",
    },
    6: {
      AR: "تكتشف الحقيقة - قد أخذت الطفل الصغير للجار روزي على مواعيد لعب، بدون قصد سوء. كانوا يشعرون بالوحدة للتو.",
      FR: "Vous découvrez la vérité - le jeune enfant du voisin avait pris Rosie pour des rendez-vous de jeu, sans mauvaise intention. Ils se sentaient juste seuls.",
    },
    7: {
      AR: "تعيد توحيد مايا مع روزي. الأهم من ذلك، ساعدت الأطفال على أن يصبحوا أصدقاء، وروزي تحصل على مغامرات جديدة مع كليهما.",
      FR: "Vous réunissez Maya avec Rosie. Plus important encore, vous aidez les enfants à devenir amis, et Rosie a de nouvelles aventures avec tous les deux.",
    },
  },
  "Following Clues": {
    0: {
      AR: "لوحة قيمة اختفت من المعرض الفني! طُلب منك المساعدة في حل اللغز.",
      FR: "Un tableau précieux a disparu de la galerie d'art ! On vous demande d'aider à résoudre le mystère.",
    },
    1: {
      AR: "يذكر حارس الأمن رؤية بصمات قدم غريبة بالقرب من غرفة التخزين. تدرسها عن كثب بحثًا عن أدلة.",
      FR: "Le garde de sécurité mentionne avoir vu d'étranges empreintes de pas près du stockage. Vous les examinez de près pour trouver des indices.",
    },
    2: {
      AR: "في مكتب المعرض، تجد قطعة قماش ممزقة عالقة بنافذة مكسورة. قد يكون هذا مهمًا.",
      FR: "Dans le bureau de la galerie, vous trouvez un morceau de tissu déchiré accroché à une fenêtre cassée. Cela pourrait être important.",
    },
    3: {
      AR: "تعرض القماش على أشخاص مختلفين واكتشف أنه يطابق زي عامل النظافة. هل هو متورط؟",
      FR: "Vous montrez le tissu à différentes personnes et découvrez qu'il correspond à l'uniforme du concierge. Pourrait-il être impliqué?",
    },
    4: {
      AR: "لكن انتظر - تجد شيئًا أكثر أهمية. جدول عمل عامل النظافة يظهر أنه لم يكن هنا في تلك الليلة على الإطلاق!",
      FR: "Mais attendez - vous trouvez quelque chose d'encore plus important. L'horaire de travail du concierge montre qu'il n'était même pas là cette nuit-là!",
    },
    5: {
      AR: "تراجع فيديو كاميرات الأمان بعناية. السارق الحقيقي كان يرتدي قفازات وتحرك بسرعة.",
      FR: "Vous passez en revue plus attentivement les vidéos de surveillance. Le vrai voleur portait des gants et se déplaçait rapidement.",
    },
    6: {
      AR: "بجمع كل الأدلة، تكتشف أن السارق كان في الواقع شخصًا وثقت به المعرض تماما.",
      FR: "En rassemblant tous les indices, vous découvrez que le voleur était en réalité quelqu'un de confiance à la galerie.",
    },
    7: {
      AR: "تم حل القضية! تتعلم أن الملاحظة الزقة والتفكير المنطقي يمكنهما الكشف عن الحقيقة وراء أي لغز.",
      FR: "L'affaire est résolue! Vous apprenez qu'une observation minutieuse et une pensée logique peuvent révéler la vérité derrière n'importe quel mystère.",
    },
  },
  "The Red Herring": {
    0: {
      AR: "تحيط بها غموض حول قصر قديم. يقول الجميع أن ابن العائلة الغني يجب أن يكون قد سرق التاج الجوهرة.",
      FR: "Un mystère entoure un vieux manoir. Tout le monde dit que le fils de la famille riche doit avoir volé la couronne serties de bijoux.",
    },
    1: {
      AR: "تقابل الابن أولاً. يبدو مذنبًا - عصبيًا، غير مباشر، غير قادر على النظر في العين. يجب أن يكون هذا!",
      FR: "Vous interviewez d'abord le fils. Il semble coupable - nerveux, évasif, incapable de te regarder dans les yeux. C'est dû être lui!",
    },
    2: {
      AR: "لكن شيئًا ما يقلقك. تقرر الاستمرار في التحقيق قبل القفز للاستنتاجات.",
      FR: "Mais quelque chose vous taraude. Vous décidez de continuer à enquêter avant de tirer des conclusions.",
    },
    3: {
      AR: "تكتشف أن الابن كان يتم ابتزازه للتصرف بشكل مريب من قبل شخص آخر تماما. كان يحمي سرًا!",
      FR: "Vous découvrez que le fils était chantage pour agir de manière suspecte par quelqu'un d'autre entièrement. Il protégeait un secret!",
    },
    4: {
      AR: "تحفر أعمق واكتشف أن المجرم الحقيقي كان محاسب الأسرة الموثوق به الذي احتاج إلى المال بشدة.",
      FR: "Vous creusez plus profondément et découvrez que le vrai criminel était l'expert-comptable de confiance de la famille qui avait désespérément besoin d'argent.",
    },
    5: {
      AR: "كان المريب الواضح رنجة حمراء - دليل كاذب مصمم لتحويل الانتباه عن المذنب الحقيقي.",
      FR: "Le suspect évident était un faux indice - un faux indice conçu pour détourner l'attention du vrai coupable.",
    },
    6: {
      AR: "تتعلم أن الشخص الأكثر اشتباهًا ليس دائمًا المذنب. يجب أن تنظر خلف المظاهر الأولى.",
      FR: "Vous apprenez que la personne la plus suspecte n'est pas toujours la coupable. Vous devez regarder au-delà des premières impressions.",
    },
    7: {
      AR: "تحل الجريمة الحقيقية وتساعد الأسرة على فهم أن الثقة يمكن أن تكون مكان في أي شخص، حتى في أقرب الأشخاص إليهم.",
      FR: "Vous résolvez le vrai crime et aidez la famille à comprendre que la confiance peut être misplaced chez n'importe qui, même ceux les plus proches.",
    },
  },
  "The Old House": {
    0: {
      AR: "ترث منزل غامض من قريب لم تلتق به أبدا. بالداخل، مليء بالأسرار في انتظار الكشف.",
      FR: "Vous hérités une maison mystérieuse d'un parent que vous n'avez jamais rencontré. À l'intérieur, elle est remplie de secrets en attente d'être découverts.",
    },
    1: {
      AR: "تصطف اللوحات الغبارية الرقبة. يبدو أن كل واحد يهمس قصصًا عن ماضي الأسرة. من أين تبدأ؟",
      FR: "Les peintures poussiéreuses tapissent les couloirs. Chacun semble murmurer des histoires du passé de la famille. Par où commencez-vous?",
    },
    2: {
      AR: "تجد دفتر يوميات قديم مخبأ خلف لبنة مفككة في المدفأة. الكتابة اليدوية أنيقة والإدخالات رائعة.",
      FR: "Vous trouvez un vieux journal caché derrière une brique lâche dans la cheminée. L'écriture est élégante et les entrées sont captivantes.",
    },
    3: {
      AR: "يكشف الدفتر أن الجد كان فنانا سريا، يخفي شغفهم الحقيقي عن عائلة صارمة.",
      FR: "Le journal révèle qu'un ancêtre était un artiste secret, cachant sa vraie passion à une famille stricte.",
    },
    4: {
      AR: "تكتشف استوديو فن مخفي في العليّة، المحفوظ بالضبط كما كان منذ عقود. الجدران تغطيها الرسوم والرسومات.",
      FR: "Vous découvrez un studio d'art caché dans le grenier, préservé exactement tel qu'il était il y a des décennies. Les murs sont couverts de peintures et d'esquisses.",
    },
    5: {
      AR: "من خلال فن الأجداد، تعلم عن الصعوبة والحب والأحلام المؤجلة. رسومهم تحكي قصة حياة لم تستطع الكلمات أبدا.",
      FR: "À travers l'art de l'ancêtre, vous apprenez la hardship, l'amour et les rêves différés. Leurs peintures racontent une histoire de vie que les mots ne pourraient jamais faire.",
    },
    6: {
      AR: "تجد رسائل مكتوبة لكن لم تكن أبدا مرسلة، معبرة عن الأسف والآمال. هذا المنزل يحمل قلب تاريخ عائلة كاملة.",
      FR: "Vous trouvez des lettres écrites mais jamais envoyées, exprimant des regrets et des espoirs. Cette maison tient le cœur d'une histoire familiale entière.",
    },
    7: {
      AR: "تفهم أن كل منزل يحمل أسرار، وكل عائلة تحمل قصص غير مروية. بفك هذا اللغز، تكونت مع ماضيك.",
      FR: "Vous comprenez que chaque maison tient des secrets, et chaque famille porte des histoires non contées. En démêlant ce mystère, vous vous êtes connecté à votre passé.",
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

async function createChapter(
  storyId: string,
  titleEN: string,
  titleAR: string,
  titleFR: string,
  contentEN: string,
  contentAR: string,
  contentFR: string,
  order: number,
  imageUrl?: string,
) {
  return prisma.chapter.create({
    data: {
      storyId,
      content: contentEN,
      order,
      imageUrl,
      translations: {
        create: [
          {
            languageCode: LanguageCode.EN,
            content: contentEN,
          },
          {
            languageCode: LanguageCode.AR,
            content: contentAR,
          },
          {
            languageCode: LanguageCode.FR,
            content: contentFR,
          },
        ],
      },
    },
  });
}

async function createChallenge(
  chapterId: string,
  type: ChallengeType,
  questionEN: string,
  questionAR: string,
  questionFR: string,
  hintsEN: string[],
  hintsAR: string[],
  hintsFR: string[],
  answers: Array<{
    textEN: string;
    textAR: string;
    textFR: string;
    isCorrect: boolean;
  }>,
  order: number,
  baseStars: number = 20,
) {
  return prisma.challenge.create({
    data: {
      chapterId,
      type,
      question: questionEN,
      baseStars,
      order,
      hints: hintsEN,
      translations: {
        create: [
          {
            languageCode: LanguageCode.EN,
            question: questionEN,
            hints: hintsEN,
          },
          {
            languageCode: LanguageCode.AR,
            question: questionAR,
            hints: hintsAR,
          },
          {
            languageCode: LanguageCode.FR,
            question: questionFR,
            hints: hintsFR,
          },
        ],
      },
      answers: {
        create: answers.map((ans, idx) => ({
          text: ans.textEN,
          isCorrect: ans.isCorrect,
          order: idx + 1,
          translations: {
            create: [
              {
                languageCode: LanguageCode.EN,
                text: ans.textEN,
              },
              {
                languageCode: LanguageCode.AR,
                text: ans.textAR,
              },
              {
                languageCode: LanguageCode.FR,
                text: ans.textFR,
              },
            ],
          },
        })),
      },
    },
  });
}

// ============================================
// MAIN SEEDING FUNCTION
// ============================================

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
    console.log("📚 Creating 10 Levels with Badges...");
    const levelStars = [0, 50, 100, 150, 200, 250, 300, 400, 500, 600];
    const badgeNames = [
      "Story Starter",
      "Story Explorer",
      "Story Enthusiast",
      "Reading Ranger",
      "Adventure Lover",
      "World Discoverer",
      "Challenge Master",
      "Story Sage",
      "Reading Champion",
      "Master Reader",
    ];

    for (let i = 0; i < levelStars.length; i++) {
      const level = await prisma.level.create({
        data: {
          levelNumber: i + 1,
          requiredStars: levelStars[i],
        },
      });

      const badgeName = badgeNames[i];
      const badgeData = translations.badges[badgeName as keyof typeof translations.badges];

      if (badgeData) {
        await prisma.badge.create({
          data: {
            name: badgeData.EN,
            description: badgeData.description?.EN,
            levelId: level.id,
            translations: {
              create: [
                {
                  languageCode: LanguageCode.EN,
                  name: badgeData.EN,
                  description: badgeData.description?.EN,
                },
                {
                  languageCode: LanguageCode.AR,
                  name: badgeData.AR,
                  description: badgeData.description?.AR,
                },
                {
                  languageCode: LanguageCode.FR,
                  name: badgeData.FR,
                  description: badgeData.description?.FR,
                },
              ],
            },
          },
        });
      }
    }

    // ============================================
    // 2. Create Age Group with translations
    // ============================================
    console.log("👦 Creating age group (6-7 years) with translations...");
    const ageGroup = await prisma.ageGroup.create({
      data: {
        name: "6-7 years",
        minAge: 6,
        maxAge: 7,
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              name: translations.ageGroups["6-7years"].EN,
            },
            {
              languageCode: LanguageCode.AR,
              name: translations.ageGroups["6-7years"].AR,
            },
            {
              languageCode: LanguageCode.FR,
              name: translations.ageGroups["6-7years"].FR,
            },
          ],
        },
      },
    });

    // ============================================
    // 3. Create Themes with translations
    // ============================================
    console.log("🎨 Creating themes with translations...");
    const adventureTheme = await prisma.theme.create({
      data: {
        name: translations.themes.Adventure.EN,
        description: translations.themes.Adventure.description!.EN,
        imageUrl: "https://picsum.photos/800/600?random=997",
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              name: translations.themes.Adventure.EN,
              description: translations.themes.Adventure.description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              name: translations.themes.Adventure.AR,
              description: translations.themes.Adventure.description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              name: translations.themes.Adventure.FR,
              description: translations.themes.Adventure.description!.FR,
            },
          ],
        },
      },
    });

    const mysteryTheme = await prisma.theme.create({
      data: {
        name: translations.themes.Mystery.EN,
        description: translations.themes.Mystery.description!.EN,
        imageUrl: "https://picsum.photos/800/600?random=998",
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              name: translations.themes.Mystery.EN,
              description: translations.themes.Mystery.description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              name: translations.themes.Mystery.AR,
              description: translations.themes.Mystery.description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              name: translations.themes.Mystery.FR,
              description: translations.themes.Mystery.description!.FR,
            },
          ],
        },
      },
    });

    // ============================================
    // 4. Create Roadmaps with translations
    // ============================================
    console.log("🗺️  Creating roadmaps with translations...");
    const adventureRoadmap = await prisma.roadmap.create({
      data: {
        title: translations.roadmaps.Adventure.EN,
        ageGroupId: ageGroup.id,
        themeId: adventureTheme.id,
        readingLevel: ReadingLevel.BEGINNER,
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              title: translations.roadmaps.Adventure.EN,
            },
            {
              languageCode: LanguageCode.AR,
              title: translations.roadmaps.Adventure.AR,
            },
            {
              languageCode: LanguageCode.FR,
              title: translations.roadmaps.Adventure.FR,
            },
          ],
        },
      },
    });

    const mysteryRoadmap = await prisma.roadmap.create({
      data: {
        title: translations.roadmaps.Mystery.EN,
        ageGroupId: ageGroup.id,
        themeId: mysteryTheme.id,
        readingLevel: ReadingLevel.EASY,
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              title: translations.roadmaps.Mystery.EN,
            },
            {
              languageCode: LanguageCode.AR,
              title: translations.roadmaps.Mystery.AR,
            },
            {
              languageCode: LanguageCode.FR,
              title: translations.roadmaps.Mystery.FR,
            },
          ],
        },
      },
    });

    // ============================================
    // 5. Create Worlds with translations
    // ============================================
    console.log("🌍 Creating 4 worlds with translations...");

    const forestWorld = await prisma.world.create({
      data: {
        name: translations.worlds["Forest Quest"].EN,
        description: translations.worlds["Forest Quest"].description!.EN,
        roadmapId: adventureRoadmap.id,
        order: 1,
        imageUrl: "https://picsum.photos/800/600?random=101",
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              name: translations.worlds["Forest Quest"].EN,
              description: translations.worlds["Forest Quest"].description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              name: translations.worlds["Forest Quest"].AR,
              description: translations.worlds["Forest Quest"].description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              name: translations.worlds["Forest Quest"].FR,
              description: translations.worlds["Forest Quest"].description!.FR,
            },
          ],
        },
      },
    });

    const desertWorld = await prisma.world.create({
      data: {
        name: translations.worlds["Desert Journey"].EN,
        description: translations.worlds["Desert Journey"].description!.EN,
        roadmapId: adventureRoadmap.id,
        order: 2,
        imageUrl: "https://picsum.photos/800/600?random=102",
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              name: translations.worlds["Desert Journey"].EN,
              description: translations.worlds["Desert Journey"].description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              name: translations.worlds["Desert Journey"].AR,
              description: translations.worlds["Desert Journey"].description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              name: translations.worlds["Desert Journey"].FR,
              description: translations.worlds["Desert Journey"].description!.FR,
            },
          ],
        },
      },
    });

    const toyWorld = await prisma.world.create({
      data: {
        name: translations.worlds["The Missing Toy"].EN,
        description: translations.worlds["The Missing Toy"].description!.EN,
        roadmapId: mysteryRoadmap.id,
        order: 1,
        imageUrl: "https://picsum.photos/800/600?random=103",
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              name: translations.worlds["The Missing Toy"].EN,
              description: translations.worlds["The Missing Toy"].description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              name: translations.worlds["The Missing Toy"].AR,
              description: translations.worlds["The Missing Toy"].description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              name: translations.worlds["The Missing Toy"].FR,
              description: translations.worlds["The Missing Toy"].description!.FR,
            },
          ],
        },
      },
    });

    const houseWorld = await prisma.world.create({
      data: {
        name: translations.worlds["Secret of the Old House"].EN,
        description: translations.worlds["Secret of the Old House"].description!.EN,
        roadmapId: mysteryRoadmap.id,
        order: 2,
        imageUrl: "https://picsum.photos/800/600?random=104",
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              name: translations.worlds["Secret of the Old House"].EN,
              description: translations.worlds["Secret of the Old House"].description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              name: translations.worlds["Secret of the Old House"].AR,
              description: translations.worlds["Secret of the Old House"].description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              name: translations.worlds["Secret of the Old House"].FR,
              description: translations.worlds["Secret of the Old House"].description!.FR,
            },
          ],
        },
      },
    });

    // ============================================
    // 6. Create Stories with translations
    // ============================================
    console.log("📖 Creating 4 stories with translations...");

    const lostMapStory = await prisma.story.create({
      data: {
        title: translations.stories["The Lost Map"].EN,
        description: translations.stories["The Lost Map"].description!.EN,
        worldId: forestWorld.id,
        difficulty: 1,
        order: 1,
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              title: translations.stories["The Lost Map"].EN,
              description: translations.stories["The Lost Map"].description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              title: translations.stories["The Lost Map"].AR,
              description: translations.stories["The Lost Map"].description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              title: translations.stories["The Lost Map"].FR,
              description: translations.stories["The Lost Map"].description!.FR,
            },
          ],
        },
      },
    });

    const riverStory = await prisma.story.create({
      data: {
        title: translations.stories["River Crossing"].EN,
        description: translations.stories["River Crossing"].description!.EN,
        worldId: forestWorld.id,
        difficulty: 2,
        order: 2,
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              title: translations.stories["River Crossing"].EN,
              description: translations.stories["River Crossing"].description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              title: translations.stories["River Crossing"].AR,
              description: translations.stories["River Crossing"].description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              title: translations.stories["River Crossing"].FR,
              description: translations.stories["River Crossing"].description!.FR,
            },
          ],
        },
      },
    });

    const caveStory = await prisma.story.create({
      data: {
        title: translations.stories["The Hidden Cave"].EN,
        description: translations.stories["The Hidden Cave"].description!.EN,
        worldId: forestWorld.id,
        difficulty: 2,
        order: 3,
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              title: translations.stories["The Hidden Cave"].EN,
              description: translations.stories["The Hidden Cave"].description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              title: translations.stories["The Hidden Cave"].AR,
              description: translations.stories["The Hidden Cave"].description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              title: translations.stories["The Hidden Cave"].FR,
              description: translations.stories["The Hidden Cave"].description!.FR,
            },
          ],
        },
      },
    });

    const mountainStory = await prisma.story.create({
      data: {
        title: translations.stories["The Mountain Climb"].EN,
        description: translations.stories["The Mountain Climb"].description!.EN,
        worldId: forestWorld.id,
        difficulty: 3,
        order: 4,
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              title: translations.stories["The Mountain Climb"].EN,
              description: translations.stories["The Mountain Climb"].description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              title: translations.stories["The Mountain Climb"].AR,
              description: translations.stories["The Mountain Climb"].description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              title: translations.stories["The Mountain Climb"].FR,
              description: translations.stories["The Mountain Climb"].description!.FR,
            },
          ],
        },
      },
    });

    // Desert Journey Stories (Adventure World 2)
    const mirageStory = await prisma.story.create({
      data: {
        title: translations.stories["The Mirage"].EN,
        description: translations.stories["The Mirage"].description!.EN,
        worldId: desertWorld.id,
        difficulty: 2,
        order: 1,
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              title: translations.stories["The Mirage"].EN,
              description: translations.stories["The Mirage"].description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              title: translations.stories["The Mirage"].AR,
              description: translations.stories["The Mirage"].description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              title: translations.stories["The Mirage"].FR,
              description: translations.stories["The Mirage"].description!.FR,
            },
          ],
        },
      },
    });

    const oasisStory = await prisma.story.create({
      data: {
        title: translations.stories["The Oasis"].EN,
        description: translations.stories["The Oasis"].description!.EN,
        worldId: desertWorld.id,
        difficulty: 2,
        order: 2,
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              title: translations.stories["The Oasis"].EN,
              description: translations.stories["The Oasis"].description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              title: translations.stories["The Oasis"].AR,
              description: translations.stories["The Oasis"].description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              title: translations.stories["The Oasis"].FR,
              description: translations.stories["The Oasis"].description!.FR,
            },
          ],
        },
      },
    });

    const sandstormStory = await prisma.story.create({
      data: {
        title: translations.stories["The Sandstorm"].EN,
        description: translations.stories["The Sandstorm"].description!.EN,
        worldId: desertWorld.id,
        difficulty: 3,
        order: 3,
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              title: translations.stories["The Sandstorm"].EN,
              description: translations.stories["The Sandstorm"].description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              title: translations.stories["The Sandstorm"].AR,
              description: translations.stories["The Sandstorm"].description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              title: translations.stories["The Sandstorm"].FR,
              description: translations.stories["The Sandstorm"].description!.FR,
            },
          ],
        },
      },
    });

    // The Missing Toy Stories (Mystery World 1)
    const disappearanceStory = await prisma.story.create({
      data: {
        title: translations.stories["The Disappearance"].EN,
        description: translations.stories["The Disappearance"].description!.EN,
        worldId: toyWorld.id,
        difficulty: 1,
        order: 1,
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              title: translations.stories["The Disappearance"].EN,
              description: translations.stories["The Disappearance"].description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              title: translations.stories["The Disappearance"].AR,
              description: translations.stories["The Disappearance"].description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              title: translations.stories["The Disappearance"].FR,
              description: translations.stories["The Disappearance"].description!.FR,
            },
          ],
        },
      },
    });

    const followingCluesStory = await prisma.story.create({
      data: {
        title: translations.stories["Following Clues"].EN,
        description: translations.stories["Following Clues"].description!.EN,
        worldId: toyWorld.id,
        difficulty: 2,
        order: 2,
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              title: translations.stories["Following Clues"].EN,
              description: translations.stories["Following Clues"].description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              title: translations.stories["Following Clues"].AR,
              description: translations.stories["Following Clues"].description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              title: translations.stories["Following Clues"].FR,
              description: translations.stories["Following Clues"].description!.FR,
            },
          ],
        },
      },
    });

    // Secret of the Old House Stories (Mystery World 2)
    const redHerringStory = await prisma.story.create({
      data: {
        title: translations.stories["The Red Herring"].EN,
        description: translations.stories["The Red Herring"].description!.EN,
        worldId: houseWorld.id,
        difficulty: 2,
        order: 1,
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              title: translations.stories["The Red Herring"].EN,
              description: translations.stories["The Red Herring"].description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              title: translations.stories["The Red Herring"].AR,
              description: translations.stories["The Red Herring"].description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              title: translations.stories["The Red Herring"].FR,
              description: translations.stories["The Red Herring"].description!.FR,
            },
          ],
        },
      },
    });

    const oldHouseStory = await prisma.story.create({
      data: {
        title: translations.stories["The Old House"].EN,
        description: translations.stories["The Old House"].description!.EN,
        worldId: houseWorld.id,
        difficulty: 2,
        order: 2,
        translations: {
          create: [
            {
              languageCode: LanguageCode.EN,
              title: translations.stories["The Old House"].EN,
              description: translations.stories["The Old House"].description!.EN,
            },
            {
              languageCode: LanguageCode.AR,
              title: translations.stories["The Old House"].AR,
              description: translations.stories["The Old House"].description!.AR,
            },
            {
              languageCode: LanguageCode.FR,
              title: translations.stories["The Old House"].FR,
              description: translations.stories["The Old House"].description!.FR,
            },
          ],
        },
      },
    });



    // ============================================
    // 7. Create Chapters for The Lost Map Story
    // ============================================
    console.log("📄 Creating chapters for The Lost Map with full translations...");

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

    const lostMapChapters = [];
    for (let chIdx = 0; chIdx < 8; chIdx++) {
      const titleData = translations.chapters[chapterTitles[chIdx] as keyof typeof translations.chapters];
      const contentEN = storyContent["The Lost Map"][chIdx as keyof typeof storyContent["The Lost Map"]];
      const translations_chaps = chapterTranslations["The Lost Map"][chIdx];

      const chapter = await createChapter(
        lostMapStory.id,
        titleData.EN,
        titleData.AR,
        titleData.FR,
        contentEN,
        translations_chaps.AR,
        translations_chaps.FR,
        chIdx + 1,
        chapterImages["The Lost Map"][chIdx],
      );

      lostMapChapters.push(chapter);
    }

    // ============================================
    // 8. Create Chapters for River Crossing Story
    // ============================================
    console.log("📄 Creating chapters for River Crossing with full translations...");

    const riverCrossingChapters = [];
    for (let chIdx = 0; chIdx < 8; chIdx++) {
      const titleData = translations.chapters[chapterTitles[chIdx] as keyof typeof translations.chapters];
      const contentEN = storyContent["River Crossing"][chIdx as keyof typeof storyContent["River Crossing"]];
      const translations_chaps = chapterTranslations["River Crossing"][chIdx];

      const chapter = await createChapter(
        riverStory.id,
        titleData.EN,
        titleData.AR,
        titleData.FR,
        contentEN,
        translations_chaps.AR,
        translations_chaps.FR,
        chIdx + 1,
        chapterImages["River Crossing"][chIdx],
      );

      riverCrossingChapters.push(chapter);
    }

    // ============================================
    // 9. Create Chapters for The Hidden Cave Story
    // ============================================
    console.log("📄 Creating chapters for The Hidden Cave with full translations...");

    const caveChapters = [];
    for (let chIdx = 0; chIdx < 8; chIdx++) {
      const titleData = translations.chapters[chapterTitles[chIdx] as keyof typeof translations.chapters];
      const contentEN = storyContent["The Hidden Cave"][chIdx as keyof typeof storyContent["The Hidden Cave"]];
      const translations_chaps = chapterTranslations["The Hidden Cave"][chIdx];

      const chapter = await createChapter(
        caveStory.id,
        titleData.EN,
        titleData.AR,
        titleData.FR,
        contentEN,
        translations_chaps.AR,
        translations_chaps.FR,
        chIdx + 1,
        chapterImages["The Hidden Cave"][chIdx],
      );

      caveChapters.push(chapter);
    }

    // ============================================
    // 10. Create Chapters for The Mountain Climb Story
    // ============================================
    console.log("📄 Creating chapters for The Mountain Climb with full translations...");

    const mountainChapters = [];
    for (let chIdx = 0; chIdx < 8; chIdx++) {
      const titleData = translations.chapters[chapterTitles[chIdx] as keyof typeof translations.chapters];
      const contentEN = storyContent["The Mountain Climb"][chIdx as keyof typeof storyContent["The Mountain Climb"]];
      const translations_chaps = chapterTranslations["The Mountain Climb"][chIdx];

      const chapter = await createChapter(
        mountainStory.id,
        titleData.EN,
        titleData.AR,
        titleData.FR,
        contentEN,
        translations_chaps.AR,
        translations_chaps.FR,
        chIdx + 1,
        chapterImages["The Mountain Climb"][chIdx],
      );

      mountainChapters.push(chapter);
    }

    // ============================================
    // 11. Create Chapters for The Mirage Story
    // ============================================
    console.log("📄 Creating chapters for The Mirage with full translations...");

    const mirageChapters = [];
    for (let chIdx = 0; chIdx < 8; chIdx++) {
      const titleData = translations.chapters[chapterTitles[chIdx] as keyof typeof translations.chapters];
      const contentEN = storyContent["The Mirage"][chIdx as keyof typeof storyContent["The Mirage"]];
      const translations_chaps = chapterTranslations["The Mirage"][chIdx];

      const chapter = await createChapter(
        mirageStory.id,
        titleData.EN,
        titleData.AR,
        titleData.FR,
        contentEN,
        translations_chaps.AR,
        translations_chaps.FR,
        chIdx + 1,
        chapterImages["The Mirage"][chIdx],
      );

      mirageChapters.push(chapter);
    }

    // ============================================
    // 12. Create Chapters for The Oasis Story
    // ============================================
    console.log("📄 Creating chapters for The Oasis with full translations...");

    const oasisChapters = [];
    for (let chIdx = 0; chIdx < 8; chIdx++) {
      const titleData = translations.chapters[chapterTitles[chIdx] as keyof typeof translations.chapters];
      const contentEN = storyContent["The Oasis"][chIdx as keyof typeof storyContent["The Oasis"]];
      const translations_chaps = chapterTranslations["The Oasis"][chIdx];

      const chapter = await createChapter(
        oasisStory.id,
        titleData.EN,
        titleData.AR,
        titleData.FR,
        contentEN,
        translations_chaps.AR,
        translations_chaps.FR,
        chIdx + 1,
        chapterImages["The Oasis"][chIdx],
      );

      oasisChapters.push(chapter);
    }

    // ============================================
    // 13. Create Chapters for The Sandstorm Story
    // ============================================
    console.log("📄 Creating chapters for The Sandstorm with full translations...");

    const sandstormChapters = [];
    for (let chIdx = 0; chIdx < 8; chIdx++) {
      const titleData = translations.chapters[chapterTitles[chIdx] as keyof typeof translations.chapters];
      const contentEN = storyContent["The Sandstorm"][chIdx as keyof typeof storyContent["The Sandstorm"]];
      const translations_chaps = chapterTranslations["The Sandstorm"][chIdx];

      const chapter = await createChapter(
        sandstormStory.id,
        titleData.EN,
        titleData.AR,
        titleData.FR,
        contentEN,
        translations_chaps.AR,
        translations_chaps.FR,
        chIdx + 1,
        chapterImages["The Sandstorm"][chIdx],
      );

      sandstormChapters.push(chapter);
    }

    // ============================================
    // 14. Create Chapters for The Disappearance Story
    // ============================================
    console.log("📄 Creating chapters for The Disappearance with full translations...");

    const disappearanceChapters = [];
    for (let chIdx = 0; chIdx < 8; chIdx++) {
      const titleData = translations.chapters[chapterTitles[chIdx] as keyof typeof translations.chapters];
      const contentEN = storyContent["The Disappearance"][chIdx as keyof typeof storyContent["The Disappearance"]];
      const translations_chaps = chapterTranslations["The Disappearance"][chIdx];

      const chapter = await createChapter(
        disappearanceStory.id,
        titleData.EN,
        titleData.AR,
        titleData.FR,
        contentEN,
        translations_chaps.AR,
        translations_chaps.FR,
        chIdx + 1,
        chapterImages["The Disappearance"][chIdx],
      );

      disappearanceChapters.push(chapter);
    }

    // ============================================
    // 15. Create Chapters for Following Clues Story
    // ============================================
    console.log("📄 Creating chapters for Following Clues with full translations...");

    const followingCluesChapters = [];
    for (let chIdx = 0; chIdx < 8; chIdx++) {
      const titleData = translations.chapters[chapterTitles[chIdx] as keyof typeof translations.chapters];
      const contentEN = storyContent["Following Clues"][chIdx as keyof typeof storyContent["Following Clues"]];
      const translations_chaps = chapterTranslations["Following Clues"][chIdx];

      const chapter = await createChapter(
        followingCluesStory.id,
        titleData.EN,
        titleData.AR,
        titleData.FR,
        contentEN,
        translations_chaps.AR,
        translations_chaps.FR,
        chIdx + 1,
        chapterImages["Following Clues"][chIdx],
      );

      followingCluesChapters.push(chapter);
    }

    // ============================================
    // 16. Create Chapters for The Red Herring Story
    // ============================================
    console.log("📄 Creating chapters for The Red Herring with full translations...");

    const redHerringChapters = [];
    for (let chIdx = 0; chIdx < 8; chIdx++) {
      const titleData = translations.chapters[chapterTitles[chIdx] as keyof typeof translations.chapters];
      const contentEN = storyContent["The Red Herring"][chIdx as keyof typeof storyContent["The Red Herring"]];
      const translations_chaps = chapterTranslations["The Red Herring"][chIdx];

      const chapter = await createChapter(
        redHerringStory.id,
        titleData.EN,
        titleData.AR,
        titleData.FR,
        contentEN,
        translations_chaps.AR,
        translations_chaps.FR,
        chIdx + 1,
        chapterImages["The Red Herring"][chIdx],
      );

      redHerringChapters.push(chapter);
    }

    // ============================================
    // 17. Create Chapters for The Old House Story
    // ============================================
    console.log("📄 Creating chapters for The Old House with full translations...");

    const oldHouseChapters = [];
    for (let chIdx = 0; chIdx < 8; chIdx++) {
      const titleData = translations.chapters[chapterTitles[chIdx] as keyof typeof translations.chapters];
      const contentEN = storyContent["The Old House"][chIdx as keyof typeof storyContent["The Old House"]];
      const translations_chaps = chapterTranslations["The Old House"][chIdx];

      const chapter = await createChapter(
        oldHouseStory.id,
        titleData.EN,
        titleData.AR,
        titleData.FR,
        contentEN,
        translations_chaps.AR,
        translations_chaps.FR,
        chIdx + 1,
        chapterImages["The Old House"][chIdx],
      );

      oldHouseChapters.push(chapter);
    }

    // ============================================
    // 18. Create Comprehensive Challenges
    // ============================================
    console.log("❓ Creating comprehensive challenges with full translations...");

    // ========== THE LOST MAP CHALLENGES ==========
    await createChallenge(
      lostMapChapters[0].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What did your grandmother give you?",
      "ماذا أعطتك جدتك؟",
      "Qu'est-ce que ta grand-mère t'a donné?",
      ["It's an old piece of paper", "It shows directions", "It leads to treasure"],
      ["إنها قطعة ورق قديمة", "تعرض الاتجاهات", "تؤدي إلى الكنز"],
      ["C'est un vieux morceau de papier", "Il montre les directions", "Il mène au trésor"],
      [
        { textEN: "A map", textAR: "خريطة", textFR: "Une carte", isCorrect: true },
        { textEN: "A book", textAR: "كتاب", textFR: "Un livre", isCorrect: false },
        { textEN: "A compass", textAR: "بوصلة", textFR: "Une boussole", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      lostMapChapters[2].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What do you discover behind the waterfall?",
      "ما الذي تكتشفه خلف الشلال؟",
      "Qu'est-ce que vous découvrez derrière la cascade?",
      ["A hidden cave", "An ancient path", "Crystal formations"],
      ["كهف مخفي", "مسار قديم", "تشكيلات بلورية"],
      ["Une grotte cachée", "Une voie ancienne", "Des formations cristallines"],
      [
        { textEN: "A treasure chest", textAR: "صندوق كنز", textFR: "Un coffre au trésor", isCorrect: false },
        { textEN: "A hidden chamber", textAR: "حجرة مخفية", textFR: "Une chambre cachée", isCorrect: true },
        { textEN: "A magical door", textAR: "باب سحري", textFR: "Une porte magique", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      lostMapChapters[3].id,
      ChallengeType.MULTIPLE_CHOICE,
      "How did the wolf test you?",
      "كيف اختبرك الذئب؟",
      "Comment le loup t'a-t-il testé?",
      ["It was about your character", "Not a physical test", "Kindness matters"],
      ["كان عن شخصيتك", "ليس اختبارًا بدنيًا", "اللطف يهم"],
      ["C'était sur ton caractère", "Pas un test physique", "La gentillesse compte"],
      [
        { textEN: "With physical strength", textAR: "بالقوة البدنية", textFR: "Par la force physique", isCorrect: false },
        { textEN: "With your heart and kindness", textAR: "بقلبك وطيبة قلبك", textFR: "Par ton cœur et ta gentillesse", isCorrect: true },
        { textEN: "With riddles", textAR: "بالألغاز", textFR: "Avec des énigmes", isCorrect: false },
      ],
      1,
      25,
    );

    // ========== RIVER CROSSING CHALLENGES ==========
    await createChallenge(
      riverCrossingChapters[1].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What do you find on the riverbank?",
      "ماذا تجد على ضفة النهر؟",
      "Qu'est-ce que vous trouvez sur la rive de la rivière?",
      ["Calm water", "A safe path", "Stepping stones"],
      ["ماء هادئ", "مسار آمن", "حجارة الخطوات"],
      ["De l'eau calme", "Une voie sûre", "Des pierres de gué"],
      [
        { textEN: "A hidden boat", textAR: "قارب مخفي", textFR: "Un bateau caché", isCorrect: false },
        { textEN: "A series of rocks", textAR: "سلسلة من الصخور", textFR: "Une série de rochers", isCorrect: true },
        { textEN: "A bridge", textAR: "جسر", textFR: "Un pont", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      riverCrossingChapters[3].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What makes the rock crossing dangerous?",
      "ما الذي يجعل عبور الصخور خطيرًا؟",
      "Qu'est-ce qui rend la traversée des rochers dangereuse?",
      ["The rocks are slippery", "The current is strong", "You need balance"],
      ["الصخور زلقة", "التيار قوي", "تحتاج إلى التوازن"],
      ["Les roches sont glissantes", "Le courant est fort", "Vous avez besoin d'équilibre"],
      [
        { textEN: "The water is cold", textAR: "الماء بارد", textFR: "L'eau est froide", isCorrect: false },
        { textEN: "Rocks and current", textAR: "الصخور والتيار", textFR: "Les roches et le courant", isCorrect: true },
        { textEN: "There are large fish", textAR: "هناك أسماك كبيرة", textFR: "Il y a de gros poissons", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      riverCrossingChapters[5].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What does Captain Moss say when you reach the other side?",
      "ماذا يقول الكابتن موس عندما تصل إلى الجانب الآخر؟",
      "Que dit le Capitaine Mousse quand vous atteignez l'autre côté?",
      ["You are brave", "You succeeded", "You are strong"],
      ["أنت شجاع", "نجحت", "أنت قوي"],
      ["Tu es courageux", "Tu as réussi", "Tu es fort"],
      [
        { textEN: "You made it!", textAR: "لقد نجحت!", textFR: "Tu as réussi!", isCorrect: false },
        { textEN: "You've done it!", textAR: "أنت أنجزت ذلك!", textFR: "Tu l'as fait!", isCorrect: true },
        { textEN: "You are amazing!", textAR: "أنت رائع!", textFR: "Tu es incroyable!", isCorrect: false },
      ],
      1,
      20,
    );

    // ========== THE HIDDEN CAVE CHALLENGES ==========
    await createChallenge(
      caveChapters[1].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What do the cave walls reveal?",
      "ماذا تكشف جدران الكهف؟",
      "Que révèlent les murs de la grotte?",
      ["Ancient stories", "Paintings", "Historical records"],
      ["قصص قديمة", "رسومات", "سجلات تاريخية"],
      ["Des histoires anciennes", "Des peintures", "Des dossiers historiques"],
      [
        { textEN: "Treasure maps", textAR: "خرائط الكنز", textFR: "Cartes au trésor", isCorrect: false },
        { textEN: "Magnificent paintings", textAR: "رسومات رائعة", textFR: "Des peintures magnifiques", isCorrect: true },
        { textEN: "Written messages", textAR: "رسائل مكتوبة", textFR: "Messages écrits", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      caveChapters[4].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What does the handprint gallery represent?",
      "ماذا يمثل معرض بصمات اليد؟",
      "Que représente la galerie d'empreintes de mains?",
      ["Ancient people", "Connection across time", "Permanent mark"],
      ["الناس القدماء", "الارتباط عبر الزمن", "علامة دائمة"],
      ["Les anciens peuples", "La connexion à travers le temps", "Une marque permanente"],
      [
        { textEN: "A game", textAR: "لعبة", textFR: "Un jeu", isCorrect: false },
        { textEN: "A personal connection across centuries", textAR: "اتصال شخصي عبر القرون", textFR: "Une connexion personnelle à travers les siècles", isCorrect: true },
        { textEN: "A warning", textAR: "تحذير", textFR: "Un avertissement", isCorrect: false },
      ],
      1,
      25,
    );

    // ========== THE MOUNTAIN CLIMB CHALLENGES ==========
    await createChallenge(
      mountainChapters[0].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What challenges the climber?",
      "ما الذي يتحدى المتسلق؟",
      "Qu'est-ce qui défie le grimpeur?",
      ["The height", "The difficulty", "The peak piercing clouds"],
      ["الارتفاع", "الصعوبة", "القمة التي تخترق الغيوم"],
      ["La hauteur", "La difficulté", "Le pic perçant les nuages"],
      [
        { textEN: "Dangerous animals", textAR: "حيوانات خطيرة", textFR: "Animaux dangereux", isCorrect: false },
        { textEN: "The tallest mountain with its peak in clouds", textAR: "أطول جبل بقمة في السحب", textFR: "La plus haute montagne avec son pic dans les nuages", isCorrect: true },
        { textEN: "Bad weather", textAR: "الطقس السيء", textFR: "Mauvais temps", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      mountainChapters[5].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What appears when you're almost at summit?",
      "ما الذي يظهر عندما تكون قريبًا من القمة؟",
      "Qu'est-ce qui apparaît quand vous êtes près du sommet?",
      ["Bad luck", "A storm", "Lightning"],
      ["سوء حظ", "عاصفة", "برق"],
      ["Malchance", "Une tempête", "Un éclair"],
      [
        { textEN: "Clear skies", textAR: "سماء صافية", textFR: "Ciel dégagé", isCorrect: false },
        { textEN: "A sudden storm", textAR: "عاصفة مفاجئة", textFR: "Une tempête soudaine", isCorrect: true },
        { textEN: "A rainbow", textAR: "قوس قزح", textFR: "Un arc-en-ciel", isCorrect: false },
      ],
      1,
      25,
    );

    // ========== THE MIRAGE CHALLENGES ==========
    await createChallenge(
      mirageChapters[1].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What do you see in the desert?",
      "ماذا ترى في الصحراء؟",
      "Qu'est-ce que vous voyez dans le désert?",
      ["Another person", "A beautiful city", "Fresh water"],
      ["شخص آخر", "مدينة جميلة", "ماء عذب"],
      ["Une autre personne", "Une belle ville", "De l'eau douce"],
      [
        { textEN: "An oasis", textAR: "واحة", textFR: "Une oasis", isCorrect: false },
        { textEN: "A beautiful city with gardens", textAR: "مدينة جميلة بها حدائق", textFR: "Une belle ville avec des jardins", isCorrect: true },
        { textEN: "A caravan", textAR: "القافلة", textFR: "Une caravane", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      mirageChapters[3].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What happens when you touch the building?",
      "ماذا يحدث عندما تلمس المبنى؟",
      "Que se passe-t-il quand vous touchez le bâtiment?",
      ["It's soft", "It's invisible", "It's not real"],
      ["إنه ناعم", "إنه غير مرئي", "إنه ليس حقيقيًا"],
      ["C'est doux", "C'est invisible", "Ce n'est pas réel"],
      [
        { textEN: "Your hand passes through", textAR: "تمر يدك من خلالها", textFR: "Votre main passe à travers", isCorrect: true },
        { textEN: "The building disappears", textAR: "المبنى يختفي", textFR: "Le bâtiment disparaît", isCorrect: false },
        { textEN: "You fall down", textAR: "تسقط", textFR: "Tu tombes", isCorrect: false },
      ],
      1,
      20,
    );

    // ========== THE OASIS CHALLENGES ==========
    await createChallenge(
      oasisChapters[1].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What surrounds the oasis?",
      "ما الذي يحيط بالواحة؟",
      "Qu'est-ce qui entoure l'oasis?",
      ["Sand dunes", "Cliffs", "Palm trees"],
      ["كثبان رملية", "جروف", "أشجار النخيل"],
      ["Dunes de sable", "Falaises", "Palmiers"],
      [
        { textEN: "Water", textAR: "ماء", textFR: "De l'eau", isCorrect: false },
        { textEN: "Towering cliffs", textAR: "جروف شاهقة", textFR: "Des falaises imposantes", isCorrect: true },
        { textEN: "Forests", textAR: "غابات", textFR: "Forêts", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      oasisChapters[3].id,
      ChallengeType.MULTIPLE_CHOICE,
      "How long have people lived in the oasis?",
      "كم من الوقت عاش الناس في الواحة؟",
      "Depuis combien de temps les gens vivent-ils à l'oasis?",
      ["Decades", "Centuries", "Generations"],
      ["عقود", "قرون", "أجيال"],
      ["Des décennies", "Des siècles", "Des générations"],
      [
        { textEN: "Only recently", textAR: "مؤخرًا فقط", textFR: "Seulement récemment", isCorrect: false },
        { textEN: "For many generations", textAR: "لأجيال عديدة", textFR: "Pendant de nombreuses générations", isCorrect: true },
        { textEN: "Just a few years", textAR: "بضع سنوات فقط", textFR: "Seulement quelques années", isCorrect: false },
      ],
      1,
      20,
    );

    // ========== THE SANDSTORM CHALLENGES ==========
    await createChallenge(
      sandstormChapters[0].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What approaches from the horizon?",
      "ما الذي يقترب من الأفق؟",
      "Qu'est-ce qui approche de l'horizon?",
      ["Rain", "Wind", "A massive wave of sand"],
      ["مطر", "ريح", "موجة ضخمة من الرمل"],
      ["Pluie", "Vent", "Une vague massive de sable"],
      [
        { textEN: "A dust cloud", textAR: "سحابة غبار", textFR: "Un nuage de poussière", isCorrect: false },
        { textEN: "A massive wall of sand", textAR: "جدار ضخم من الرمل", textFR: "Un mur massif de sable", isCorrect: true },
        { textEN: "A caravan", textAR: "قافلة", textFR: "Une caravane", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      sandstormChapters[4].id,
      ChallengeType.MULTIPLE_CHOICE,
      "How do you know sandstorms pass?",
      "كيف تعرف أن العواصف الرملية تمر؟",
      "Comment savez-vous que les tempêtes de sable passent?",
      ["You read about it", "You've seen one before", "It's logical"],
      ["قرأت عنها", "شهدت واحدة من قبل", "إنه منطقي"],
      ["Tu as lu à ce sujet", "Tu en as vu un avant", "C'est logique"],
      [
        { textEN: "You've heard stories", textAR: "سمعت قصصًا", textFR: "Tu as entendu des histoires", isCorrect: false },
        { textEN: "You read that they always pass eventually", textAR: "قرأت أنهم يمرون في النهاية", textFR: "Tu as lu qu'ils passent toujours finalement", isCorrect: true },
        { textEN: "You guessed", textAR: "خمنت", textFR: "Tu as deviné", isCorrect: false },
      ],
      1,
      20,
    );

    // ========== THE DISAPPEARANCE CHALLENGES ==========
    await createChallenge(
      disappearanceChapters[1].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What clue do you find under the bed?",
      "ما الدليل الذي تجده تحت السرير؟",
      "Quel indice trouvez-vous sous le lit?",
      ["A journal", "A button", "A note"],
      ["دفتر يوميات", "زر", "ملاحظة"],
      ["Un journal", "Un bouton", "Une note"],
      [
        { textEN: "A diary", textAR: "مذكرات", textFR: "Un journal intime", isCorrect: false },
        { textEN: "A button that doesn't match the dress", textAR: "زر لا يطابق الفستان", textFR: "Un bouton qui ne correspond pas à la robe", isCorrect: true },
        { textEN: "A shoe", textAR: "حذاء", textFR: "Une chaussure", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      disappearanceChapters[6].id,
      ChallengeType.MULTIPLE_CHOICE,
      "Who took the doll and why?",
      "من أخذ الدمية ولماذا؟",
      "Qui a pris la poupée et pourquoi?",
      ["The neighbor", "The neighbor's child", "A stranger"],
      ["الجار", "طفل الجار", "غريب"],
      ["Le voisin", "L'enfant du voisin", "Un étranger"],
      [
        { textEN: "The neighbor", textAR: "الجار", textFR: "Le voisin", isCorrect: false },
        { textEN: "The neighbor's child who was lonely", textAR: "طفل الجار الذي كان وحيدًا", textFR: "L'enfant du voisin qui était seul", isCorrect: true },
        { textEN: "A stranger from town", textAR: "غريب من المدينة", textFR: "Un étranger de la ville", isCorrect: false },
      ],
      1,
      25,
    );

    // ========== FOLLOWING CLUES CHALLENGES ==========
    await createChallenge(
      followingCluesChapters[1].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What does the security guard mention?",
      "ماذا يذكر حارس الأمن؟",
      "Que mentionne le garde de sécurité?",
      ["Missing paintings", "Strange footprints", "Broken cameras"],
      ["لوحات مفقودة", "بصمات غريبة", "كاميرات مكسورة"],
      ["Peintures manquantes", "Des empreintes étranges", "Caméras cassées"],
      [
        { textEN: "A strange person", textAR: "شخص غريب", textFR: "Une personne étrange", isCorrect: false },
        { textEN: "Strange footprints near storage", textAR: "بصمات غريبة بالقرب من التخزين", textFR: "Des empreintes étranges près du stockage", isCorrect: true },
        { textEN: "Missing money", textAR: "أموال مفقودة", textFR: "Argent manquant", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      followingCluesChapters[4].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What does the janitor's schedule reveal?",
      "ماذا يكشف جدول عمل الحارس؟",
      "Que révèle l'horaire du concierge?",
      ["He was working", "He wasn't there that night", "He left early"],
      ["كان يعمل", "لم يكن هناك تلك الليلة", "غادر مبكرًا"],
      ["Il travaillait", "Il n'était pas là ce soir-là", "Il est parti tôt"],
      [
        { textEN: "He was guilty", textAR: "كان مذنبًا", textFR: "Il était coupable", isCorrect: false },
        { textEN: "He wasn't there that night", textAR: "لم يكن هناك تلك الليلة", textFR: "Il n'était pas là ce soir-là", isCorrect: true },
        { textEN: "He worked late", textAR: "عمل حتى وقت متأخر", textFR: "Il a travaillé tard", isCorrect: false },
      ],
      1,
      20,
    );

    // ========== THE RED HERRING CHALLENGES ==========
    await createChallenge(
      redHerringChapters[0].id,
      ChallengeType.MULTIPLE_CHOICE,
      "Who does everyone suspect?",
      "من يشك الجميع فيه؟",
      "Qui tout le monde suspecte-t-il?",
      ["The butler", "The son", "The housekeeper"],
      ["الخادم", "الابن", "العاملة المنزلية"],
      ["Le valet", "Le fils", "La gouvernante"],
      [
        { textEN: "The housekeeper", textAR: "العاملة المنزلية", textFR: "La gouvernante", isCorrect: false },
        { textEN: "The wealthy family's son", textAR: "ابن العائلة الغنية", textFR: "Le fils de la famille riche", isCorrect: true },
        { textEN: "A servant", textAR: "خادم", textFR: "Un serviteur", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      redHerringChapters[4].id,
      ChallengeType.MULTIPLE_CHOICE,
      "Who is the real criminal?",
      "من هو المجرم الحقيقي؟",
      "Qui est le vrai criminel?",
      ["The son", "The accountant", "The mother"],
      ["الابن", "محاسب", "الأم"],
      ["Le fils", "L'expert-comptable", "La mère"],
      [
        { textEN: "The son", textAR: "الابن", textFR: "Le fils", isCorrect: false },
        { textEN: "The trusted accountant", textAR: "محاسب موثوق", textFR: "L'expert-comptable de confiance", isCorrect: true },
        { textEN: "A hired thief", textAR: "لص مأجور", textFR: "Un voleur engagé", isCorrect: false },
      ],
      1,
      25,
    );

    // ========== THE OLD HOUSE CHALLENGES ==========
    await createChallenge(
      oldHouseChapters[2].id,
      ChallengeType.MULTIPLE_CHOICE,
      "Where do you find the diary?",
      "أين تجد الدفتر؟",
      "Où trouvez-vous le journal?",
      ["In the attic", "Behind a brick in the fireplace", "Under the floorboards"],
      ["في العلية", "خلف لبنة في المدفأة", "تحت الأرضيات"],
      ["Dans le grenier", "Derrière une brique dans la cheminée", "Sous les planches du sol"],
      [
        { textEN: "In a drawer", textAR: "في درج", textFR: "Dans un tiroir", isCorrect: false },
        { textEN: "Hidden behind a loose brick in fireplace", textAR: "مخفي خلف لبنة مفكوكة في المدفأة", textFR: "Caché derrière une brique lâche dans la cheminée", isCorrect: true },
        { textEN: "On a shelf", textAR: "على رف", textFR: "Sur une étagère", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      oldHouseChapters[4].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What do you discover in the attic?",
      "ما الذي تكتشفه في العلية؟",
      "Qu'est-ce que vous découvrez dans le grenier?",
      ["Old furniture", "A hidden art studio", "Treasure"],
      ["أثاث قديم", "استوديو فن مخفي", "كنز"],
      ["Vieux meubles", "Un studio d'art caché", "Trésor"],
      [
        { textEN: "Broken boxes", textAR: "صناديق مكسورة", textFR: "Boîtes cassées", isCorrect: false },
        { textEN: "A hidden art studio preserved for decades", textAR: "استوديو فن مخفي محفوظ لعقود", textFR: "Un studio d'art caché préservé pendant des décennies", isCorrect: true },
        { textEN: "Old books", textAR: "كتب قديمة", textFR: "Vieux livres", isCorrect: false },
      ],
      1,
      25,
    );

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📊 Summary of seeded data:");
    console.log("   ✓ 1 Age Group (6-7 years) - Translated to EN, AR, FR");
    console.log("   ✓ 2 Themes (Adventure, Mystery) - Translated to EN, AR, FR");
    console.log("   ✓ 2 Roadmaps - Translated to EN, AR, FR");
    console.log("   ✓ 4 Worlds - Translated to EN, AR, FR");
    console.log("   ✓ 11 Stories - All with EN, AR, FR translations");
    console.log("   ✓ 88 Chapters (11 stories × 8 chapters) - Full multilingual content");
    console.log("   ✓ 24 Comprehensive Challenges - With multilingual questions, hints, and answers");
    console.log("   ✓ 10 Levels with 10 Badges - All translated to EN, AR, FR");
    console.log("\n🎯 Challenge breakdown:");
    console.log("   • The Lost Map: 3 challenges");
    console.log("   • River Crossing: 3 challenges");
    console.log("   • The Hidden Cave: 2 challenges");
    console.log("   • The Mountain Climb: 2 challenges");
    console.log("   • The Mirage: 2 challenges");
    console.log("   • The Oasis: 2 challenges");
    console.log("   • The Sandstorm: 2 challenges");
    console.log("   • The Disappearance: 2 challenges");
    console.log("   • Following Clues: 2 challenges");
    console.log("   • The Red Herring: 2 challenges");
    console.log("   • The Old House: 2 challenges");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
