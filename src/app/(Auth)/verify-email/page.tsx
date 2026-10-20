"use client";

import Link from "next/link";
import { BackArrow, VerifyEmailIcon } from "@/public/svg/svg";

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm border border-gray-100 px-7 sm:px-10 py-14 sm:py-16  ">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <VerifyEmailIcon size={40} className="mx-auto mb-4 " />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Check your Email</h1>
        <p className="text-sm text-gray-500 mt-4">
          If an account exists, a reset link has been sent. It expires in 30 minutes.
        </p>
      </div>

      <Link
        href="/login"
        className="text-xs text-[#2D266C] text-center font-medium transition-colors flex items-center justify-center gap-2 pt-4"
      >
        <BackArrow size={16} /> Back to sign in
      </Link>
    </div>
  );
}
