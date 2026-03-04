import React from "react";
import LevelPage from "./LevelPage";
import { getLevels } from "@/src/lib/content-service/server-api";

export default async function page() {
  try {
    const levels = await getLevels();

    // Handle API response - adjust based on your API structure
    console.log("Fetched levels:", levels[0].badge);
    return <LevelPage levels={levels} />;
  } catch (error) {
    console.error("Error fetching levels:", error);
    return <LevelPage levels={[]} />;
  }
}
