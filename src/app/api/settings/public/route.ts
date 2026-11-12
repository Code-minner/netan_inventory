import { NextResponse } from "next/server";
import { getAppSettings } from "@/src/lib/app-settings";

export async function GET() {
  try {
    const settings = await getAppSettings();
    return NextResponse.json({
      branding: settings.branding,
      bank: settings.bank,
      services: settings.services,
    });
  } catch {
    return NextResponse.json({
      branding: {
        navLogoUrl: "/assets/logo.png",
        dashboardLogoUrl: "/assets/logo.png",
        faviconUrl: "/assets/logo.png",
      },
    });
  }
}
