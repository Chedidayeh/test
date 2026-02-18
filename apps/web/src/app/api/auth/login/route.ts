import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;

    const resp = await fetch(`${gatewayUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => null);

    if (!resp.ok) {
      return NextResponse.json(
        { valid: false, message: data?.error },
        { status: resp.status },
      );
    }

    return NextResponse.json({ valid: true, data }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { valid: false, message: "Server error" },
      { status: 500 },
    );
  }
}
