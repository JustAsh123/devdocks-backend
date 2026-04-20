import { useEffect } from "react";

// loading prop: disables buttons while API call is in progress
export default function InviteCard({ invite, onAccept, onReject, loading }) {
  const formattedDate = new Date(invite.created_at).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  useEffect(() => {
    console.log(invite);
  }, []);

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#3a3a3a] transition-colors">
      <div className="mb-3">
        Project: <span className="text-[#999]">{invite.name}</span>
      </div>

      <p className="text-xs text-[#666] mb-1">
        <p className="text-sm font-medium text-white">{invite.inviter_name}</p>
        <p className="text-xs text-[#555]">{invite.inviter_email}</p>
      </p>
      <p className="text-xs text-[#555] mb-4">Invited on {formattedDate}</p>

      <div className="flex items-center gap-2">
        <button
          onClick={onAccept}
          disabled={loading}
          className="px-3.5 py-1.5 bg-white text-black text-xs font-medium rounded-lg hover:bg-[#e0e0e0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Accept"}
        </button>
        <button
          onClick={onReject}
          disabled={loading}
          className="px-3.5 py-1.5 bg-transparent text-[#888] border border-[#2a2a2a] text-xs font-medium rounded-lg hover:border-[#555] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Reject"}
        </button>
      </div>
    </div>
  );
}
