import { NextResponse } from "next/server";
import { handleRouteError, requireSuperadmin } from "@/src/lib/auth";
import { createSignedClientUpload } from "@/src/lib/storage";

export async function POST(request: Request) {
  try {
    await requireSuperadmin();
    const body = await request.json();
    const kind = String(body.kind || "branding");
    const fileName = String(body.fileName || "logo.png");
    const contentType = String(body.contentType || "image/png");

    if (
      !["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/x-icon", "image/svg+xml"].includes(
        contentType,
      )
    ) {
      return NextResponse.json(
        { error: "Upload must be an image file." },
        { status: 400 },
      );
    }

    const signed = await createSignedClientUpload(
      `branding/${kind}`,
      fileName,
    );

    return NextResponse.json({
      signedUrl: signed.signedUrl,
      publicUrl: signed.publicUrl,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
