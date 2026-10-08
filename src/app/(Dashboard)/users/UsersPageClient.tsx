"use client";

import { FormEvent, useMemo, useState, type ReactNode } from "react";
import {
  SearchIcon,
  FilterIcon,
  PlusIcon,
  EyesIcon,
  EditIcon,
  DeleteIcon,
  CloseIcon,
  CheckCircleIcon,
  MinusCircleIcon,
  AdminRoleIcon,
} from "../../../../public/svg/svg";
import {
  CURRENT_ADMIN,
  MOCK_ADMINS,
  type AdminStatus,
  type AdminUser,
} from "@/src/lib/mock-data";
import { formatDate, formatTime } from "@/src/lib/format";
import {
  ROLE_LABELS,
  ROLE_OPTIONS,
  ROLE_PERMISSIONS,
  type AdminRole,
} from "@/src/lib/roles";

type Tab = "users" | "roles";
type Drawer = "add" | "details" | "edit" | null;

function getInitials(name: string | null, email: string) {
  return (name || email)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function UserAvatar({
  name,
  email,
  avatarUrl,
  size = 36,
}: {
  name: string | null;
  email: string;
  avatarUrl: string | null;
  size?: number;
}) {
  const initials = getInitials(name, email) || "A";
  return (
    <div
      className="rounded-full bg-[#E6EDE8] text-[#2D266C] flex items-center justify-center font-semibold shrink-0 overflow-hidden relative"
      style={{ width: size, height: size, fontSize: size > 48 ? 20 : 12 }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name || email}
          className="object-cover w-full h-full"
        />
      ) : (
        initials
      )}
    </div>
  );
}

function statusBadge(status?: AdminStatus | null) {
  const resolved = status || "active";
  if (resolved === "active") {
    return (
      <span className="inline-flex items-center justify-center gap-0.5 rounded-full border border-green-600/30 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
        <CheckCircleIcon size={12} />
        Active
      </span>
    );
  }
  if (resolved === "invited") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-600/30 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
        Invited
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
      <MinusCircleIcon size={12} />
      Inactive
    </span>
  );
}

function roleBadge(role: AdminRole) {
  return (
    <span className="inline-flex h-7 items-center justify-center gap-1.5 rounded-full border border-green-600/30 bg-green-50 px-2.5 text-xs font-medium leading-none text-green-800 align-middle">
      <AdminRoleIcon size={13} className="text-[#2D266C]" />
      <span className="leading-none">{ROLE_LABELS[role] || role}</span>
    </span>
  );
}

