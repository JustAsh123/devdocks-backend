import React from "react";

export default function InviteCard({ invite, loading, onAccept, onReject }) {
  const formattedDate = new Date(invite.created_at).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  return (
    <div className="card-hover animate-slideUp bg-[#141414] border border-[#222] rounded-xl p-5 hover:border-[#333]">
      {/* Project name */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-[#555] mb-0.5 uppercase tracking-wider">
            Project
          </p>
          <p className="text-base font-semibold text-white">{invite.name}</p>
        </div>
        <span className="text-[10px] text-[#444] border border-[#222] px-2 py-0.5 rounded-full">
          {formattedDate}
        </span>
      </div>

      {/* Inviter */}
      <div className="flex items-center gap-2.5 mb-5 bg-[#1a1a1a] border border-[#222] rounded-lg px-3 py-2.5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {invite.inviter_name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-white leading-tight">
            {invite.inviter_name}
          </p>
          <p className="text-xs text-[#555]">{invite.inviter_email}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAccept}
          disabled={loading}
          className="btn-hover flex-1 py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-[#e8e8e8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Accept"}
        </button>
        <button
          onClick={onReject}
          disabled={loading}
          className="btn-hover flex-1 py-2 bg-transparent text-[#666] border border-[#2a2a2a] text-xs font-medium rounded-lg hover:border-red-500/40 hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Decline"}
        </button>
      </div>
    </div>
  );
}
