import { useState } from "react";
import { createProject } from "../api/projects";
import { toast } from "react-toastify";

export default function CreateProjectModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await createProject(title.trim());
      toast.success(res.data.message || "Project created!");
      onCreate();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="animate-scaleIn bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">New Project</h2>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        <label className="block text-xs text-[#666] mb-1.5">Project Title</label>
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleCreate()}
          placeholder="e.g. API Redesign"
          className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#444]
            focus:outline-none focus:border-[#444] transition-colors"
        />

        <div className="flex items-center justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#666] hover:text-white transition-colors btn-hover">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="btn-hover px-4 py-2 text-sm bg-white text-black rounded-lg font-medium hover:bg-[#e8e8e8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
