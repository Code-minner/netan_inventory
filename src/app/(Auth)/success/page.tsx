"use client";

import { useRouter } from "next/navigation";
import { SuccessIcon } from "@/public/svg/svg";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-[400px] bg-white rounded-lg shadow-md px-6 sm:px-8 py-16  ">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <SuccessIcon size={50} className="mx-auto mb-4 " />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Password reset!</h1>
        <p className="text-sm text-gray-500 mt-4">
          Your password has been updated successfully. You&apos;re all set to sign in.
        </p>
      </div>

      <button
        type="button"
        onClick={() => router.push("/login")}
        className="w-full bg-[#2D266C] text-white font-medium py-3.5 rounded-lg transition-colors"
      >
        Go to Sign in
      </button>
    </div>
  );
}
