type RestError = {
  message?: string;
  code?: string;
  details?: string;
};

function cleanEnv(value: string | undefined) {
  return (value || "").trim().replace(/^['"]|['"]$/g, "");
}

function restConfig() {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them in Vercel → Settings → Environment Variables, then redeploy.",
    );
  }

  return { url: url.replace(/\/$/, ""), key };
}

function throwDbError(error: RestError | string, status: number): never {
  const message = typeof error === "string" ? error : error.message || "";
  const code = typeof error === "string" ? "" : error.code || "";
  const missingTable =
    status === 404 ||
    code === "PGRST205" ||
    code === "42P01" ||
    /could not find the table/i.test(message);

  if (missingTable) {
    throw new Error(
      "Database tables are missing. Open supabase/schema.sql, paste it into the Supabase SQL editor, and run it.",
    );
  }

  if (/column .* does not exist/i.test(message)) {
    throw new Error(
      "Auth columns are missing. Open supabase/schema-auth.sql, paste it into the Supabase SQL editor, and run it.",
    );
  }

  throw new Error(message || `Database request failed (${status}).`);
}

function supabaseUrl() {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Add it in Vercel → Settings → Environment Variables, then redeploy.",
    );
  }
  return url.replace(/\/$/, "");
}

function throwReachError(err: unknown): never {
  const cause =
    err instanceof Error && err.cause instanceof Error
      ? err.cause.message
      : err instanceof Error
        ? err.message
        : "network error";
  throw new Error(
    `Cannot reach Supabase (${cause}). Check NEXT_PUBLIC_SUPABASE_URL in .env, make sure the project is not paused, then restart npm run dev.`,
  );
}

function anonKey() {
  const key = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Add it in Vercel → Settings → Environment Variables, then redeploy.",
    );
  }
  return key;
}

type AuthErrorBody = {
  error?: string;
  error_description?: string;
  msg?: string;
  message?: string;
};

export async function supabaseAuth<T>(
  path: string,
  init?: RequestInit,
  opts?: { admin?: boolean; accessToken?: string },
): Promise<T> {
  const url = supabaseUrl();
  const key = opts?.admin ? restConfig().key : anonKey();
  let response: Response;
  try {
    response = await fetch(`${url}/auth/v1${path}`, {
      ...init,
      headers: {
        apikey: key,
        Authorization: opts?.accessToken
          ? `Bearer ${opts.accessToken}`
          : `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });
  } catch (err) {
    throwReachError(err);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const err = (body || {}) as AuthErrorBody;
    throw new Error(
      err.error_description || err.msg || err.message || err.error || "Auth request failed.",
    );
  }

  return (body ?? {}) as T;
}

export async function supabaseRest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const { url, key } = restConfig();
  let response: Response;
  try {
    response = await fetch(`${url}/rest/v1${path}`, {
      ...init,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation",
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });
  } catch (err) {
    throwReachError(err);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throwDbError((body as RestError) || {}, response.status);
  }

  return (body ?? []) as T;
}
