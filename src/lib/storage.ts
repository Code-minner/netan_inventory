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

const BUCKET = "client-uploads";

export async function uploadClientFile(
  folder: string,
  fileName: string,
  bytes: ArrayBuffer,
  contentType: string,
) {
  const { url, key } = storageConfig();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const path = `${folder}/${Date.now()}-${safeName}`;

  const response = await fetch(
    `${url}/storage/v1/object/${BUCKET}/${path}`,
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
    throw new Error(
      body || `Could not upload file (${response.status}).`,
    );
  }

  return `${url}/storage/v1/object/public/${BUCKET}/${path}`;
}
