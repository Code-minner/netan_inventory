"use client";

import { useEffect, useState } from "react";

type Props = {
  label: string;
  url: string;
};

export default function AttachmentPreview({ label, url }: Props) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expanded]);

  return (
    <>
      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-gray-50 border-b border-gray-100">
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-xs font-medium text-[#2E2A5C] hover:underline"
          >
            Expand
          </button>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="block w-full bg-white p-2 text-left"
          aria-label={`Expand ${label}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            className="w-full max-h-56 object-contain rounded-md bg-gray-50"
          />
        </button>
      </div>

      {expanded ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setExpanded(false)}
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-sm font-medium text-white">{label}</p>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-sm text-white/90 hover:text-white"
              >
                Close
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={label}
              className="w-full max-h-[80vh] object-contain rounded-lg bg-black/20"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
