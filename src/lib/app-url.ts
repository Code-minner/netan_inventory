function isLocalHost(value: string) {
  return /localhost|127\.0\.0\.1/i.test(value);
}

function env(name: string) {
  return (process.env[name] || "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\/$/, "");
}

function urlFromRequest(request?: Request) {
  if (!request) return "";

  const origin = (request.headers.get("origin") || "").trim().replace(/\/$/, "");
  if (origin.startsWith("http") && !isLocalHost(origin)) {
    return origin;
  }

  const host = (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""
  )
    .split(",")[0]
    .trim();
  if (!host || isLocalHost(host)) return "";

  const proto = (
    request.headers.get("x-forwarded-proto") || "https"
  )
    .split(",")[0]
    .trim();

  return `${proto}://${host}`;
}

export function getAppUrl(request?: Request) {
  const fromRequest = urlFromRequest(request);
  if (fromRequest) return fromRequest;

  const explicit = env("FRONTEND_URL") || env("NEXT_PUBLIC_FRONTEND_URL");
  if (explicit && !isLocalHost(explicit)) return explicit;

  const production = env("VERCEL_PROJECT_PRODUCTION_URL");
  if (production) {
    return production.startsWith("http")
      ? production
      : `https://${production}`;
  }

  const vercel = env("VERCEL_URL");
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, "")}`;
  }

  return explicit || "http://localhost:3000";
}
