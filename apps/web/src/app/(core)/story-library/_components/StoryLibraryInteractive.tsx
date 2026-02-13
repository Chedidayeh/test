/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import FeaturedCarousel from "./FeaturedCarousel";
import StoryCard from "./StoryCard";

interface Story {
  id: number;
  title: string;
  coverImage: string;
  coverAlt: string;
  category: string;
  readingLevel: string;
  readingTime: number;
  stars: number;
  isLocked: boolean;
  isCompleted: boolean;
  progress: number;
  isFavorite: boolean;
}

interface FeaturedStory {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  coverAlt: string;
  badge: string;
  badgeColor: string;
}

interface Filters {
  categories: string[];
  levels: string[];
  status: string[];
  sortBy: string;
}

const StoryLibraryInteractive = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    levels: [],
    status: [],
    sortBy: "newest",
  });
  const [favorites, setFavorites] = useState<number[]>([1, 3, 7]);

  const featuredStories: FeaturedStory[] = [
    {
      id: 1,
      title: "The Magical Forest Adventure",
      description:
        "Join Luna on an enchanting journey through a forest where trees whisper secrets and animals talk. Discover hidden treasures and solve magical riddles!",
      coverImage:
        "https://images.unsplash.com/photo-1724426712039-698b73a1f4fc",
      coverAlt:
        "Mystical forest with glowing lights and magical atmosphere at twilight",
      badge: "New Release",
      badgeColor: "new",
    },
    {
      id: 2,
      title: "Space Explorers: Mission Mars",
      description:
        "Blast off with Captain Alex and the crew on an exciting mission to Mars. Learn about planets, stars, and the wonders of space exploration!",
      coverImage:
        "https://images.unsplash.com/photo-1692394434977-f3f83967b3ce",
      coverAlt:
        "Colorful view of Mars planet with stars and spacecraft in deep space",
      badge: "Recommended",
      badgeColor: "recommended",
    },
    {
      id: 3,
      title: "The Mystery of the Lost Treasure",
      description:
        "Help Detective Sam solve the mystery of the missing treasure chest. Follow clues, crack codes, and uncover the truth in this thrilling adventure!",
      coverImage:
        "https://img.rocket.new/generatedImages/rocket_gen_img_1dea28c5c-1768173912226.png",
      coverAlt:
        "Old treasure chest with golden coins and mysterious map on wooden table",
      badge: "Most Popular",
      badgeColor: "popular",
    },
  ];

  const allStories: Story[] = [
    {
      id: 1,
      title: "The Magical Forest Adventure",
      coverImage:
        "https://images.unsplash.com/photo-1724426712039-698b73a1f4fc",
      coverAlt:
        "Mystical forest with glowing lights and magical atmosphere at twilight",
      category: "Fantasy",
      readingLevel: "Easy",
      readingTime: 8,
      stars: 15,
      isLocked: false,
      isCompleted: false,
      progress: 45,
      isFavorite: true,
    },
    {
      id: 2,
      title: "Space Explorers: Mission Mars",
      coverImage:
        "https://images.unsplash.com/photo-1692394434977-f3f83967b3ce",
      coverAlt:
        "Colorful view of Mars planet with stars and spacecraft in deep space",
      category: "Science",
      readingLevel: "Medium",
      readingTime: 12,
      stars: 20,
      isLocked: false,
      isCompleted: false,
      progress: 0,
      isFavorite: false,
    },
    {
      id: 3,
      title: "The Mystery of the Lost Treasure",
      coverImage:
        "https://img.rocket.new/generatedImages/rocket_gen_img_1dea28c5c-1768173912226.png",
      coverAlt:
        "Old treasure chest with golden coins and mysterious map on wooden table",
      category: "Mystery",
      readingLevel: "Medium",
      readingTime: 10,
      stars: 25,
      isLocked: false,
      isCompleted: true,
      progress: 100,
      isFavorite: true,
    },
    {
      id: 4,
      title: "Dinosaur Discovery",
      coverImage:
        "https://images.unsplash.com/photo-1652019294927-a83ae2b5c643",
      coverAlt:
        "Colorful dinosaur toys in prehistoric jungle setting with palm trees",
      category: "Animals",
      readingLevel: "Beginner",
      readingTime: 6,
      stars: 10,
      isLocked: false,
      isCompleted: false,
      progress: 0,
      isFavorite: false,
    },
    {
      id: 5,
      title: "The Brave Little Knight",
      coverImage:
        "https://images.unsplash.com/photo-1448071440788-6c17eabc7b0f",
      coverAlt:
        "Medieval castle with knight armor and sword on stone wall background",
      category: "Adventure",
      readingLevel: "Easy",
      readingTime: 9,
      stars: 18,
      isLocked: false,
      isCompleted: false,
      progress: 20,
      isFavorite: false,
    },
    {
      id: 6,
      title: "Ocean Wonders",
      coverImage:
        "https://img.rocket.new/generatedImages/rocket_gen_img_185a96452-1769546994760.png",
      coverAlt: "Underwater scene with colorful tropical fish and coral reef",
      category: "Animals",
      readingLevel: "Easy",
      readingTime: 7,
      stars: 12,
      isLocked: false,
      isCompleted: true,
      progress: 100,
      isFavorite: false,
    },
    {
      id: 7,
      title: "The Friendship Garden",
      coverImage:
        "https://img.rocket.new/generatedImages/rocket_gen_img_11f742156-1766914434463.png",
      coverAlt:
        "Beautiful garden with colorful flowers and children playing together",
      category: "Friendship",
      readingLevel: "Beginner",
      readingTime: 5,
      stars: 8,
      isLocked: false,
      isCompleted: false,
      progress: 60,
      isFavorite: true,
    },
    {
      id: 8,
      title: "Robot Rescue Mission",
      coverImage:
        "https://img.rocket.new/generatedImages/rocket_gen_img_136f02111-1767635184730.png",
      coverAlt:
        "Friendly robot with glowing eyes in futuristic laboratory setting",
      category: "Science",
      readingLevel: "Medium",
      readingTime: 11,
      stars: 22,
      isLocked: false,
      isCompleted: false,
      progress: 0,
      isFavorite: false,
    },
    {
      id: 9,
      title: "The Dragon's Secret",
      coverImage:
        "https://img.rocket.new/generatedImages/rocket_gen_img_17e36c3a4-1767094701956.png",
      coverAlt: "Majestic dragon flying over mountain peaks with sunset sky",
      category: "Fantasy",
      readingLevel: "Advanced",
      readingTime: 15,
      stars: 0,
      isLocked: true,
      isCompleted: false,
      progress: 0,
      isFavorite: false,
    },
    {
      id: 10,
      title: "Time Travel Tales",
      coverImage:
        "https://img.rocket.new/generatedImages/rocket_gen_img_19a0b4c5c-1764640981841.png",
      coverAlt:
        "Vintage clock with swirling time portal and historical artifacts",
      category: "Adventure",
      readingLevel: "Advanced",
      readingTime: 14,
      stars: 0,
      isLocked: true,
      isCompleted: false,
      progress: 0,
      isFavorite: false,
    },
    {
      id: 11,
      title: "The Singing Birds",
      coverImage:
        "https://images.unsplash.com/photo-1666187685006-86f7b10c186f",
      coverAlt:
        "Colorful birds perched on tree branches singing in sunny forest",
      category: "Animals",
      readingLevel: "Beginner",
      readingTime: 5,
      stars: 7,
      isLocked: false,
      isCompleted: false,
      progress: 0,
      isFavorite: false,
    },
    {
      id: 12,
      title: "The Superhero School",
      coverImage:
        "https://img.rocket.new/generatedImages/rocket_gen_img_1df78dcf5-1767548995459.png",
      coverAlt:
        "Children in superhero costumes with capes flying in action poses",
      category: "Adventure",
      readingLevel: "Medium",
      readingTime: 10,
      stars: 16,
      isLocked: false,
      isCompleted: false,
      progress: 0,
      isFavorite: false,
    },
  ];

  const getFilteredStories = () => {
    let filtered = [...allStories];

    if (searchQuery) {
      filtered = filtered.filter(
        (story) =>
          story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          story.category.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter((story) =>
        filters.categories.includes(story.category),
      );
    }

    if (filters.levels.length > 0) {
      filtered = filtered.filter((story) =>
        filters.levels.includes(story.readingLevel),
      );
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter((story) => {
        if (
          filters.status.includes("Not Started") &&
          story.progress === 0 &&
          !story.isCompleted
        )
          return true;
        if (
          filters.status.includes("In Progress") &&
          story.progress > 0 &&
          !story.isCompleted
        )
          return true;
        if (filters.status.includes("Completed") && story.isCompleted)
          return true;
        return false;
      });
    }

    switch (filters.sortBy) {
      case "oldest":
        filtered.reverse();
        break;
      case "easy":
        filtered.sort((a, b) => {
          const levels = { Beginner: 1, Easy: 2, Medium: 3, Advanced: 4 };
          return (
            (levels[a.readingLevel as keyof typeof levels] || 0) -
            (levels[b.readingLevel as keyof typeof levels] || 0)
          );
        });
        break;
      case "hard":
        filtered.sort((a, b) => {
          const levels = { Beginner: 1, Easy: 2, Medium: 3, Advanced: 4 };
          return (
            (levels[b.readingLevel as keyof typeof levels] || 0) -
            (levels[a.readingLevel as keyof typeof levels] || 0)
          );
        });
        break;
      case "popular":
        filtered.sort((a, b) => b.stars - a.stars);
        break;
    }

    return filtered.map((story) => ({
      ...story,
      isFavorite: favorites.includes(story.id),
    }));
  };

  const handleStoryClick = (id: number) => {
    router.push("/story-reading-interface");
  };

  const handleFavoriteToggle = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const filteredStories = getFilteredStories();

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}

        {/* Featured Carousel */}
        <div className="mb-8">
          <FeaturedCarousel
            stories={featuredStories}
            onStoryClick={handleStoryClick}
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl text-foreground mb-1">
            Story Library
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing stories and start your reading adventure!
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <FilterPanel onFilterChange={handleFilterChange} />
          </div>

          {/* Stories Grid */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-2">
              <SearchBar onSearch={handleSearch} />
            </div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl text-foreground">
                All Stories ({filteredStories.length})
              </h2>
            </div>

            {filteredStories.length === 0 ? (
              <div className="text-center py-16">
                BookOpenIcon
                <h3 className="font-heading text-2xl text-foreground mb-2">
                  No stories found
                </h3>
                <p className="font-body text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onStoryClick={handleStoryClick}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StoryLibraryInteractive;
