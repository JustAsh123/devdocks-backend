import { useState } from "react";
import { inviteToProject } from "../api/projects";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

// project prop: { id, title }
export default function InviteMemberModal({ project, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSend = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await inviteToProject(project.id, email.trim());
      toast.success(res.data.message || "Invite sent!");
      setEmail("");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-white">Invite Member</h2>
          <button
            onClick={onClose}
            className="text-[#666] hover:text-white text-xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-[#555] mb-5">
          Project: <span className="text-[#777]">{project.title}</span>
        </p>

        <label className="block text-sm text-[#888] mb-1.5">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
          placeholder="member@example.com"
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition-colors"
        />

        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#888] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-4 py-2 text-sm bg-white text-black rounded-lg font-medium hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}
