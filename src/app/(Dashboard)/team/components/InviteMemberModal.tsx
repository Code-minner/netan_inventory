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
  const [emailFailed, setEmailFailed] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [invited, setInvited] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setRole("Admin");
    setError("");
    setSuccess("");
    setEmailFailed(false);
    setInviteUrl("");
    setCopied(false);
    setInvited(false);
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const copyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (invited) return;
    setLoading(true);
    setError("");
    setSuccess("");
    setEmailFailed(false);
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
      setInvited(true);

      if (data.emailSent) {
        setSuccess("Invite sent successfully.");
      } else {
        setEmailFailed(true);
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
            className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {invited ? "Close" : "Cancel"}
          </button>
          {!invited ? (
            <button
              type="submit"
              form="invite-member-form"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#2E2A5C] rounded-lg hover:bg-[#25214a] disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send invite"}
            </button>
          ) : null}
        </>
      }
    >
      <form
        id="invite-member-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <p className="text-sm text-gray-500">
          We&apos;ll email an invite link so they can join the workspace.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={invited}
            placeholder="Enter name"
            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#2E2A5C]/40 disabled:bg-gray-50"
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
            disabled={invited}
            placeholder="name@company.com"
            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#2E2A5C]/40 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={invited}
            className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-lg outline-none bg-white focus:border-[#2E2A5C]/40 disabled:bg-gray-50"
          >
            {STAFF_ROLE_OPTIONS.filter((option) =>
              admin?.role === "Superadmin"
                ? true
                : option.value !== "Superadmin",
            ).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2.5">
            {error}
          </p>
        ) : null}
        {success ? (
          <p
            className={`text-sm rounded-lg px-3 py-2.5 ${
              emailFailed
                ? "text-amber-800 bg-amber-50"
                : "text-green-700 bg-green-50"
            }`}
          >
            {success}
          </p>
        ) : null}
        {inviteUrl ? (
          <div className="rounded-lg border border-dashed border-gray-200 px-3.5 py-3 space-y-2">
            <p className="text-xs text-gray-400">Invite link</p>
            <p className="text-sm text-[#2E2A5C] break-all">{inviteUrl}</p>
            <button
              type="button"
              onClick={() => void copyLink()}
              className="text-sm font-medium text-[#2E2A5C] hover:underline"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
