"use client";

import { FormEvent, useState } from "react";
import Modal from "@/src/components/Modal";
import { apiFetch } from "@/src/lib/api";
import type { TeamMember } from "@/src/lib/types";
import { STAFF_ROLE_OPTIONS } from "@/src/lib/roles";
import { useAuth } from "@/src/components/AuthProvider";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onInvited?: (member: TeamMember) => void;
};

export default function InviteMemberModal({
  isOpen,
  onClose,
  onInvited,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { admin } = useAuth();
  const [role, setRole] = useState("Admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");

  const reset = () => {
    setName("");
    setEmail("");
    setRole("Admin");
    setError("");
    setSuccess("");
    setInviteUrl("");
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await apiFetch<{
        member: TeamMember;
        emailSent: boolean;
        emailError?: string;
        inviteUrl?: string;
      }>("/api/team", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role,
        }),
      });

      onInvited?.(data.member);
      setInviteUrl(data.inviteUrl || "");

      if (data.emailSent) {
        setSuccess("Invite sent successfully.");
      } else {
        setSuccess(
          `Member added, but email failed${data.emailError ? `: ${data.emailError}` : "."} Copy the invite link below.`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite Member"
      widthClassName="max-w-lg"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="invite-member-form"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#2E2A5C] rounded-xl hover:bg-[#25214a] disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send invite"}
          </button>
        </>
      }
    >
      <form
        id="invite-member-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <p className="text-sm text-gray-500">
          We’ll email an invite link so they can join the workspace.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter name"
            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E2A5C]/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@company.com"
            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#2E2A5C]/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl outline-none bg-white focus:border-[#2E2A5C]/40"
          >
            {STAFF_ROLE_OPTIONS.filter((option) =>
              admin?.role === "Superadmin" ? true : option.value !== "Superadmin",
            ).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2.5">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-green-600 bg-green-50 rounded-xl px-3 py-2.5">
            {success}
          </p>
        ) : null}
        {inviteUrl ? (
          <p className="text-sm text-[#2E2A5C] break-all">{inviteUrl}</p>
        ) : null}
      </form>
    </Modal>
  );
}
