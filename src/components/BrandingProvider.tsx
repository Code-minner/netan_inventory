"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_BRANDING,
  type BrandingSettings,
} from "@/src/lib/app-settings-shared";

type BrandingContextValue = {
  branding: BrandingSettings;
  refresh: () => Promise<void>;
  setBranding: (next: BrandingSettings) => void;
};

const BrandingContext = createContext<BrandingContextValue | null>(null);

function applyFavicon(url: string) {
  if (typeof document === "undefined") return;
  const href = url || DEFAULT_BRANDING.faviconUrl;
  const selectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
  ];
  for (const selector of selectors) {
    let link = document.querySelector(selector) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = selector.includes("apple")
        ? "apple-touch-icon"
        : selector.includes("shortcut")
          ? "shortcut icon"
          : "icon";
      document.head.appendChild(link);
    }
    link.href = href;
    if (!selector.includes("apple")) {
      link.type = href.endsWith(".svg") ? "image/svg+xml" : "image/png";
    }
  }
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/public", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (data?.branding) {
        setBranding({
          navLogoUrl: String(data.branding.navLogoUrl || DEFAULT_BRANDING.navLogoUrl),
          dashboardLogoUrl: String(
            data.branding.dashboardLogoUrl || DEFAULT_BRANDING.dashboardLogoUrl,
          ),
          faviconUrl: String(data.branding.faviconUrl || DEFAULT_BRANDING.faviconUrl),
        });
      }
    } catch {
      // keep defaults
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    applyFavicon(branding.faviconUrl);
  }, [branding.faviconUrl]);

  return (
    <BrandingContext.Provider value={{ branding, refresh, setBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within BrandingProvider");
  }
  return context;
}
