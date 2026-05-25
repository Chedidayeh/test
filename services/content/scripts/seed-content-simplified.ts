/**
 * Database Seed Script for Content Service (Simplified - English Only)
 * Populates the database with test data for development and testing
 * 
 * Structure:
 * - 1 Age Group (6-7 years)
 * - 2 Themes (Adventure, Mystery)
 * - 2 Roadmaps
 * - 2 Worlds per Roadmap (4 total)
 * - 4 Stories per World (16 total)
 * - 8 Chapters per Story
 * - Challenges per Story
 * - 10 Levels with Badges
 *
 * Run with: npx ts-node scripts/seed-content-simplified.ts
 * Or: npm run seed
 */

import { PrismaClient, ChallengeType, LanguageCode, ReadingLevel } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================
// STORY CONTENT DATA (ENGLISH ONLY)
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
    7: "As you make your way back through the darkness toward the cave entrance, with torchlight dancing on the ancient walls, you feel transformed. You now understand why people traveled so far and worked so hard to create these masterpieces in the darkness. These paintings were never meant to be seen by many. They were created from the heart, for the heart—a conversation between the artist and the eternal. You carry this understanding with you as you step back into the sunlight, forever changed by your encounter with the ancient ones.",
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
    3: "You find a large rock formation to hide behind and wedge yourself into a small cave opening. Sand batters you relentlessly, but the rock shields you from the worst of it. Your heart pounds like a drum. The sound is deafening. The wind tries to blow you out of your shelter. Your hands grip to the rocks with all their strength. You won't let go. You won't give up. You'll hold on to this shelter and survive. Around you, the storm rages on, powerful and uncaring, a force of nature that dwarfs human strength.",
    4: "Hours pass. Or is it days? Time becomes meaningless in the darkness of the storm. Your throat is dry from sand. Your muscles burn from tension. The storm continues without pause or mercy. You wonder if it will ever end, if this is just how the world is now—endless storm, endless sand, endless noise. But then you remember something you once read: all storms pass eventually. They always do. Even the most powerful storms eventually run out of energy. Knowing this helps. You close your eyes and wait, trying to stay calm, trying to breathe slowly.",
    5: "Your supplies are running lower. You've drunk most of your water, and you need to be careful about what's left. The sand dust makes everything harder. You must stay calm and think clearly, because panic wastes energy and consumes water. You count your supplies mentally. You have enough to last, as long as the storm doesn't continue for more than a few more days. But you push away the fear that it might. Fear is the enemy now. Calm thinking is your ally. You breathe slowly and wait.",
    6: "Then, gradually—so gradually you almost don't notice—the wind begins to weaken. The sound, which has been a constant roar, begins to diminish. The sand, which poured down like rain, begins to ease. You can see slightly farther now—maybe ten feet instead of three. Your heart begins to hope. The storm is finally passing! Almost imperceptibly, it continues to diminish until finally, after what feels like an eternity, the wind dies to a breeze. The air clears. The sand settles. The storm is gone. You're alive!",
    7: "As the sun breaks through the clearing dust and takes on a golden hue again, you emerge from your shelter and look at the transformed landscape. Sand dunes that didn't exist yesterday have appeared. Landmarks you recognized are buried. But you're alive. You survived something that would have destroyed many people. You realize that surviving this storm has made you stronger, more confident, more resilient. You understand now that you're capable of enduring hardship. That knowledge—that you can survive even the most terrifying challenges—is something no storm can take away from you.",
  },
  "The Disappearance": {
    0: "Your best friend Maya is absolutely heartbroken. Her most favorite possession in the entire world, a beloved doll named Rosie with a porcelain face and golden hair, has vanished without a trace. Maya cries and cries, and you hate seeing her so sad. 'Don't worry,' you promise her, putting your arm around her shoulders. 'I will find Rosie. I promise you. I won't stop searching until I bring her home.'",
    1: "You begin an investigation, searching Maya's room carefully and methodically. Under the bed, hidden in the dust, you find a clue—a small button that definitely doesn't match Rosie's dress. The button is blue with white stripes, and Rosie wears a pink dress. How did it get there? Who does it belong to? You pocket the button carefully. It's the first real clue in the mystery.",
    2: "Following the button clue, you investigate Maya's neighbors. You notice that the neighbor's young son, Tommy, is wearing a shirt with buttons that match the one you found. Your heart starts racing. Is it Tommy? But wait—you need to be thorough. You decide to observe more carefully before accusing anyone.",
    3: "You watch Tommy play in his backyard and notice something interesting. He's playing with action figures in an elaborate setup, but you also notice a collection of other toys hidden in a box near the shed. Could Rosie be there? You need to investigate further but in a careful way that doesn't upset anyone.",
    4: "You talk to Tommy's mother and learn that Tommy has been very lonely since his family moved to the neighborhood. He hasn't made many friends yet. She mentions that he's been acting strangely lately, sneaking around and being secretive. You begin to piece together what might have happened.",
    5: "You discover that Tommy's collection includes not just Rosie, but many other toys. It seems Tommy has been collecting toys from around the neighborhood, creating an entire imaginary world with them. He wasn't stealing maliciously—he was lonely and using the toys to create companions for himself.",
    6: "You decide to approach Tommy with kindness rather than accusation. When you talk to him, he immediately breaks down and admits everything. He's so sorry. He didn't mean to hurt Maya; he just wanted friends to play with. You see the sadness and loneliness in his eyes, and your anger melts into compassion.",
    7: "You help Tommy return all the toys to their owners, including Rosie to Maya. But more importantly, you help Tommy make new friends and feel welcome in the neighborhood. Rosie becomes a bridge between Maya and Tommy, and they begin playing together regularly. What started as a mystery becomes a story about friendship and understanding.",
  },
  "Following Clues": {
    0: "A valuable painting has disappeared from the art gallery! The police are baffled, and you've been asked to help solve the mystery. You feel the weight of responsibility on your shoulders as you enter the gallery to begin your investigation.",
    1: "The security guard mentions seeing strange footprints near the storage room on the night of the theft. You examine them carefully. They're small—maybe from someone wearing unusual shoes or boots. What could this tell you about the thief?",
    2: "In the gallery's office, you find a torn piece of fabric caught on a broken window. The fabric is distinctive—blue with a white stripe pattern. You carefully bag it as evidence. This could be the break you need.",
    3: "You show the fabric to various people connected to the gallery. When you show it to the janitor, his face goes pale. 'That looks like... no, it can't be.' He seems to know something but won't say what. You make a mental note to investigate him further.",
    4: "You check the janitor's work schedule against the night of the theft. But wait—the schedule shows he wasn't working that night at all! He called in sick. But then why did he react so strangely to the fabric? There's something he's not telling you.",
    5: "You interview the gallery director more carefully. She mentions an assistant curator who was recently passed over for a promotion. This person was understandably disappointed and has been acting strange lately. Could this person be connected to the theft?",
    6: "You examine security camera footage more carefully. You spot a figure wearing a blue jacket with white stripes moving quickly through the gallery. The figure is deliberately avoiding eye contact with the cameras. Following the footage trail, you discover the painting was hidden in a false panel behind another artwork.",
    7: "You uncover the truth—the assistant curator, desperate for money due to personal problems, arranged the theft with an outside art dealer. But the fabric evidence led you directly to them. The painting is recovered, and the culprits are caught. Your careful observation and logical thinking solved the case.",
  },
  "The Red Herring": {
    0: "A mysterious theft has occurred at an old manor house. A priceless family jewel—a crown adorned with gems—has vanished. The family is devastated, and suspicion falls on the household members. Everyone seems to think the wealthy family's son is guilty.",
    1: "You interview the son first. He's nervous, won't make eye contact, and his answers seem evasive and contradictory. Every gesture screams guilt. 'He definitely did it,' everyone tells you. But something inside you says to dig deeper. There's something not quite right about this.",
    2: "You continue investigating other household members. You interview the trusted family accountant, an elderly man who has worked for the family for decades. He seems calm, honest, and helpful. Nobody suspects him. He's been part of the family for so long that he's almost invisible.",
    3: "You discover something surprising. The son was being blackmailed! Someone was threatening to reveal a secret about him—something embarrassing but not illegal. That person demanded he act suspiciously to throw the investigators off the scent. The son's guilty behavior was intentional misdirection!",
    4: "You dig deeper into the accountant's finances. What you discover shocks you. The accountant has serious money problems—gambling debts, failed investments. He desperately needs cash. The jewel would be worth millions on the black market. Finally, you've found the real culprit.",
    5: "You review the security footage more carefully. Although the accountant was in the house that night, you don't see him taking the jewel directly. But you do see him accessing the safe using codes only he would know. He moved with practiced efficiency—this wasn't an amateur.",
    6: "When you confront him with your evidence, the accountant finally breaks down and confesses. He planned the entire scheme, including blackmailing the son to create the perfect distraction. The obvious suspect was the red herring—the false clue meant to misdirect the investigation.",
    7: "The case teaches you a valuable lesson: the most obvious suspect isn't always the guilty party. The real criminal often hides in plain sight, carefully constructing an obvious alternative to throw investigators off the trail. In this case, the solution required looking past first impressions and digging deep into the details.",
  },
  "The Old House": {
    0: "You inherit an old house from a distant relative you never knew. The house is filled with dust, mystery, and secrets waiting to be uncovered. As you walk through the rooms, you wonder what stories these walls could tell.",
    1: "The walls are lined with old paintings covered in dust. Each painting seems to whisper stories about the family's past. Portraits of stern-faced ancestors stare down at you from the walls. You wonder who these people were and what their lives were like.",
    2: "While exploring the fireplace in the library, you notice a loose brick. Behind it, you discover an old leather journal, its pages yellowed with age. Your heart races as you carefully open it and begin to read.",
    3: "The journal belongs to your great-grandfather! It reveals that he was a secret artist. The family was strict and disapproved of art as a profession, so he hid his passion from everyone. The journal entries are filled with beautiful sketches and reflections on the joy of creating.",
    4: "Following clues from the journal, you discover a hidden attic studio. Inside, you find dozens of paintings and sketches, preserved exactly as they were left decades ago. The walls are covered with landscapes, portraits, and abstract works. Your great-grandfather's art is extraordinary.",
    5: "As you explore the studio, you find letters written but never sent. They're addressed to family members, expressing his love and his struggles. He wrote about the pain of hiding his true passion, but also about the joy his art brought him. These letters are deeply personal and touching.",
    6: "You discover through the journal and letters that your great-grandfather wanted his family to understand him, but he was too afraid to share his truth. He left his art as a legacy, hoping someday someone would find it and understand who he really was.",
    7: "You realize that discovering these secrets has connected you to your family's past in a profound way. You decide to share your great-grandfather's art with the world—organizing an exhibition of his work. Through his paintings, his spirit lives on, and his family finally understands the artist he always was. You've brought his hidden dream into the light.",
  },
};