export default function UsersPageClient() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<AdminUser[]>(MOCK_ADMINS);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminRole>("admin");
  const [inviteMessage, setInviteMessage] = useState("");

  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<AdminRole>("admin");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");
  const [editPhone, setEditPhone] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editOnDuty, setEditOnDuty] = useState(true);

  const currentAdminId = CURRENT_ADMIN.id;
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        (user.name || "").toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q),
    );
  }, [users, query]);

  const openAdd = () => {
    setInviteName("");
    setInviteEmail("");
    setInviteRole("admin");
    setInviteMessage("Hi, you've been invited to join Netan as a team member.");
    setError("");
    setSuccess("");
    setDrawer("add");
  };

  const openDetails = (user: AdminUser) => {
    setSelected(user);
    setDrawer("details");
  };

  const openEdit = (user: AdminUser) => {
    setSelected(user);
    setEditName(user.name || "");
    setEditRole(user.role);
    setEditStatus(user.status === "inactive" ? "inactive" : "active");
    setEditPhone(user.phone || "");
    setEditWhatsapp(user.whatsappNumber || "");
    setEditOnDuty(user.isOnDuty !== false);
    setDrawer("edit");
  };

  const closeDrawer = () => {
    setDrawer(null);
    setSelected(null);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  const handleInvite = (e: FormEvent) => {
    e.preventDefault();
    const next: AdminUser = {
      id: `admin-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      phone: null,
      whatsappNumber: null,
      avatarUrl: null,
      role: inviteRole,
      status: "invited",
      isOnDuty: false,
      createdAt: new Date().toISOString(),
      lastActiveAt: null,
    };
    setUsers((prev) => [next, ...prev]);
    setSuccess("Invite added locally. Backend will send this later.");
    closeDrawer();
  };

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const updated: AdminUser = {
      ...selected,
      name: editName.trim(),
      role: editRole,
      status: selected.status === "invited" ? selected.status : editStatus,
      phone: editPhone.trim() || null,
      whatsappNumber: editWhatsapp.trim() || null,
      isOnDuty: editOnDuty,
    };
    setUsers((prev) =>
      prev.map((user) => (user.id === updated.id ? updated : user)),
    );
    setSelected(updated);
    setDrawer("details");
    setSuccess("User updated");
  };

  const handleDelete = (user: AdminUser) => {
    if (user.id === currentAdminId) {
      setError("You cannot delete your own account");
      return;
    }
    if (
      !window.confirm(
        `Delete ${user.name || user.email}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setUsers((prev) => prev.filter((item) => item.id !== user.id));
    if (selected?.id === user.id) closeDrawer();
    setSuccess("User deleted");
  };

  return (
    <div className="relative">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500 mt-1">
            View team members and control access
          </p>
        </div>
        {tab === "users" ? (
          <button
            type="button"
            onClick={openAdd}
            className="self-start inline-flex items-center gap-2 rounded-lg bg-[#2D266C] px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800"
          >
            <PlusIcon size={16} />
            Add user
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-6 border-b border-gray-200 mb-5">
        {(
          [
            { id: "users", label: "Users" },
            { id: "roles", label: "Roles & permissions" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === item.id
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          {success}
        </p>
      ) : null}

      {tab === "users" ? (
        <>
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
                  <th className="py-3 px-5 font-medium">Email</th>
                  <th className="py-3 px-5 font-medium">Role</th>
                  <th className="py-3 px-5 font-medium">Date added</th>
                  <th className="py-3 px-5 font-medium">Status</th>
                  <th className="py-3 px-5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3 min-w-0">
                          <UserAvatar
                            name={user.name}
                            email={user.email}
                            avatarUrl={user.avatarUrl}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {user.name || "—"}
                            </p>
                            {user.id === currentAdminId ? (
                              <p className="text-xs text-green-700">You</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-gray-600">{user.email}</td>
                      <td className="py-4 px-5">{roleBadge(user.role)}</td>
                      <td className="py-4 px-5 text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-4 px-5">
                        {statusBadge(user.status || "active")}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2 text-gray-500">
                          <button
                            type="button"
                            onClick={() => openDetails(user)}
                            className="p-1.5 rounded-md hover:bg-gray-50 hover:text-gray-800"
                            aria-label="View user"
                          >
                            <EyesIcon size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(user)}
                            className="p-1.5 rounded-md hover:bg-gray-50 hover:text-gray-800"
                            aria-label="Edit user"
                          >
                            <EditIcon size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            disabled={user.id === currentAdminId}
                            className="p-1.5 rounded-md hover:bg-red-50 text-red-500 disabled:opacity-40"
                            aria-label="Delete user"
                          >
                            <DeleteIcon size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <form className="flex items-center justify-between gap-3 mb-4 min-w-0">
            <div className="relative w-full max-w-xs min-w-0">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <SearchIcon size={16} />
              </div>
              <input
                type="text"
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
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="py-3 px-5 font-medium">Title</th>
                  <th className="py-3 px-5 font-medium">Permissions</th>
                  <th className="py-3 px-5 font-medium w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ROLE_OPTIONS.map((role) => (
                  <tr
                    key={role.value}
                    className="border-b border-gray-100 align-top"
                  >
                    <td className="py-4 px-5 font-medium text-gray-900 whitespace-nowrap">
                      {role.label}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap gap-2">
                        {ROLE_PERMISSIONS[role.value].map((perm) => (
                          <span
                            key={perm}
                            className="inline-flex items-center rounded-full border border-gray-300 bg-transparent px-2.5 py-2 text-xs text-gray-700"
                          >
                            <span className="border-l border-gray-300 pl-2 leading-none">
                              {perm}
                            </span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="p-1.5" title="System role">
                          <EditIcon size={16} />
                        </span>
                        <span
                          className="p-1.5 text-red-300"
                          title="System role"
                        >
                          <DeleteIcon size={16} />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {drawer ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close drawer"
            onClick={closeDrawer}
          />
          <aside className="relative h-full w-full max-w-md bg-white shadow-xl border-l border-gray-100 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {drawer === "add"
                  ? "Add user"
                  : drawer === "edit"
                    ? "Edit user"
                    : "User details"}
              </h2>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-1.5 rounded-md text-gray-500 hover:bg-gray-50"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {drawer === "add" ? (
              <form
                onSubmit={handleInvite}
                className="flex-1 overflow-y-auto px-5 py-5 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name
                  </label>
                  <input
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Enter name"
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600/20"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Invite message (optional)
                  </label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 resize-none"
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#2D266C] hover:bg-green-800 text-white font-medium py-3"
                  >
                    Add user
                  </button>
                </div>
              </form>
            ) : null}

            {drawer === "details" && selected ? (
              <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col">
                <div className="mb-6">
                  <UserAvatar
                    name={selected.name}
                    email={selected.email}
                    avatarUrl={selected.avatarUrl}
                    size={64}
                  />
                </div>

                <div className="space-y-4">
                  <DetailRow label="Name" value={selected.name || "—"} />
                  <DetailRow label="Email" value={selected.email} />
                  <DetailRow label="Phone" value={selected.phone || "—"} />
                  <DetailRow
                    label="WhatsApp (order alerts)"
                    value={selected.whatsappNumber || "—"}
                  />
                  <DetailRow
                    label="On duty"
                    value={selected.isOnDuty !== false ? "Yes" : "No"}
                  />
                  <DetailRow label="Role" value={roleBadge(selected.role)} />
                  <DetailRow
                    label="Date added"
                    value={formatDate(selected.createdAt)}
                  />
                  <DetailRow
                    label="Status"
                    value={statusBadge(selected.status || "active")}
                  />
                  <DetailRow
                    label="Last active"
                    value={
                      selected.lastActiveAt
                        ? `${formatDate(selected.lastActiveAt)} · ${formatTime(selected.lastActiveAt)}`
                        : "—"
                    }
                  />
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(selected)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    <EditIcon size={16} />
                    Edit user
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selected)}
                    disabled={selected.id === currentAdminId}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                  >
                    <DeleteIcon size={16} />
                    Delete user
                  </button>
                </div>
              </div>
            ) : null}

            {drawer === "edit" && selected ? (
              <form
                onSubmit={handleUpdate}
                className="flex-1 overflow-y-auto px-5 py-5 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name
                  </label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Role
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as AdminRole)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600/20"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                {selected.status !== "invited" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) =>
                        setEditStatus(e.target.value as "active" | "inactive")
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600/20"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                ) : null}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone
                  </label>
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+2348012345678"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    WhatsApp (new order alerts)
                  </label>
                  <input
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    placeholder="+2348012345678"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editOnDuty}
                    onChange={(e) => setEditOnDuty(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  On duty — receive new order WhatsApp alerts
                </label>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#2D266C] hover:bg-green-800 text-white font-medium py-3"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            ) : null}
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-gray-400 shrink-0">{label}</p>
      <div className="text-sm text-gray-900 text-right min-w-0">
        {typeof value === "string" ? <p>{value}</p> : value}
      </div>
    </div>
  );
}
