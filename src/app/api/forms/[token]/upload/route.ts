import { NextResponse } from "next/server";
import { createSignedClientUpload } from "@/src/lib/storage";
import { getClientByToken } from "@/src/lib/store";

type Params = { params: Promise<{ token: string }> };

const ALLOWED_IMAGE = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

export async function POST(request: Request, { params }: Params) {
  try {
    const { token } = await params;
    const client = await getClientByToken(token);

    if (!client) {
      return NextResponse.json(
        { error: "Form link is invalid." },
        { status: 404 },
      );
    }

    if (client.formStatus === "completed") {
      return NextResponse.json(
        { error: "This form has already been submitted." },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const fileName = String(body.fileName || "upload.jpg").trim();
    const contentType = String(body.contentType || "").trim().toLowerCase();
    const kind = String(body.kind || "file").trim();

    if (contentType && !ALLOWED_IMAGE.has(contentType)) {
      return NextResponse.json(
        { error: "Uploads must be PNG or JPG." },
        { status: 400 },
      );
    }

    const folder = `forms/${client.id}/${kind === "proof" ? "proof" : "docs"}`;
    const signed = await createSignedClientUpload(folder, fileName);

    return NextResponse.json({
      signedUrl: signed.signedUrl,
      publicUrl: signed.publicUrl,
      path: signed.path,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Could not prepare upload",
      },
      { status: 500 },
    );
  }
}
