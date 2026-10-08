"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackArrow } from "@/public/svg/svg";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/verify-email");
  };

  return (
    <div className="w-full max-w-[400px] bg-white rounded-lg shadow-md px-6 sm:px-8 py-16  ">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reset your Password</h1>
        <p className="text-sm text-gray-500 mt-4">
          Enter your Netan staff email and we&apos;ll send a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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

        <button
          type="submit"
          className="w-full bg-[#2D266C] text-white font-medium py-3.5 rounded-lg transition-colors"
        >
          Send Reset Link
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
