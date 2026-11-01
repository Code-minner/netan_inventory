"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { EditIcon } from "@/public/svg/svg";
import { apiFetch } from "@/src/lib/api";
import { useAuth, type SessionAdmin } from "@/src/components/AuthProvider";

const inputClass =
  "w-full px-4 py-3 text-sm text-gray-900 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#2D266C]/20 focus:border-[#2D266C]/40";

export default function ProfileTab() {
  const { admin, setAdmin } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const parts = (admin?.name || "").trim().split(/\s+/).filter(Boolean);
  const [firstName, setFirstName] = useState(parts[0] || "");
  const [lastName, setLastName] = useState(parts.slice(1).join(" ") || "");
  const [email, setEmail] = useState(admin?.email || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    admin?.avatarUrl || null,
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!admin) return;
    const nextParts = admin.name.trim().split(/\s+/).filter(Boolean);
    setFirstName(nextParts[0] || "");
    setLastName(nextParts.slice(1).join(" ") || "");
    setEmail(admin.email);
    if (!photoFile) {
      setPreviewUrl(admin.avatarUrl || null);
    }
  }, [admin, photoFile]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const initials = admin?.initials || "A";

  const onPickPhoto = (file: File | null | undefined) => {
    if (!file) return;
    const okTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!okTypes.includes(file.type)) {
      setError("Profile photo must be JPG, PNG, or GIF.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Profile photo must be 2MB or smaller.");
      return;
    }
    setError("");
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const name = `${firstName} ${lastName}`.trim();
      let avatarUrl = admin?.avatarUrl || undefined;

      if (photoFile) {
        const signed = await apiFetch<{
          signedUrl: string;
          publicUrl: string;
        }>("/api/auth/avatar", {
          method: "POST",
          body: JSON.stringify({
            fileName: photoFile.name,
            contentType: photoFile.type,
          }),
        });

        const put = await fetch(signed.signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": photoFile.type || "image/jpeg",
          },
          body: photoFile,
        });

        if (!put.ok) {
          throw new Error("Could not upload profile photo.");
        }

        avatarUrl = signed.publicUrl;
      }

      const data = await apiFetch<{ admin: SessionAdmin }>("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name,
          ...(photoFile ? { avatarUrl } : {}),
        }),
      });
      setAdmin(data.admin);
      setPhotoFile(null);
      setPreviewUrl(data.admin.avatarUrl);
      setMessage("Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <h2 className="text-base font-semibold text-gray-900 mb-8">Profile</h2>

      <div className="flex items-center gap-5 mb-8">
        <div className="relative shrink-0">
          <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-[#FDE8D7] flex items-center justify-center">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-[#2D266C]">
                {initials}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Change profile photo"
            className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50"
          >
            <EditIcon size={14} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            className="hidden"
            onChange={(e) => onPickPhoto(e.target.files?.[0])}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Profile Photo</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            JPG, PNG or GIF. Max size 2MB.
          </p>
        </div>
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm text-gray-800 mb-2"
          >
            First name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm text-gray-800 mb-2"
          >
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            className={inputClass}
          />
        </div>
      </div>

      <div className="mb-8">
        <label htmlFor="email" className="block text-sm text-gray-800 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          className={`${inputClass} bg-gray-50 text-gray-700`}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="text-sm font-medium text-white bg-[#2E2A5C] hover:bg-[#25214a] rounded-lg px-5 py-3 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
