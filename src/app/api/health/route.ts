import { NextResponse } from "next/server";

function cleanEnv(value: string | undefined) {
  return (value || "").trim().replace(/^['"]|['"]$/g, "");
}

export async function GET() {
  const supabaseUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  let supabaseHost = "";
  try {
    supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : "";
  } catch {
    supabaseHost = "invalid-url";
  }

  let reachable = false;
  let reachError = "";
  if (supabaseUrl) {
    try {
      const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/health`, {
        headers: { apikey: cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) },
        cache: "no-store",
      });
      reachable = response.ok;
      if (!response.ok) reachError = `HTTP ${response.status}`;
    } catch (err) {
      reachable = false;
      reachError =
        err instanceof Error && err.cause instanceof Error
          ? err.cause.message
          : err instanceof Error
            ? err.message
            : "fetch failed";
    }
  }

  return NextResponse.json({
    ok: Boolean(supabaseUrl) && reachable,
    supabaseHost,
    hasAnonKey: Boolean(cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)),
    hasServiceKey: Boolean(cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)),
    frontendUrl: process.env.FRONTEND_URL || "",
    reachable,
    reachError: reachError || undefined,
  });
}
