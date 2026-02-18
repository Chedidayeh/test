import { NextResponse } from "next/server";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:3001";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic validation
    const { email, password, name } = body || {};
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Forward to gateway which proxies to Auth Service
    const res = await fetch(`${GATEWAY_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    console.log("/api/auth/register response:", { res });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("/api/auth/register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
