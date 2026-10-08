"use client";

import TeamTable from "./components/TeamTable";

export default function TeamPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-[22px] font-semibold text-gray-900">Team</h1>
        <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
          Manage your team members and their permissions.
        </p>
      </div>

      <TeamTable />
    </div>
  );
}
