"use server";

import { createChildProfile as createChildProfileAPI } from "@/src/lib/auth-service/server-api";
import { unstable_update } from "@/src/auth";
import { Session } from "next-auth";

export async function createChildProfileAction(payload: {
  session: Session | null;
  parentEmail: string;
  parentId: string;
  name: string;
  ageGroupId: string;
  themeIds: string[];
}) {
  try {
    const child = await createChildProfileAPI(payload);

    await unstable_update({
      user: {
        ...payload.session!.user,
        newUser: false,
      },
    });

    return {
      success: true,
      data: child,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create child profile";
    return {
      success: false,
      error: message,
    };
  }
}
