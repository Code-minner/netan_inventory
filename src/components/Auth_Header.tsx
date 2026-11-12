"use client";

import { useEffect, useState } from "react";
import { DEFAULT_BRANDING } from "@/src/lib/app-settings-shared";

export default function Auth_Header() {
  const [logoSrc, setLogoSrc] = useState(DEFAULT_BRANDING.dashboardLogoUrl);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/settings/public");
        const data = await res.json().catch(() => ({}));
        const url =
          data?.branding?.dashboardLogoUrl ||
          data?.branding?.navLogoUrl ||
          DEFAULT_BRANDING.dashboardLogoUrl;
        if (!cancelled) setLogoSrc(url);
        if (data?.branding?.faviconUrl) {
          const link =
            document.querySelector('link[rel="icon"]') ||
            document.createElement("link");
          (link as HTMLLinkElement).setAttribute("rel", "icon");
          (link as HTMLLinkElement).setAttribute(
            "href",
            data.branding.faviconUrl,
          );
          if (!link.parentNode) document.head.appendChild(link);
        }
      } catch {
        // keep default
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full max-w-[1200px] mx-auto pt-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt="Netan Logo"
        width={70}
        height={35}
        className="object-contain h-[35px] w-auto max-w-[140px]"
      />
    </div>
  );
}
