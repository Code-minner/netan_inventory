"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, MoreVertical } from "lucide-react";
import InviteMemberModal from "./InviteMemberModal";
import Modal from "@/src/components/Modal";
import { apiFetch } from "@/src/lib/api";
import type { MemberStatus, TeamMember } from "@/src/lib/types";
import { useAuth } from "@/src/components/AuthProvider";

function StatusBadge({ status }: { status: MemberStatus }) {
  const styles =
    status === "Active"
      ? "bg-green-50 text-green-600"
      : status === "Invited"
        ? "bg-violet-50 text-violet-600"
        : "bg-amber-50 text-amber-500";

  return (
    <span
      className={`inline-block whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${styles}`}
    >
      {status}
    </span>
  );
}

export default function TeamTable() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { canWrite } = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ team: TeamMember[] }>("/api/team");
      setMembers(data.team);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase()),
    );
  }, [members, search]);

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100 p-7 sm:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8">
        <h2 className="text-base font-semibold text-gray-900">Team Member</h2>
        {canWrite ? (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#2E2A5C] text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-[#25214a]"
          >
            <span className="text-base leading-none">+</span>
            Invite Member
          </button>
        ) : null}
      </div>

      <div className="relative w-full sm:w-72 pb-8">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          size={16}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search team member"
          className="w-full pl-10 pr-3 py-2.5 text-sm text-gray-600 placeholder:text-gray-400 border border-gray-200 rounded-xl outline-none focus:border-gray-300"
        />
      </div>

      <div className="hidden md:flex items-center px-4 pb-4 text-gray-400 text-sm">
        <div className="w-[28%]">Name</div>
        <div className="w-[26%]">Email</div>
        <div className="w-[16%]">Role</div>
        <div className="w-[16%]">Joined</div>
        <div className="w-[10%]">Status</div>
        <div className="w-[4%]" />
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center text-sm text-gray-400 py-16">
            Loading team…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-16">
            No team members found.
          </div>
        ) : (
          filtered.map((member) => (
            <div
              key={member.id}
              className="flex items-center border border-gray-100 rounded-2xl px-5 py-5 hover:border-gray-200 transition-colors"
            >
              <div className="w-[28%] flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 shrink-0 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center text-xs font-semibold">
                  {member.initials}
                </span>
                <span className="text-gray-800 text-sm font-medium truncate">
                  {member.name}
                </span>
              </div>

              <div className="w-[26%] text-gray-700 text-sm truncate pr-2">
                {member.email}
              </div>
              <div className="w-[16%] text-gray-700 text-sm">{member.role}</div>
              <div className="w-[16%] text-gray-700 text-sm">
                {member.joined}
              </div>

              <div className="w-[10%]">
                <StatusBadge status={member.status} />
              </div>

              <div className="w-[4%] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedMember(member)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label={`View ${member.name}`}
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <InviteMemberModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={() => load()}
      />

      <Modal
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
        title="Member details"
        widthClassName="max-w-lg"
        footer={
          <button
            type="button"
            onClick={() => setSelectedMember(null)}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#2E2A5C] rounded-xl hover:bg-[#25214a]"
          >
            Close
          </button>
        }
      >
        {selectedMember ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="w-14 h-14 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center text-sm font-semibold">
                {selectedMember.initials}
              </span>
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  {selectedMember.name}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedMember.email}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3.5 text-sm">
              <div className="rounded-xl bg-gray-50 px-3.5 py-3.5">
                <p className="text-xs text-gray-400 mb-1">Role</p>
                <p className="font-medium text-gray-900">
                  {selectedMember.role}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3.5 py-3.5">
                <p className="text-xs text-gray-400 mb-1">Joined</p>
                <p className="font-medium text-gray-900">
                  {selectedMember.joined}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3.5 py-3.5">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className="font-medium text-gray-900">
                  {selectedMember.status}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
