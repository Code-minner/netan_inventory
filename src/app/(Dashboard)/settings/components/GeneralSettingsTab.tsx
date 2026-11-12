"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/src/lib/api";
import {
  DEFAULT_BRANDING,
  type AppSettings,
  type BrandingSettings,
} from "@/src/lib/app-settings-shared";
import { useBranding } from "@/src/components/BrandingProvider";

type LogoKind = "nav" | "dashboard" | "favicon";

const LOGO_FIELDS: {
  kind: LogoKind;
  label: string;
  key: keyof BrandingSettings;
}[] = [
  { kind: "nav", label: "Website nav logo", key: "navLogoUrl" },
  { kind: "dashboard", label: "Dashboard logo", key: "dashboardLogoUrl" },
  { kind: "favicon", label: "Favicon", key: "faviconUrl" },
];

export default function GeneralSettingsTab() {
  const { setBranding: setGlobalBranding } = useBranding();
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);
  const [savingKind, setSavingKind] = useState<LogoKind | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fileRefs = useRef<Record<LogoKind, HTMLInputElement | null>>({
    nav: null,
    dashboard: null,
    favicon: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<{ settings: AppSettings }>("/api/settings");
        if (!cancelled) {
          setBranding(data.settings.branding);
          setGlobalBranding(data.settings.branding);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load settings",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setGlobalBranding]);

  const uploadLogo = async (kind: LogoKind, file: File) => {
    setError("");
    setMessage("");
    setSavingKind(kind);
    try {
      const okTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/x-icon",
        "image/svg+xml",
      ];
      if (!okTypes.includes(file.type)) {
        throw new Error("Logo must be an image file (PNG, JPG, GIF, WebP, SVG, or ICO).");
      }
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("Logo must be 2MB or smaller.");
      }

      const signed = await apiFetch<{
        signedUrl: string;
        publicUrl: string;
      }>("/api/settings/upload", {
        method: "POST",
        body: JSON.stringify({
          kind,
          fileName: file.name,
          contentType: file.type,
        }),
      });

      const put = await fetch(signed.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/png" },
        body: file,
      });
      if (!put.ok) {
        throw new Error("Could not upload logo.");
      }

      const field =
        kind === "nav"
          ? "navLogoUrl"
          : kind === "dashboard"
            ? "dashboardLogoUrl"
            : "faviconUrl";

      const data = await apiFetch<{ branding: BrandingSettings }>(
        "/api/settings",
        {
          method: "PATCH",
          body: JSON.stringify({
            section: "branding",
            [field]: signed.publicUrl,
          }),
        },
      );

      setBranding(data.branding);
      setGlobalBranding(data.branding);
      setMessage("Logo updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update logo");
    } finally {
      setSavingKind(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading settings…</p>;
  }

  return (
    <div className="w-full">
      <h2 className="text-base font-semibold text-gray-900 mb-8">
        General Settings
      </h2>

      {error ? (
        <p className="mb-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-5 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          {message}
        </p>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
        {LOGO_FIELDS.map((item) => {
          const url = branding[item.key];
          const isFavicon = item.kind === "favicon";
          return (
            <div
              key={item.kind}
              className={`flex flex-col gap-3 ${
                isFavicon ? "sm:col-span-2 sm:max-w-sm sm:mx-auto sm:w-full" : ""
              }`}
            >
              <p className="text-sm text-gray-800">{item.label}</p>
              <div className="bg-[#F5F5F7] rounded-xl border border-gray-100 h-36 sm:h-40 flex items-center justify-center px-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url || DEFAULT_BRANDING.navLogoUrl}
                  alt={item.label}
                  className={`object-contain ${
                    isFavicon ? "h-16 w-16" : "max-h-24 w-auto max-w-full"
                  }`}
                />
              </div>
              <input
                ref={(el) => {
                  fileRefs.current[item.kind] = el;
                }}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/x-icon,image/svg+xml,.ico"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void uploadLogo(item.kind, file);
                }}
              />
              <button
                type="button"
                disabled={savingKind === item.kind}
                onClick={() => fileRefs.current[item.kind]?.click()}
                className="self-start text-sm font-medium text-white bg-[#2E2A5C] hover:bg-[#25214a] rounded-lg px-5 py-2.5 disabled:opacity-60"
              >
                {savingKind === item.kind ? "Uploading…" : "Edit"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
