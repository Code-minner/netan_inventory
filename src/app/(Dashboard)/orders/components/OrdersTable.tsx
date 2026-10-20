"use client";

import { useMemo, useState } from "react";
import OrderDetailsModal from "./OrderDetailsModal";
import {
  EyesIcon,
  DownloadIcon,
  DeleteIcon,
  PendingIcon,
  ActiveIcon,
  CancelIcon,
  FilterIcon,
  SearchIcon,
  ExportIcon,
} from "../../../../../public/svg/svg";
import { formatDate, formatNaira } from "@/src/lib/format";
import {
  MOCK_ORDERS,
  type Order,
  type OrderUiStatus,
} from "@/src/lib/mock-data";

const statusStyles: Record<OrderUiStatus, string> = {
  Pending: "bg-amber-50 text-amber-600",
  Confirmed: "bg-blue-50 text-blue-600",
  Active: "bg-green-50 text-green-600",
  Delivered: "bg-gray-100 text-gray-600",
  Cancelled: "bg-red-50 text-red-500",
};

const statusIcons: Record<
  OrderUiStatus,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  Pending: PendingIcon,
  Confirmed: ActiveIcon,
  Active: ActiveIcon,
  Delivered: ActiveIcon,
  Cancelled: CancelIcon,
};

function StatusBadge({ status }: { status: OrderUiStatus }) {
  const StatusIcon = statusIcons[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[status]}`}
    >
      <StatusIcon size={12} className="flex-shrink-0" />
      {status}
    </span>
  );
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (order) =>
        order.shortId.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q),
    );
  }, [orders, query]);

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  const handleCancel = (order: Order) => {
    if (
      !window.confirm(`Are you sure you want to cancel order ${order.shortId}?`)
    ) {
      return;
    }
    setOrders((prev) =>
      prev.map((item) =>
        item.id === order.id
          ? { ...item, uiStatus: "Cancelled", status: "cancelled" }
          : item,
      ),
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage all your orders
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-1 min-w-0 items-center gap-2 sm:gap-3"
        >
          <div className="relative flex-1 min-w-0 sm:max-w-xs">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <SearchIcon size={16} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="pl-9 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 text-gray-700 placeholder-gray-700"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2"
          >
            <FilterIcon size={14} />
            Search
          </button>
        </form>

        <button className="self-start flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2">
          <ExportIcon size={14} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="py-3 px-6 font-medium">Order ID</th>
              <th className="py-3 px-6 font-medium">Items</th>
              <th className="py-3 px-6 font-medium">Amount</th>
              <th className="py-3 px-6 font-medium">Date</th>
              <th className="py-3 px-6 font-medium">Status</th>
              <th className="py-3 px-6 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-500">
                  No orders yet.
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[#1C5E32]">
                        <ActiveIcon size={16} />
                      </div>
                      <span className="text-gray-900 font-medium">
                        {order.shortId}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {order.itemsCount}
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {formatNaira(order.total)}
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={order.uiStatus} />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 text-gray-400">
                      <button
                        onClick={() => setSelectedOrderId(order.id)}
                        className="hover:text-gray-600 transition-colors"
                      >
                        <EyesIcon size={16} />
                      </button>
                      <button className="hover:text-gray-600 transition-colors">
                        <DownloadIcon size={16} />
                      </button>
                      <button
                        onClick={() => handleCancel(order)}
                        disabled={
                          order.uiStatus === "Cancelled" ||
                          order.uiStatus === "Delivered"
                        }
                        className={
                          order.uiStatus === "Pending"
                            ? "text-red-400 hover:text-red-500"
                            : "hover:text-red-500 transition-colors disabled:opacity-40"
                        }
                      >
                        {order.uiStatus === "Pending" ? (
                          <CancelIcon size={16} />
                        ) : (
                          <DeleteIcon size={16} className="text-red-400" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
          onUpdated={(updated) =>
            setOrders((prev) =>
              prev.map((item) => (item.id === updated.id ? updated : item)),
            )
          }
        />
      )}
    </div>
  );
}
