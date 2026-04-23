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
      const { success, message } = res.data;
      if (!success) {
        toast.error(message || "Failed to create project");
        return;
      }
      toast.success(message || "Project created!");
      onCreate(); // signals Dashboard to re-fetch
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">New Project</h2>
          <button
            onClick={onClose}
            className="text-[#666] hover:text-white text-xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        <label className="block text-sm text-[#888] mb-1.5">Project Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleCreate()}
          placeholder="e.g. API Redesign"
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
            onClick={handleCreate}
            disabled={loading}
            className="px-4 py-2 text-sm bg-white text-black rounded-lg font-medium hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
