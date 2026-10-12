import { NextResponse } from "next/server";
import {
  AuthError,
  handleRouteError,
  validatePassword,
} from "@/src/lib/auth";
import { supabaseAuth } from "@/src/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body.password || "");
    const accessToken = String(body.accessToken || "");
    if (!accessToken) {
      throw new AuthError(400, "This recovery link is missing or has expired.");
    }
    validatePassword(password);

    await supabaseAuth(
      "/user",
      {
        method: "PUT",
        body: JSON.stringify({ password }),
      },
      { accessToken },
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
