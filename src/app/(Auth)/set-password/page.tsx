"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyesIcon, EyeSlashIcon } from "@/public/svg/svg";

export default function SetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    router.push("/success");
  };

  return (
    <div className="w-full max-w-[400px] bg-white rounded-lg shadow-md px-6 sm:px-8 py-16  ">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Set a new password</h1>
        <p className="text-sm text-gray-500 mt-2">
          Choose a password for your Netan staff account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Confirm password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full pl-5 pr-4 py-3.5 text-gray-700 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all"
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
          className="w-full bg-[#2D266C] hover:bg-green-800 text-white font-medium py-3.5 rounded-lg transition-colors"
        >
          Save password
        </button>
      </form>
    </div>
  );
}
