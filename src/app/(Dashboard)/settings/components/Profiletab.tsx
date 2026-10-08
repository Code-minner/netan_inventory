"use client";

import { FormEvent, useState } from "react";
import { CURRENT_ADMIN } from "@/src/lib/mock-data";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const inputClass =
  "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D266C]/20 focus:border-[#2D266C]/40";

export default function ProfileTab() {
  const parts = (CURRENT_ADMIN.name || "").trim().split(/\s+/).filter(Boolean);
  const [firstName, setFirstName] = useState(parts[0] || "");
  const [lastName, setLastName] = useState(parts.slice(1).join(" ") || "");
  const [email, setEmail] = useState(CURRENT_ADMIN.email);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    CURRENT_ADMIN.avatarUrl,
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const initials = (CURRENT_ADMIN.name || CURRENT_ADMIN.email || "A")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  const handleAvatarChange = (file: File | null) => {
    if (!file) return;
    setError("");
    if (!/^image\/(jpeg|png|gif)$/.test(file.type)) {
      setError("Use a JPG, PNG or GIF image.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Image must be 2MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setAvatarUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: call backend to persist profile
    setMessage("Profile saved.");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <h2 className="text-base font-semibold text-gray-900 mb-5">Profile</h2>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-16 h-16 shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-[#FDE8D7] flex items-center justify-center">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-lg font-semibold text-[#2D266C]">
                {initials}
              </span>
            )}
          </div>
          <label
            className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50"
            aria-label="Change profile photo"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
              onChange={(e) => handleAvatarChange(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Profile photo</p>
          <p className="text-xs text-gray-500 mt-0.5">
            JPG, PNG or GIF. Max size 2MB.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          {message}
        </p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label htmlFor="firstName" className="block text-sm text-gray-700 mb-1.5">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm text-gray-700 mb-1.5">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="email" className="block text-sm text-gray-700 mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="text-sm font-medium text-white bg-[#2D266C] hover:bg-[#241f58] rounded-lg px-4 py-2.5"
      >
        Save changes
      </button>
    </form>
  );
}