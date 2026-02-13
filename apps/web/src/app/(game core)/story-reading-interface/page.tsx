import type { Metadata } from "next";
import StoryReadingInteractive from "./_components/StoryReadingInteractive";

export const metadata: Metadata = {
  title: "Story Reading - Readly",
  description:
    "Immerse yourself in interactive stories with text-to-speech, adjustable settings, and embedded riddles for an engaging learning experience.",
};

interface StoryPage {
  pageNumber: number;
  text: string;
  image: string;
  alt: string;
  hasRiddle: boolean;
}

export default function StoryReadingInterfacePage() {
  const mockStoryData = {
    id: "story-001",
    title: "The Magical Forest Adventure",
    pages: [
      {
        pageNumber: 1,
        text: "Once upon a time, in a magical forest filled with towering trees and sparkling streams, there lived a curious young fox named Felix. Felix loved to explore every corner of the forest, discovering new wonders each day. One sunny morning, Felix noticed something unusual, a golden acorn glowing beneath an ancient oak tree.",
        image: "https://images.unsplash.com/photo-1722995624194-36c85a1940e3",
        alt: "Enchanted forest with tall green trees, sunlight filtering through leaves, and a small stream flowing through mossy rocks",
        hasRiddle: false,
      },
      {
        pageNumber: 2,
        text: 'Felix approached the golden acorn carefully. As he touched it with his paw, the acorn began to glow even brighter, and a soft voice whispered, "Only the clever can unlock my secret." Felix tilted his head, wondering what this could mean. He looked around and noticed strange symbols carved into the tree bark.',
        image: "https://images.unsplash.com/photo-1503886299049-280d37f62583",
        alt: "Close-up of orange fox with bright eyes examining a glowing golden acorn near tree roots in dappled sunlight",
        hasRiddle: false,
      },
      {
        pageNumber: 3,
        text: 'The symbols seemed to form a pattern, but Felix couldn\'t quite understand them. He remembered his grandmother once telling him about ancient forest riddles that protected magical treasures. "This must be one of those riddles!" Felix thought excitedly. He sat down to think carefully about what the symbols might mean.',
        image:
          "https://img.rocket.new/generatedImages/rocket_gen_img_19607585e-1767720228688.png",
        alt: "Ancient tree bark with mysterious glowing symbols carved in circular patterns, surrounded by green moss and small mushrooms",
        hasRiddle: true,
      },
      {
        pageNumber: 4,
        text: 'After solving the riddle, the golden acorn split open to reveal a tiny glowing seed. The voice spoke again, "Plant this seed where the sun meets the moon, and watch magic bloom." Felix knew exactly where that was—the clearing where sunlight and moonlight both touched the ground at dawn and dusk.',
        image:
          "https://img.rocket.new/generatedImages/rocket_gen_img_1ae20458e-1770050196902.png",
        alt: "Small glowing magical seed floating above open golden acorn shell with sparkles of light radiating outward",
        hasRiddle: false,
      },
      {
        pageNumber: 5,
        text: "Felix carefully carried the seed to the special clearing. As the sun began to set and the first stars appeared, he dug a small hole and planted the seed. Immediately, a beautiful tree began to grow, its leaves shimmering with all the colors of the rainbow. Felix had discovered the legendary Rainbow Tree!",
        image:
          "https://img.rocket.new/generatedImages/rocket_gen_img_120d1897d-1766120839789.png",
        alt: "Magnificent tree with rainbow-colored leaves glowing in twilight, surrounded by fireflies and small forest animals gathering around",
        hasRiddle: false,
      },
      {
        pageNumber: 6,
        text: "The Rainbow Tree granted Felix a special gift—the ability to understand all the languages of the forest. From that day forward, Felix could talk to every creature, from the tiniest ant to the wisest owl. He used this gift to help all the animals in the forest, becoming a beloved friend to everyone.",
        image:
          "https://img.rocket.new/generatedImages/rocket_gen_img_1657cedc4-1766770889118.png",
        alt: "Happy orange fox surrounded by various forest animals including rabbits, birds, squirrels, and deer in a sunny meadow",
        hasRiddle: false,
      },
      {
        pageNumber: 7,
        text: "Years passed, and Felix grew wiser. He taught young animals about the importance of curiosity, kindness, and solving problems with patience. The Rainbow Tree continued to grow, its magical presence protecting the entire forest. And whenever someone needed help, they knew they could always find Felix beneath the Rainbow Tree.",
        image: "https://images.unsplash.com/photo-1620157327665-a0c835e9bbf8",
        alt: "Older wise fox sitting beneath large rainbow tree teaching group of young forest animals in golden afternoon light",
        hasRiddle: false,
      },
      {
        pageNumber: 8,
        text: 'One day, a young rabbit came to Felix with a problem. "Felix, I found another golden acorn, but I don\'t know what to do with it!" Felix smiled warmly and said, "Then your adventure is just beginning. Remember, be curious, be kind, and never give up when facing a challenge." And so, a new magical adventure began in the forest.',
        image: "https://images.unsplash.com/photo-1625397394832-5300364f7e39",
        alt: "Small brown rabbit holding glowing golden acorn while talking to friendly orange fox in forest clearing at sunset",
        hasRiddle: true,
      },
      {
        pageNumber: 9,
        text: "The young rabbit, inspired by Felix's words, set off on her own journey. She discovered that the forest was full of mysteries waiting to be solved, friends waiting to be made, and lessons waiting to be learned. Just like Felix before her, she would become a hero of her own story.",
        image: "https://images.unsplash.com/photo-1734536619579-7146e98dc701",
        alt: "Brave young rabbit hopping along forest path with golden acorn in paws, sunbeams lighting the way forward through trees",
        hasRiddle: false,
      },
      {
        pageNumber: 10,
        text: "And so, the magic of the forest continued to grow, passed down from one generation to the next. Every creature learned that with curiosity, courage, and kindness, they too could discover their own magical adventures. The end... or is it just the beginning?",
        image:
          "https://img.rocket.new/generatedImages/rocket_gen_img_120d1897d-1766120839789.png",
        alt: "Magical forest panorama with rainbow tree in center, various animals gathered peacefully, stars twinkling in twilight sky",
        hasRiddle: false,
      },
    ] as StoryPage[],
  };

  return (
    <>
      {" "}
      <StoryReadingInteractive storyData={mockStoryData} />;
    </>
  );
}
