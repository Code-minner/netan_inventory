import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function makePassword() {
  return `Netan${Math.random().toString(36).slice(2, 8)}9A`;
}

loadEnv();

const email = (process.argv[2] || "boluwatifeagbo@gmail.com").trim().toLowerCase();
const name = process.argv[3] || "Boluwatife Agbo";
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Accept: "application/json",
  Prefer: "return=representation",
};

async function auth(path, init) {
  const response = await fetch(`${url}/auth/v1${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      body.error_description || body.msg || body.message || body.error || response.statusText;
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

async function rest(path, init) {
  const response = await fetch(`${url}/rest/v1${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers || {}) },
  });
  const body = await response.json().catch(() => []);
  if (!response.ok) {
    const message = body.message || body.error || response.statusText;
    throw new Error(
      /column .* does not exist/i.test(message)
        ? "Auth columns missing. Run supabase/schema-auth.sql in the SQL editor first."
        : /could not find the table/i.test(message)
          ? "Tables missing. Run supabase/schema.sql in the SQL editor first."
          : message,
    );
  }
  return body;
}

async function findAuthUser() {
  const data = await auth("/admin/users?page=1&per_page=200", { method: "GET" });
  const users = data.users || data || [];
  return users.find((user) => (user.email || "").toLowerCase() === email) || null;
}

const password = makePassword();
const now = new Date();
const joined = now.toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const initials = name
  .split(/\s+/)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase() || "")
  .join("");

let user;
try {
  user = await auth("/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: "Superadmin" },
    }),
  });
} catch (err) {
  if (!/already|registered|exists/i.test(err.message)) throw err;
  user = await findAuthUser();
  if (!user?.id) throw new Error("Auth user already exists, but could not look it up.");
  await auth(`/admin/users/${user.id}`, {
    method: "PUT",
    body: JSON.stringify({ password, email_confirm: true }),
  });
}

const existing = await rest(
  `/team?email=eq.${encodeURIComponent(email)}&select=*`,
  { method: "GET" },
);

const payload = {
  name,
  initials: initials || "BA",
  email,
  role: "Superadmin",
  joined,
  status: "Active",
  auth_user_id: user.id,
  invite_token: null,
  invite_expires_at: null,
  notify_client: true,
  notify_payment: true,
  notify_service: true,
  notify_team: true,
  notify_system: false,
};

if (existing[0]) {
  await rest(`/team?id=eq.${encodeURIComponent(existing[0].id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
} else {
  await rest("/team", {
    method: "POST",
    body: JSON.stringify({
      id: `${Date.now().toString(36)}-admin`,
      created_at: now.toISOString(),
      ...payload,
    }),
  });
}

console.log("Superadmin is in the database.");
console.log(`Email: ${email}`);
console.log(`Temp password: ${password}`);
console.log("Sign in at /login, then invite the rest of the team.");
console.log("Change this password in Settings after you sign in.");