// ============================================
// TRANSLATIONS DATA (ENGLISH ONLY)
// ============================================

const translations = {
  ageGroups: {
    "6-7years": {
      title: "6-7 years",
    },
    "8-9years": {
      title: "8-9 years",
    },
  },
  themes: {
    Adventure: {
      name: "Adventure",
      description: "Exciting journeys and explorations",
    },
    Mystery: {
      name: "Mystery",
      description: "Puzzles and hidden secrets to discover",
    },
  },
  roadmaps: {
    "Adventure Path": {
      title: "Adventure Path",
    },
    "Mystery Quest": {
      title: "Mystery Quest",
    },
  },
  worlds: {
    "Forest Quest": {
      name: "Forest Quest",
      description: "Begin your adventure in an enchanted forest",
    },
    "Desert Journey": {
      name: "Desert Journey",
      description: "Continue your adventure in a vast desert",
    },
    "The Missing Toy": {
      name: "The Missing Toy",
      description: "Help solve the mystery of the missing toy",
    },
    "Secret of the Old House": {
      name: "Secret of the Old House",
      description: "Uncover the secrets hidden in the old house",
    },
  },
  stories: {
    "The Lost Map": {
      title: "The Lost Map",
      description: "A mysterious map leads to ancient treasure",
    },
    "River Crossing": {
      title: "River Crossing",
      description: "Navigate dangerous waters to reach a hidden village",
    },
    "The Hidden Cave": {
      title: "The Hidden Cave",
      description: "Discover ancient paintings in a legendary cave",
    },
    "The Mountain Climb": {
      title: "The Mountain Climb",
      description: "Reach the summit of the highest peak",
    },
    "The Mirage": {
      title: "The Mirage",
      description: "Find truth in a world of illusions in the desert",
    },
    "The Oasis": {
      title: "The Oasis",
      description: "Search for the legendary eternal oasis",
    },
    "The Sandstorm": {
      title: "The Sandstorm",
      description: "Survive the ultimate test of the desert",
    },
    "The Disappearance": {
      title: "The Disappearance",
      description: "Maya's favorite doll vanishes mysteriously",
    },
    "Following Clues": {
      title: "Following Clues",
      description: "Help solve an art gallery mystery",
    },
    "The Red Herring": {
      title: "The Red Herring",
      description: "Discover the truth behind false clues",
    },
    "The Old House": {
      title: "The Old House",
      description: "Explore secrets hidden for generations",
    },
  },
  chapters: {
    "The Beginning": "The Beginning",
    "First Steps": "First Steps",
    "The Discovery": "The Discovery",
    "The Challenge": "The Challenge",
    "Rising Tension": "Rising Tension",
    "The Twist": "The Twist",
    "The Climax": "The Climax",
    "The Resolution": "The Resolution",
  },
  badges: {
    "Story Starter": {
      name: "Story Starter",
      description: "Your first step into the world of reading",
    },
    "Story Explorer": {
      name: "Story Explorer",
      description: "You've explored multiple stories",
    },
    "Story Enthusiast": {
      name: "Story Enthusiast",
      description: "Stories are becoming your passion",
    },
    "Reading Ranger": {
      name: "Reading Ranger",
      description: "You're mastering the art of reading",
    },
    "Adventure Lover": {
      name: "Adventure Lover",
      description: "You love exciting journeys",
    },
    "World Discoverer": {
      name: "World Discoverer",
      description: "You've discovered many worlds",
    },
    "Challenge Master": {
      name: "Challenge Master",
      description: "You excel at overcoming challenges",
    },
    "Story Sage": {
      name: "Story Sage",
      description: "You have deep wisdom about stories",
    },
    "Reading Champion": {
      name: "Reading Champion",
      description: "You're a champion of reading",
    },
    "Master Reader": {
      name: "Master Reader",
      description: "You've mastered the art of reading",
    },
  },
};

