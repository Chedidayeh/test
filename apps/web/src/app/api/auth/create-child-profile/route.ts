import { NextResponse } from "next/server";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:3001";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic validation
    const { parentEmail, name, ageGroup, favoriteGenres } = body || {};
    if (!parentEmail || !name || !ageGroup) {
      return NextResponse.json(
        { error: "Missing required fields: parentEmail, name, ageGroup" },
        { status: 400 }
      );
    }

    // Forward to gateway which proxies to Auth Service
    const res = await fetch(`${GATEWAY_URL}/api/auth/create-child-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentEmail,
        name,
        ageGroup,
        favoriteGenres: favoriteGenres,
      }),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("/api/auth/create-child-profile error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
