"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackArrow } from "@/public/svg/svg";
import { apiFetch } from "@/src/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiFetch("/api/auth/forgot", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      router.push("/verify-email");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send reset link",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm border border-gray-100 px-7 sm:px-10 py-14 sm:py-16">
      <div className="mb-10 text-center space-y-3">
        <h1 className="text-2xl font-semibold text-gray-900">
          Reset your Password
        </h1>
        <p className="text-sm text-gray-500 mt-4">
          Enter your Netan staff email and we&apos;ll send a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Example@gmail.com"
            className="w-full pl-5 pr-4 py-3.5 text-gray-700 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D266C]/20 focus:border-[#2D266C] transition-all"
            required
          />
        </div>

        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2D266C] hover:bg-[#25214a] text-white font-medium py-3.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send Reset Link"}
        </button>

        <Link
          href="/login"
          className="text-xs text-[#2D266C] text-center font-medium transition-colors flex items-center justify-center gap-2 pt-4"
        >
          <BackArrow size={16} /> Back to sign in
        </Link>
      </form>
    </div>
  );
}
