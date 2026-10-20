"use client";

import { useEffect, useState } from "react";
import {
  CloseIcon,
  CheckIcon,
  PhoneIcon,
  MessageIcon,
  DownloadIcon,
  PendingIcon,
  ActiveIcon,
} from "../../../../../public/svg/svg";
import { formatDate, formatNaira, formatTime } from "@/src/lib/format";
import type {
  Order,
  OrderDetailStatus,
  OrderUiStatus,
} from "@/src/lib/mock-data";

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onUpdated?: (order: Order) => void;
}

const statusLabel: Record<OrderDetailStatus, string> = {
  received: "Awaiting payment",
  confirmed: "Confirmed (paid)",
  shopping: "Shopping",
  ready: "Ready",
  delivered: "Delivered",
};

const statusStyles: Record<OrderDetailStatus, string> = {
  received: "bg-amber-50 text-amber-600",
  confirmed: "bg-blue-50 text-blue-600",
  shopping: "bg-amber-50 text-amber-600",
  ready: "bg-green-50 text-green-600",
  delivered: "bg-gray-100 text-gray-600",
};

const nextStatus: Partial<Record<string, string>> = {
  pending: "confirmed",
  awaiting_payment: "confirmed",
  confirmed: "shopping",
  shopping: "purchased",
  purchased: "dispatched",
  dispatched: "delivered",
};

const uiStatusFromDetail: Record<
  string,
  { uiStatus: OrderUiStatus; detailStatus: OrderDetailStatus }
> = {
  confirmed: { uiStatus: "Confirmed", detailStatus: "confirmed" },
  shopping: { uiStatus: "Active", detailStatus: "shopping" },
  purchased: { uiStatus: "Active", detailStatus: "ready" },
  dispatched: { uiStatus: "Active", detailStatus: "ready" },
  delivered: { uiStatus: "Delivered", detailStatus: "delivered" },
};

export default function OrderDetailsModal({
  order,
  onClose,
  onUpdated,
}: OrderDetailsModalProps) {
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState<Order>(order);

  useEffect(() => {
    setDetails(order);
  }, [order]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleAdvanceStatus = () => {
    const next = nextStatus[details.status];
    if (!next) return;
    const mapped = uiStatusFromDetail[next];
    const updated: Order = {
      ...details,
      status: next,
      uiStatus: mapped?.uiStatus ?? details.uiStatus,
      detailStatus: mapped?.detailStatus ?? details.detailStatus,
      paymentStatus: next === "confirmed" ? "paid" : details.paymentStatus,
      paidAt: next === "confirmed" ? new Date().toISOString() : details.paidAt,
    };
    setDetails(updated);
    onUpdated?.(updated);
  };

  const timelineSteps = [
    {
      label: "Order received",
      time: formatTime(details.createdAt),
      completed: true,
    },
    {
      label: "Payment confirmed",
      time: details.paidAt ? formatTime(details.paidAt) : "",
      completed:
        details.paymentStatus === "paid" ||
        details.detailStatus === "confirmed" ||
        details.detailStatus === "shopping" ||
        details.detailStatus === "ready" ||
        details.detailStatus === "delivered",
    },
    {
      label: "Shopping in progress",
      time: "",
      completed:
        details.detailStatus === "shopping" ||
        details.detailStatus === "ready" ||
        details.detailStatus === "delivered",
    },
    {
      label: "Ready for pickup",
      time: "",
      completed:
        details.detailStatus === "ready" ||
        details.detailStatus === "delivered",
    },
    {
      label: "Delivered",
      time: "",
      completed: details.detailStatus === "delivered",
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-200 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className=" px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
          <div className="flex items-center gap-1">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Download"
            >
              <DownloadIcon size={18} className="text-gray-500" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <CloseIcon size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 pt-0">
          <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-4">
            <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[#1C5E32] flex-shrink-0">
              <ActiveIcon size={18} />
            </div>

            <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-900 truncate">
                <span className="block  text-gray-500 font-normal">
                  Order ID:{" "}
                </span>
                {details.shortId}
              </p>

              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[details.detailStatus]}`}
                >
                  <PendingIcon size={10} />
                  {statusLabel[details.detailStatus]}
                </span>
                <p className="text-xs text-gray-500">
                  {formatDate(details.createdAt)},{" "}
                  {formatTime(details.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 tracking-wide mb-3">
              ITEMS ORDERED ({details.itemsCount})
            </h3>
            <div className="space-y-3">
              {details.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0 flex items-center justify-center text-xs font-medium text-gray-500">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        item.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.name}{" "}
                        <span className="text-gray-400 font-normal">
                          x{item.quantity}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">{item.unit}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatNaira(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 border-t border-gray-100 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">
                {formatNaira(details.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Agent fee</span>
              <span className="text-gray-900">
                {formatNaira(details.agentFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery fee</span>
              <span className="text-gray-900">
                {formatNaira(details.deliveryFee)}
              </span>
            </div>
            <div className="border-b pb-3 border-gray-200 mt-2 pt-2 flex justify-between font-semibold">
              <span className="text-gray-900">Total</span>
              <span className="text-green-700">
                {formatNaira(details.total)}
              </span>
            </div>
          </div>

          <div className="border-b pb-3 border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 tracking-wide mb-3">
              CUSTOMER INFORMATION
            </h3>
            <div className=" p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {details.customerName}
                </p>
                <p className="text-sm text-gray-900 flex items-center gap-1.5 mt-1">
                  <PhoneIcon size={8} className="text-gray-400" />
                  {details.customerPhone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 rounded-full bg-gray-50  flex items-center justify-center text-gray-500 hover:text-green-700 hover:border-green-200 transition-colors"
                  aria-label="Message customer"
                >
                  <MessageIcon size={14} />
                </button>
                <a
                  href={`tel:${details.customerPhone}`}
                  className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-green-700 hover:border-green-200 transition-colors"
                  aria-label="Call customer"
                >
                  <PhoneIcon size={14} />
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 tracking-wide mb-3">
              DELIVERY DETAILS
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery method</span>
                <span className="text-gray-900">{details.deliveryMethod}</span>
              </div>
              <div className="flex justify-between text-sm gap-4">
                <span className="text-gray-500 flex-shrink-0">
                  Delivery address
                </span>
                <span className="text-gray-900 text-right">
                  {details.deliveryAddress}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 tracking-wide mb-3">
              STATUS TIMELINE
            </h3>
            <div>
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={` rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.completed ? "bg-green-100" : "bg-gray-200"
                      }`}
                    >
                      {step.completed ? (
                        <CheckIcon size={12} className="text-white" />
                      ) : (
                        <PendingIcon size={12} className="text-gray-400" />
                      )}
                    </div>
                    {idx < timelineSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-6 ${
                          step.completed ? "bg-green-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <p
                      className={`text-sm font-medium ${
                        step.completed ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.time ? (
                      <p className="text-xs text-gray-500">{step.time}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-shrink-0 gap-3">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 transition-colors">
            <DownloadIcon size={16} className="text-gray-400" />
            Download Receipt
          </button>
          {nextStatus[details.status] ? (
            <button
              onClick={handleAdvanceStatus}
              className="text-sm font-medium text-white bg-[#2D266C] hover:bg-green-800 rounded-lg px-4 py-2"
            >
              Mark as {nextStatus[details.status]}
            </button>
          ) : (
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 transition-colors">
              <ActiveIcon size={16} className="text-gray-400" />
              Reorder
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
