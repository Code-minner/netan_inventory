import {
  DEFAULT_BANK,
  DEFAULT_BRANDING,
  DEFAULT_SERVICES,
  type AppSettings,
  type BankSettings,
  type BrandingSettings,
} from "./app-settings-shared";
import type { CatalogService } from "./services-catalog";
import { createId } from "./store";
import { supabaseRest } from "./supabase";

export type {
  AppSettings,
  BankSettings,
  BrandingSettings,
} from "./app-settings-shared";
export {
  DEFAULT_BANK,
  DEFAULT_BRANDING,
  DEFAULT_SERVICES,
} from "./app-settings-shared";

type SettingsRow = {
  key: string;
  value: unknown;
  updated_at: string;
};

async function getSettingValue<T>(key: string, fallback: T): Promise<T> {
  try {
    const rows = await supabaseRest<SettingsRow[]>(
      `/app_settings?key=eq.${encodeURIComponent(key)}&select=*`,
    );
    if (!rows[0]?.value) return fallback;
    return rows[0].value as T;
  } catch {
    return fallback;
  }
}

async function setSettingValue(key: string, value: unknown) {
  await supabaseRest("/app_settings?on_conflict=key", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      key,
      value,
      updated_at: new Date().toISOString(),
    }),
  });
}

function normalizeBranding(value: Partial<BrandingSettings> | null | undefined) {
  return {
    navLogoUrl: String(value?.navLogoUrl || DEFAULT_BRANDING.navLogoUrl),
    dashboardLogoUrl: String(
      value?.dashboardLogoUrl || DEFAULT_BRANDING.dashboardLogoUrl,
    ),
    faviconUrl: String(value?.faviconUrl || DEFAULT_BRANDING.faviconUrl),
  };
}

function normalizeBank(value: Partial<BankSettings> | null | undefined) {
  return {
    paymentMethod: String(value?.paymentMethod || DEFAULT_BANK.paymentMethod),
    accountName: String(value?.accountName || DEFAULT_BANK.accountName),
    accountNumber: String(value?.accountNumber || DEFAULT_BANK.accountNumber),
    bankName: String(value?.bankName || DEFAULT_BANK.bankName),
  };
}

function normalizeServices(value: unknown): CatalogService[] {
  if (!Array.isArray(value) || value.length === 0) {
    return DEFAULT_SERVICES.map((service) => ({ ...service }));
  }
  return value
    .map((item) => {
      const row = item as Partial<CatalogService>;
      const title = String(row.title || "").trim();
      if (!title) return null;
      const price = Number(row.price);
      return {
        id: String(row.id || createId()).trim() || createId(),
        title,
        price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0,
      };
    })
    .filter((item): item is CatalogService => Boolean(item));
}

export async function getAppSettings(): Promise<AppSettings> {
  const [branding, bank, services] = await Promise.all([
    getSettingValue<Partial<BrandingSettings>>("branding", DEFAULT_BRANDING),
    getSettingValue<Partial<BankSettings>>("bank", DEFAULT_BANK),
    getSettingValue<unknown>("services", DEFAULT_SERVICES),
  ]);

  return {
    branding: normalizeBranding(branding),
    bank: normalizeBank(bank),
    services: normalizeServices(services),
  };
}

export async function updateBrandingSettings(
  patch: Partial<BrandingSettings>,
) {
  const current = await getAppSettings();
  const next = normalizeBranding({ ...current.branding, ...patch });
  await setSettingValue("branding", next);
  return next;
}

export async function updateBankSettings(patch: Partial<BankSettings>) {
  const current = await getAppSettings();
  const next = normalizeBank({ ...current.bank, ...patch });
  await setSettingValue("bank", next);
  return next;
}

export async function updateServicesSettings(services: CatalogService[]) {
  const next = normalizeServices(services);
  if (next.length === 0) {
    throw new Error("Add at least one service.");
  }
  await setSettingValue("services", next);
  return next;
}
