import { NextResponse } from "next/server";
import {
  getAppSettings,
  updateBankSettings,
  updateBrandingSettings,
  updateServicesSettings,
} from "@/src/lib/app-settings";
import {
  AuthError,
  handleRouteError,
  requireAdmin,
  requireSuperadmin,
} from "@/src/lib/auth";
import type { CatalogService } from "@/src/lib/services-catalog";

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getAppSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireSuperadmin();
    const body = await request.json();
    const section = String(body.section || "").trim();

    if (section === "branding") {
      const branding = await updateBrandingSettings({
        navLogoUrl: body.navLogoUrl,
        dashboardLogoUrl: body.dashboardLogoUrl,
        faviconUrl: body.faviconUrl,
      });
      return NextResponse.json({ branding });
    }

    if (section === "bank") {
      const bankName = String(body.bankName || "").trim();
      const accountName = String(body.accountName || "").trim();
      const accountNumber = String(body.accountNumber || "").trim();
      if (!bankName || !accountName || !accountNumber) {
        throw new AuthError(400, "Bank name, account name, and number are required.");
      }
      const bank = await updateBankSettings({
        paymentMethod: String(body.paymentMethod || "Bank Transfer").trim(),
        bankName,
        accountName,
        accountNumber,
      });
      return NextResponse.json({ bank });
    }

    if (section === "services") {
      const services = Array.isArray(body.services)
        ? (body.services as CatalogService[])
        : null;
      if (!services) {
        throw new AuthError(400, "Services list is required.");
      }
      const saved = await updateServicesSettings(services);
      return NextResponse.json({ services: saved });
    }

    throw new AuthError(400, "Unknown settings section.");
  } catch (err) {
    return handleRouteError(err);
  }
}
