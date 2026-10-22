"use client";

import Modal from "@/src/components/Modal";
import type { Payment } from "@/src/lib/types";

type Props = {
  payment: Payment | null;
  onClose: () => void;
};

export default function PaymentDetailsModal({ payment, onClose }: Props) {
  return (
    <Modal
      isOpen={Boolean(payment)}
      onClose={onClose}
      title="Payment details"
      widthClassName="max-w-lg"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-medium text-white bg-[#2E2A5C] rounded-lg hover:bg-[#25214a]"
        >
          Close
        </button>
      }
    >
      {payment ? (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <span className="w-14 h-14 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center text-sm font-semibold">
              {payment.initials}
            </span>
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                {payment.name}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Payment ID: {payment.id}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3.5 text-sm">
            <Detail label="Services" value={`${payment.servicesCount}`} />
            <Detail label="Amount" value={payment.amount} />
            <Detail label="Paid" value={payment.paidAmount} />
            <Detail label="Paid date" value={payment.paidDate} />
            <Detail label="Status" value={payment.status} />
            {payment.paymentPercent ? (
              <Detail label="Percent" value={`${payment.paymentPercent}%`} />
            ) : null}
          </div>
          {payment.paymentProofUrl ? (
            <a
              href={payment.paymentProofUrl}
              target="_blank"
              rel="noreferrer"
              className="block text-sm font-medium text-[#2E2A5C] hover:underline"
            >
              View payment proof
            </a>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3.5 py-3.5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}
