type RestError = {
  message?: string;
  code?: string;
  details?: string;
};

function restConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  return url.replace(/\/$/, "");
}

function anonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY.");
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
  const response = await fetch(`${url}/auth/v1${path}`, {
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
  const response = await fetch(`${url}/rest/v1${path}`, {
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

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throwDbError((body as RestError) || {}, response.status);
  }

  return (body ?? []) as T;
}
