"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EyesIcon, EyeSlashIcon } from "@/public/svg/svg";
import { apiFetch } from "@/src/lib/api";

type SetupResponse = {
  mode: "first" | "invite" | "closed" | "invalid";
  name?: string;
  email?: string;
  role?: string;
  error?: string;
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-40" />}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<SetupResponse["mode"] | "loading">("loading");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailLocked = Boolean(token);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<SetupResponse>(
          `/api/auth/setup${token ? `?token=${encodeURIComponent(token)}` : ""}`,
        );
        if (cancelled) return;
        setMode(data.mode);
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);
        if (data.error) setError(data.error);
      } catch (err) {
        if (!cancelled) {
          setMode("closed");
          setError(err instanceof Error ? err.message : "Could not load signup");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, token }),
      });
      router.replace("/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "loading") {
    return (
      <div className="w-full max-w-[400px] bg-white rounded-lg shadow-md px-6 sm:px-8 py-16 text-center text-sm text-gray-500">
        Checking invite…
      </div>
    );
  }

  if (mode === "closed" || mode === "invalid") {
    return (
      <div className="w-full max-w-[400px] bg-white rounded-lg shadow-md px-6 sm:px-8 py-16">
        <h1 className="text-2xl font-semibold text-gray-900 text-center">
          Invite required
        </h1>
        <p className="text-sm text-gray-500 mt-4 text-center">
          {error || "Ask a Netan admin to invite you."}
        </p>
        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-medium text-[#2D266C] hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] bg-white rounded-lg shadow-md px-6 sm:px-8 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {mode === "first" ? "Create admin account" : "Accept invite"}
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          {mode === "first"
            ? "This first account becomes Superadmin."
            : "Set a password to join the Netan workspace."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Full name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full pl-5 pr-4 py-3.5 text-gray-700 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Example@gmail.com"
            readOnly={emailLocked}
            className="w-full pl-5 pr-4 py-3.5 text-gray-700 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all read-only:bg-gray-50"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Password
          </label>
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
              {showPassword ? <EyeSlashIcon size={18} /> : <EyesIcon size={18} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            At least 8 characters, with a letter and a number.
          </p>
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
          {loading ? "Saving…" : mode === "first" ? "Create account" : "Join workspace"}
        </button>
        <p className="text-xs text-gray-500 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-[#2D266C] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
