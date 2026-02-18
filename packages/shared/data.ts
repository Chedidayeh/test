// Runtime data arrays for use in UI components
export const AGE_GROUPS = ["6-8 years", "9-11 years", "12-14 years"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];


export const STORY_GENRES = [
	"adventure",
	"fantasy",
	"mystery",
	"science-fiction",
	"fairy-tales",
] as const;
export type StoryGenre = (typeof STORY_GENRES)[number];
