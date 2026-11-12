import type { PaymentStatus } from "./types";

/** Canonical payment statuses. Legacy "Not Completed" maps to Pending. */
export const PAYMENT_STATUSES: PaymentStatus[] = ["Pending", "Completed"];

export function normalizePaymentStatus(status: string | null | undefined): PaymentStatus {
  if (status === "Completed") return "Completed";
  return "Pending";
}

export function isPaymentCompleted(status: string | null | undefined) {
  return normalizePaymentStatus(status) === "Completed";
}

export function paymentStatusLabel(status: string | null | undefined) {
  return normalizePaymentStatus(status);
}

export function paymentStatusBadgeClass(status: string | null | undefined) {
  return normalizePaymentStatus(status) === "Completed"
    ? "bg-green-50 text-green-600"
    : "bg-amber-50 text-amber-600";
}
