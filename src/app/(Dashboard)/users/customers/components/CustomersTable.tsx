"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  SearchIcon,
  FilterIcon,
  EyesIcon,
  MessageIcon,
} from "../../../../../../public/svg/svg";
import { MOCK_CUSTOMERS, type Customer } from "@/src/lib/mock-data";
import { formatDate, formatNaira } from "@/src/lib/format";

function CustomerAvatar({
  name,
  phone,
}: {
  name: string | null;
  phone: string;
}) {
  const initials = (name || phone)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="w-9 h-9 rounded-full bg-[#E6EDE8] text-[#2D266C] flex items-center justify-center text-xs font-semibold shrink-0">
      {initials || "C"}
    </div>
  );
}

export default function CustomersTable() {
  const [customers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (customer) =>
        (customer.name || "").toLowerCase().includes(q) ||
        customer.whatsappNumber.toLowerCase().includes(q),
    );
  }, [customers, query]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">
            View all clients and their activity
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex items-center justify-between gap-3 mb-4 min-w-0"
      >
        <div className="relative w-full max-w-xs min-w-0">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <SearchIcon size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="pl-9 pr-4 py-2.5 w-full text-sm bg-transparent border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 text-gray-700"
          />
        </div>
        <button
          type="button"
          className="shrink-0 inline-flex items-center gap-2 text-sm text-gray-700 bg-transparent border border-gray-200 rounded-lg px-3 py-2.5 hover:bg-gray-50"
        >
          <FilterIcon size={16} />
          Filters
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="py-3 px-5 font-medium">Name</th>
              <th className="py-3 px-5 font-medium">Phone</th>
              <th className="py-3 px-5 font-medium">Orders</th>
              <th className="py-3 px-5 font-medium">Last order</th>
              <th className="py-3 px-5 font-medium">Date added</th>
              <th className="py-3 px-5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-500">
                  No customers found.
                </td>
              </tr>
            ) : (
              filtered.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-100">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3 min-w-0">
                      <CustomerAvatar
                        name={customer.name}
                        phone={customer.whatsappNumber}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {customer.name || "Unnamed customer"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {customer.messagesCount} messages
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-gray-600">
                    {customer.whatsappNumber}
                  </td>
                  <td className="py-4 px-5 text-gray-600">
                    {customer.ordersCount}
                  </td>
                  <td className="py-4 px-5 text-gray-600">
                    {customer.lastOrderAt ? (
                      <div>
                        <p>{formatDate(customer.lastOrderAt)}</p>
                        {customer.lastOrderTotal != null ? (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatNaira(customer.lastOrderTotal)}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-4 px-5 text-gray-600">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Link
                        href={`/messages?customer=${customer.id}`}
                        className="p-1.5 rounded-md hover:bg-gray-50 hover:text-gray-800"
                        aria-label="Open chat"
                        title="Open chat"
                      >
                        <MessageIcon size={16} />
                      </Link>
                      <Link
                        href={`/messages?customer=${customer.id}`}
                        className="p-1.5 rounded-md hover:bg-gray-50 hover:text-gray-800"
                        aria-label="View customer"
                        title="View"
                      >
                        <EyesIcon size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
