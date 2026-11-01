import { NextResponse } from "next/server";
import { handleRouteError, requireAdmin } from "@/src/lib/auth";
import { createSignedClientUpload } from "@/src/lib/storage";

export async function POST(request: Request) {
  try {
    const member = await requireAdmin();
    const body = await request.json();
    const fileName = String(body.fileName || "avatar.jpg");
    const contentType = String(body.contentType || "image/jpeg");

    if (
      !["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"].includes(
        contentType,
      )
    ) {
      return NextResponse.json(
        { error: "Avatar must be JPG, PNG, or GIF." },
        { status: 400 },
      );
    }

    const signed = await createSignedClientUpload(
      `avatars/${member.id}`,
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
