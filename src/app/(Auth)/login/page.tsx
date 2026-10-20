"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EyesIcon, EyeSlashIcon } from "@/public/svg/svg";
import { apiFetch } from "@/src/lib/api";
import { captureRecoveryHash } from "@/src/lib/recovery";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-40" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (captureRecoveryHash()) {
      router.replace("/set-password?recovery=1");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, staySignedIn }),
      });
      const next = searchParams.get("next") || "/home";
      router.replace(next.startsWith("/") ? next : "/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm border border-gray-100 px-7 sm:px-10 py-14 sm:py-16">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          Use your Netan staff account to continue.
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
            className="w-full pl-5 pr-4 py-3.5 text-gray-700 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <Link
              href="/reset-password"
              className="text-sm text-green-700 hover:text-green-800 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-5 pr-12 py-3.5 text-gray-700 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeSlashIcon size={18} />
              ) : (
                <EyesIcon size={18} />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={staySignedIn}
            onChange={(e) => setStaySignedIn(e.target.checked)}
            className="form-checkbox h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Stay signed in
          </label>
        </div>

        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2D266C] hover:bg-green-800 text-white font-medium py-3.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Access is limited to Netan Technologies staff.{" "}
          <Link href="/register" className="text-[#2D266C] font-medium hover:underline">
            Create first admin
          </Link>
        </p>
      </form>
    </div>
  );
}