// ============================================
// HELPER FUNCTIONS (SIMPLIFIED - NO TRANSLATIONS)
// ============================================

async function createChapter(
  storyId: string,
  titleEN: string,
  contentEN: string,
  order: number,
  imageUrl?: string,
) {
  return prisma.chapter.create({
    data: {
      storyId,
      content: contentEN,
      order,
      imageUrl,
    },
  });
}

async function createChallenge(
  chapterId: string,
  type: ChallengeType,
  questionEN: string,
  hintsEN: string[],
  answers: Array<{
    textEN: string;
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
      answers: {
        create: answers.map((ans, idx) => ({
          text: ans.textEN,
          isCorrect: ans.isCorrect,
          order: idx + 1,
        })),
      },
    },
  });
}

// ============================================
// MAIN SEEDING FUNCTION
// ============================================

async function main() {
  console.log("🌱 Starting database seeding (English only)...");

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
            name: badgeData.name,
            description: badgeData.description,
            levelId: level.id,
          },
        });
      }
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
        description: "Exciting journeys and explorations",
      },
    });

    const mysteryTheme = await prisma.theme.create({
      data: {
        name: "Mystery",
        description: "Puzzles and hidden secrets to discover",
      },
    });

    // ============================================
    // 4. Create Roadmaps
    // ============================================
    console.log("🗺️  Creating roadmaps...");
    const adventureRoadmap = await prisma.roadmap.create({
      data: {
        ageGroupId: ageGroup.id,
        themeId: adventureTheme.id,
        title: "Adventure Path",
        readingLevel: ReadingLevel.BEGINNER,
        LearningObjectives: ["Build reading confidence", "Explore adventure stories"],
      },
    });

    const mysteryRoadmap = await prisma.roadmap.create({
      data: {
        ageGroupId: ageGroup.id,
        themeId: mysteryTheme.id,
        title: "Mystery Quest",
        readingLevel: ReadingLevel.BEGINNER,
        LearningObjectives: ["Develop critical thinking", "Solve mysteries"],
      },
    });

    // ============================================
    // 5. Create Worlds
    // ============================================
    console.log("🌍 Creating worlds...");

    // Adventure Roadmap Worlds
    const forestWorld = await prisma.world.create({
      data: {
        roadmapId: adventureRoadmap.id,
        name: "Forest Quest",
        description: "Begin your adventure in an enchanted forest",
        order: 1,
      },
    });

    const desertWorld = await prisma.world.create({
      data: {
        roadmapId: adventureRoadmap.id,
        name: "Desert Journey",
        description: "Continue your adventure in a vast desert",
        order: 2,
      },
    });

    // Mystery Roadmap Worlds
    const missingToyWorld = await prisma.world.create({
      data: {
        roadmapId: mysteryRoadmap.id,
        name: "The Missing Toy",
        description: "Help solve the mystery of the missing toy",
        order: 1,
      },
    });

    const oldHouseWorld = await prisma.world.create({
      data: {
        roadmapId: mysteryRoadmap.id,
        name: "Secret of the Old House",
        description: "Uncover the secrets hidden in the old house",
        order: 2,
      },
    });

    // ============================================
    // 6. Create Stories and Chapters
    // ============================================
    console.log("📖 Creating stories with chapters and challenges...");

    // ========== ADVENTURE STORIES ==========
    // Forest World Stories
    const lostMapStory = await prisma.story.create({
      data: {
        worldId: forestWorld.id,
        title: "The Lost Map",
        description: "A mysterious map leads to ancient treasure",
        difficulty: 2,
        order: 1,
      },
    });

    const riverCrossingStory = await prisma.story.create({
      data: {
        worldId: forestWorld.id,
        title: "River Crossing",
        description: "Navigate dangerous waters to reach a hidden village",
        difficulty: 3,
        order: 2,
      },
    });

    const hiddenCaveStory = await prisma.story.create({
      data: {
        worldId: forestWorld.id,
        title: "The Hidden Cave",
        description: "Discover ancient paintings in a legendary cave",
        difficulty: 2,
        order: 3,
      },
    });

    const mountainClimbStory = await prisma.story.create({
      data: {
        worldId: forestWorld.id,
        title: "The Mountain Climb",
        description: "Reach the summit of the highest peak",
        difficulty: 4,
        order: 4,
      },
    });

    // Desert World Stories
    const mirageStory = await prisma.story.create({
      data: {
        worldId: desertWorld.id,
        title: "The Mirage",
        description: "Find truth in a world of illusions in the desert",
        difficulty: 2,
        order: 1,
      },
    });

    const oasisStory = await prisma.story.create({
      data: {
        worldId: desertWorld.id,
        title: "The Oasis",
        description: "Search for the legendary eternal oasis",
        difficulty: 2,
        order: 2,
      },
    });

    const sandstormStory = await prisma.story.create({
      data: {
        worldId: desertWorld.id,
        title: "The Sandstorm",
        description: "Survive the ultimate test of the desert",
        difficulty: 3,
        order: 3,
      },
    });

    // ========== MYSTERY STORIES ==========
    // Missing Toy World Stories
    const disappearanceStory = await prisma.story.create({
      data: {
        worldId: missingToyWorld.id,
        title: "The Disappearance",
        description: "Maya's favorite doll vanishes mysteriously",
        difficulty: 1,
        order: 1,
      },
    });

    const followingCluesStory = await prisma.story.create({
      data: {
        worldId: missingToyWorld.id,
        title: "Following Clues",
        description: "Help solve an art gallery mystery",
        difficulty: 2,
        order: 2,
      },
    });

    // Old House World Stories
    const redHerringStory = await prisma.story.create({
      data: {
        worldId: oldHouseWorld.id,
        title: "The Red Herring",
        description: "Discover the truth behind false clues",
        difficulty: 3,
        order: 1,
      },
    });

    const oldHouseStory = await prisma.story.create({
      data: {
        worldId: oldHouseWorld.id,
        title: "The Old House",
        description: "Explore secrets hidden for generations",
        difficulty: 2,
        order: 2,
      },
    });

    // Create chapters for all stories
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

    // Helper to create chapters for a story
    const createStoryChapters = async (
      story: any,
      storyKey: string,
    ) => {
      const chapters = [];
      for (let i = 0; i < 8; i++) {
        const chapter = await createChapter(
          story.id,
          chapterTitles[i],
          (storyContent as any)[storyKey][i] || "",
          i + 1,
        );
        chapters.push(chapter);
      }
      return chapters;
    };

    // Create chapters for adventure stories
    const lostMapChapters = await createStoryChapters(lostMapStory, "The Lost Map");
    const riverCrossingChapters = await createStoryChapters(riverCrossingStory, "River Crossing");
    const hiddenCaveChapters = await createStoryChapters(hiddenCaveStory, "The Hidden Cave");
    const mountainClimbChapters = await createStoryChapters(mountainClimbStory, "The Mountain Climb");
    const mirageChapters = await createStoryChapters(mirageStory, "The Mirage");
    const oasisChapters = await createStoryChapters(oasisStory, "The Oasis");
    const sandstormChapters = await createStoryChapters(sandstormStory, "The Sandstorm");

    // Create chapters for mystery stories
    const disappearanceChapters = await createStoryChapters(disappearanceStory, "The Disappearance");
    const followingCluesChapters = await createStoryChapters(followingCluesStory, "Following Clues");
    const redHerringChapters = await createStoryChapters(redHerringStory, "The Red Herring");
    const oldHouseChapters = await createStoryChapters(oldHouseStory, "The Old House");

    // ============================================
    // 7. Create Challenges
    // ============================================
    console.log("🎯 Creating challenges...");

    // ========== THE LOST MAP CHALLENGES ==========
    await createChallenge(
      lostMapChapters[1].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What does the grandmother give to you?",
      ["A mysterious journal", "An ancient map", "A magical ring"],
      [
        { textEN: "A golden necklace", isCorrect: false },
        { textEN: "An ancient leather journal bound with golden string", isCorrect: true },
        { textEN: "A treasure map", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      lostMapChapters[4].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What does the silver wolf do when you meet it?",
      ["It attacks you", "It bows and welcomes you", "It runs away"],
      [
        { textEN: "It chases you down the mountain", isCorrect: false },
        { textEN: "It lowers its head and bows respectfully", isCorrect: true },
        { textEN: "It roars at you", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      lostMapChapters[6].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What do you discover in the crystal chamber?",
      ["Gold and jewels", "The journal with family adventures", "Ancient weapons"],
      [
        { textEN: "Nothing important", isCorrect: false },
        { textEN: "A written record of family adventures and stories", isCorrect: true },
        { textEN: "A map to more treasure", isCorrect: false },
      ],
      1,
      25,
    );

    // ========== RIVER CROSSING CHALLENGES ==========
    await createChallenge(
      riverCrossingChapters[0].id,
      ChallengeType.MULTIPLE_CHOICE,
      "Why is the river dangerous?",
      ["Spring rains made the current very strong", "Monsters live there", "It's too wide"],
      [
        { textEN: "It's always dangerous", isCorrect: false },
        { textEN: "Spring rains have made the current stronger than ever", isCorrect: true },
        { textEN: "There's a dragon in it", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      riverCrossingChapters[2].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What does Captain Moss tell you about the crossing?",
      ["It will be easy", "Stay calm, move carefully, and trust yourself", "Turn back now"],
      [
        { textEN: "The river will help you", isCorrect: false },
        { textEN: "Stay calm, move carefully, and trust in your own balance", isCorrect: true },
        { textEN: "Just run across quickly", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      riverCrossingChapters[5].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What do you discover after crossing the river?",
      ["A hidden village appears", "More obstacles await", "You find treasure"],
      [
        { textEN: "Another river", isCorrect: false },
        { textEN: "A hidden village with colorful houses appears through the trees", isCorrect: true },
        { textEN: "A dead end", isCorrect: false },
      ],
      1,
      20,
    );

    // ========== THE HIDDEN CAVE CHALLENGES ==========
    await createChallenge(
      hiddenCaveChapters[1].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What covers the walls of the cave?",
      ["Gold and jewels", "Magnificent paintings", "Bones"],
      [
        { textEN: "Moss and algae", isCorrect: false },
        { textEN: "Hundreds of magnificent paintings created by ancient artists", isCorrect: true },
        { textEN: "Strange symbols", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      hiddenCaveChapters[4].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What do the handprints in the cave represent?",
      ["Names of ancient people", "Personal marks from people across thousands of years", "Ancient weapons"],
      [
        { textEN: "Messages from the future", isCorrect: false },
        { textEN: "Each handprint is a personal mark connecting us across thousands of years", isCorrect: true },
        { textEN: "Warnings to stay away", isCorrect: false },
      ],
      1,
      20,
    );

    // ========== THE MOUNTAIN CLIMB CHALLENGES ==========
    await createChallenge(
      mountainClimbChapters[2].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What happens to the forest as you climb higher?",
      ["It stays the same", "It grows thicker", "It becomes thinner and disappears"],
      [
        { textEN: "More trees appear", isCorrect: false },
        { textEN: "The forest grows thinner until only rocks and sparse grass remain", isCorrect: true },
        { textEN: "The forest moves with you", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      mountainClimbChapters[5].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What happens during your final climb?",
      ["The weather is perfect", "A terrible storm appears", "It becomes very hot"],
      [
        { textEN: "It remains sunny", isCorrect: false },
        { textEN: "Black clouds appear and a terrible storm with lightning and rain hits", isCorrect: true },
        { textEN: "Fog covers the mountain", isCorrect: false },
      ],
      1,
      20,
    );

    // ========== THE MIRAGE CHALLENGES ==========
    await createChallenge(
      mirageChapters[1].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What do you see on the horizon?",
      ["A city", "An oasis", "Mountains"],
      [
        { textEN: "Another desert", isCorrect: false },
        { textEN: "A beautiful city with gardens, water, and people", isCorrect: true },
        { textEN: "A forest", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      mirageChapters[3].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What do you discover about the city?",
      ["It's real", "It's a mirage—your hand passes right through", "It's far away"],
      [
        { textEN: "It's made of gold", isCorrect: false },
        { textEN: "It's a mirage—your hand passes right through it and there's nothing there", isCorrect: true },
        { textEN: "It's guarded by soldiers", isCorrect: false },
      ],
      1,
      20,
    );

    // ========== THE OASIS CHALLENGES ==========
    await createChallenge(
      oasisChapters[1].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What surrounds the oasis?",
      ["Desert", "Towering cliffs of red stone", "Mountains"],
      [
        { textEN: "More sand dunes", isCorrect: false },
        { textEN: "A hidden valley surrounded by towering cliffs of red stone", isCorrect: true },
        { textEN: "A forest", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      oasisChapters[3].id,
      ChallengeType.MULTIPLE_CHOICE,
      "Who lives in the oasis?",
      ["Nomads passing through", "A settlement of families protecting this sacred place", "Nobody"],
      [
        { textEN: "Soldiers guarding treasure", isCorrect: false },
        { textEN: "A settlement of perhaps fifty families who have lived here for generations", isCorrect: true },
        { textEN: "Mythical creatures", isCorrect: false },
      ],
      1,
      20,
    );

    // ========== THE SANDSTORM CHALLENGES ==========
    await createChallenge(
      sandstormChapters[0].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What is approaching on the horizon?",
      ["Rain clouds", "A massive sandstorm", "A dust devil"],
      [
        { textEN: "Clear skies", isCorrect: false },
        { textEN: "A wall of sand and wind approaching like a living creature", isCorrect: true },
        { textEN: "People coming to help", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      sandstormChapters[4].id,
      ChallengeType.MULTIPLE_CHOICE,
      "How do you keep going during the storm?",
      ["You give up", "You remember that all storms pass eventually", "You pray"],
      [
        { textEN: "You panic and run", isCorrect: false },
        { textEN: "You remember that all storms pass eventually and you stay calm", isCorrect: true },
        { textEN: "You sleep", isCorrect: false },
      ],
      1,
      20,
    );

    // ========== THE DISAPPEARANCE CHALLENGES ==========
    await createChallenge(
      disappearanceChapters[1].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What clue do you find under Maya's bed?",
      ["A note", "A button that doesn't match Rosie's dress", "A key"],
      [
        { textEN: "A toy car", isCorrect: false },
        { textEN: "A small button that doesn't match Rosie's pink dress", isCorrect: true },
        { textEN: "A drawing", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      disappearanceChapters[6].id,
      ChallengeType.MULTIPLE_CHOICE,
      "Why did Tommy take Rosie?",
      ["He was mean", "He was lonely and wanted a companion to play with", "He wanted to sell it"],
      [
        { textEN: "He disliked Maya", isCorrect: false },
        { textEN: "He was lonely and wanted friends to play with", isCorrect: true },
        { textEN: "He was a thief", isCorrect: false },
      ],
      1,
      20,
    );

    // ========== FOLLOWING CLUES CHALLENGES ==========
    await createChallenge(
      followingCluesChapters[1].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What does the security guard mention?",
      ["Missing paintings", "Strange footprints", "Broken cameras"],
      [
        { textEN: "A strange person", isCorrect: false },
        { textEN: "Strange footprints near storage", isCorrect: true },
        { textEN: "Missing money", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      followingCluesChapters[4].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What does the janitor's schedule reveal?",
      ["He was working", "He wasn't there that night", "He left early"],
      [
        { textEN: "He was guilty", isCorrect: false },
        { textEN: "He wasn't there that night", isCorrect: true },
        { textEN: "He worked late", isCorrect: false },
      ],
      1,
      20,
    );

    // ========== THE RED HERRING CHALLENGES ==========
    await createChallenge(
      redHerringChapters[0].id,
      ChallengeType.MULTIPLE_CHOICE,
      "Who does everyone suspect?",
      ["The butler", "The son", "The housekeeper"],
      [
        { textEN: "The housekeeper", isCorrect: false },
        { textEN: "The wealthy family's son", isCorrect: true },
        { textEN: "A servant", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      redHerringChapters[4].id,
      ChallengeType.MULTIPLE_CHOICE,
      "Who is the real criminal?",
      ["The son", "The accountant", "The mother"],
      [
        { textEN: "The son", isCorrect: false },
        { textEN: "The trusted accountant", isCorrect: true },
        { textEN: "A hired thief", isCorrect: false },
      ],
      1,
      25,
    );

    // ========== THE OLD HOUSE CHALLENGES ==========
    await createChallenge(
      oldHouseChapters[2].id,
      ChallengeType.MULTIPLE_CHOICE,
      "Where do you find the diary?",
      ["In the attic", "Behind a brick in the fireplace", "Under the floorboards"],
      [
        { textEN: "In a drawer", isCorrect: false },
        { textEN: "Hidden behind a loose brick in fireplace", isCorrect: true },
        { textEN: "On a shelf", isCorrect: false },
      ],
      1,
      20,
    );

    await createChallenge(
      oldHouseChapters[4].id,
      ChallengeType.MULTIPLE_CHOICE,
      "What do you discover in the attic?",
      ["Old furniture", "A hidden art studio", "Treasure"],
      [
        { textEN: "Broken boxes", isCorrect: false },
        { textEN: "A hidden art studio preserved for decades", isCorrect: true },
        { textEN: "Old books", isCorrect: false },
      ],
      1,
      25,
    );

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📊 Summary of seeded data:");
    console.log("   ✓ 1 Age Group (6-7 years)");
    console.log("   ✓ 2 Themes (Adventure, Mystery)");
    console.log("   ✓ 2 Roadmaps");
    console.log("   ✓ 4 Worlds");
    console.log("   ✓ 11 Stories");
    console.log("   ✓ 88 Chapters (11 stories × 8 chapters)");
    console.log("   ✓ 24 Challenges");
    console.log("   ✓ 10 Levels with 10 Badges");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
