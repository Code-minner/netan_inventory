function cleanEnv(value: string | undefined) {
  return (value || "").trim().replace(/^['"]|['"]$/g, "");
}

function storageConfig() {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return { url: url.replace(/\/$/, ""), key };
}

export const CLIENT_UPLOADS_BUCKET = "client-uploads";

export function publicObjectUrl(path: string) {
  const { url } = storageConfig();
  return `${url}/storage/v1/object/public/${CLIENT_UPLOADS_BUCKET}/${path}`;
}

export function safeStorageFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "upload.jpg";
}

/** Create a short-lived signed URL so the browser can upload straight to Storage. */
export async function createSignedClientUpload(
  folder: string,
  fileName: string,
) {
  const { url, key } = storageConfig();
  const safeName = safeStorageFileName(fileName);
  const path = `${folder}/${Date.now()}-${safeName}`;

  const response = await fetch(
    `${url}/storage/v1/object/upload/sign/${CLIENT_UPLOADS_BUCKET}/${path}`,
    {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    },
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (body as { message?: string; error?: string }).message ||
      (body as { error?: string }).error ||
      "";
    if (/Bucket not found|not found/i.test(message) || response.status === 404) {
      throw new Error(
        "Upload storage is not set up. Run supabase/schema-form.sql in Supabase (creates the client-uploads bucket).",
      );
    }
    throw new Error(message || `Could not prepare upload (${response.status}).`);
  }

  const token = String((body as { token?: string }).token || "");
  const signedPath = String((body as { url?: string }).url || "");
  const signedUrl = signedPath.startsWith("http")
    ? signedPath
    : `${url}/storage/v1${signedPath.startsWith("/") ? "" : "/"}${signedPath}${
        token && !signedPath.includes("token=")
          ? `${signedPath.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
          : ""
      }`;

  return {
    path,
    signedUrl,
    publicUrl: `${url}/storage/v1/object/public/${CLIENT_UPLOADS_BUCKET}/${path}`,
  };
}

export async function uploadClientFile(
  folder: string,
  fileName: string,
  bytes: ArrayBuffer,
  contentType: string,
) {
  const { url, key } = storageConfig();
  const safeName = safeStorageFileName(fileName);
  const path = `${folder}/${Date.now()}-${safeName}`;

  const response = await fetch(
    `${url}/storage/v1/object/${CLIENT_UPLOADS_BUCKET}/${path}`,
    {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": contentType || "application/octet-stream",
        "x-upsert": "true",
      },
      body: bytes,
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (/Bucket not found|not found/i.test(body)) {
      throw new Error(
        "Upload storage is not set up. Run supabase/schema-form.sql in Supabase (creates the client-uploads bucket).",
      );
    }
    throw new Error(body || `Could not upload file (${response.status}).`);
  }

  return publicObjectUrl(path);
}

export function isAllowedClientUploadUrl(value: string) {
  try {
    const { url } = storageConfig();
    const parsed = new URL(value);
    const expected = new URL(url);
    return (
      parsed.origin === expected.origin &&
      parsed.pathname.includes(
        `/storage/v1/object/public/${CLIENT_UPLOADS_BUCKET}/`,
      )
    );
  } catch {
    return false;
  }
}
