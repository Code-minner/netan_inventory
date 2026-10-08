"use client";

import { useMemo, useState } from "react";
import { SearchIcon, PlusIcon } from "../../../../../../public/svg/svg";
import {
  CURRENT_ADMIN,
  MOCK_ADMINS,
  type AdminUser,
} from "@/src/lib/mock-data";
import { formatDate } from "@/src/lib/format";
import { ROLE_LABELS, ROLE_OPTIONS, type AdminRole } from "@/src/lib/roles";

export default function AdminsTable() {
  const [admins, setAdmins] = useState<AdminUser[]>(MOCK_ADMINS);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(
      (admin) =>
        (admin.name || "").toLowerCase().includes(q) ||
        admin.email.toLowerCase().includes(q) ||
        (admin.phone || "").toLowerCase().includes(q),
    );
  }, [admins, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  const handleRoleChange = (id: string, role: AdminRole) => {
    setAdmins((prev) =>
      prev.map((admin) => (admin.id === id ? { ...admin, role } : admin)),
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
            User management
          </p>
          <h1 className="text-xl font-semibold text-gray-900">Admins</h1>
          <p className="text-sm text-gray-500 mt-1">
            People who can access the Netan admin dashboard
          </p>
        </div>
        <button
          type="button"
          className="self-start flex items-center gap-2 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-lg px-4 py-2.5"
        >
          <PlusIcon size={16} />
          Add admin
        </button>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 sm:gap-3 mb-4 min-w-0"
      >
        <div className="relative flex-1 min-w-0 sm:max-w-sm">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <SearchIcon size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or phone"
            className="pl-9 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 text-gray-700"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50"
        >
          Search
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="py-3 px-6 font-medium">Name</th>
              <th className="py-3 px-6 font-medium">Email</th>
              <th className="py-3 px-6 font-medium">Phone</th>
              <th className="py-3 px-6 font-medium">Role</th>
              <th className="py-3 px-6 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-500">
                  No admins found.
                </td>
              </tr>
            ) : (
              filtered.map((admin) => {
                const isYou = admin.id === CURRENT_ADMIN.id;
                const initials = (admin.name || admin.email)
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase() ?? "")
                  .join("");

                return (
                  <tr
                    key={admin.id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#E6EDE8] text-[#2D266C] flex items-center justify-center text-xs font-semibold">
                          {initials || "A"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {admin.name || "Admin"}
                          </p>
                          {isYou ? (
                            <p className="text-xs text-green-700">You</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{admin.email}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {admin.phone || "—"}
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={admin.role}
                        onChange={(e) =>
                          handleRoleChange(
                            admin.id,
                            e.target.value as AdminRole,
                          )
                        }
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                      >
                        {ROLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {formatDate(admin.createdAt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
