"use client";

import { UserRound } from "lucide-react";

// WORKSHOP_LOGGED_IN_USER_V1
export default function LoggedInUser({ currentUser }) {
  if (!currentUser) return null;

  const name =
    currentUser.name ||
    currentUser.full_name ||
    currentUser.username ||
    "User";

  const username = currentUser.username || "";
  const role = currentUser.role || "";

  return (
    <div
      className="print:hidden inline-flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
      title={`${name} - ${role}`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
        <UserRound size={20} />
      </div>

      <div className="min-w-0 text-left leading-tight">
        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Logged in as
        </div>

        <div className="break-words text-sm font-black text-slate-900">
          {name}
        </div>

        <div className="text-xs font-semibold text-violet-700">
          {username && username !== name
            ? `${username} | ${role}`
            : role}
        </div>
      </div>
    </div>
  );
}