import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import CreateProjectModal from "../modals/CreateProjectModal";
import { getProjects, getMembersStats, removeMember } from "../api/projects";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

// ── Member panel for a selected project ───────────────────────────────────────
function MemberPanel({ project, currentUserId, onMemberRemoved }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const isOwner = project.owner_id === currentUserId;

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMembersStats(project.id);
      setMembers(res.data.members || []);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRemove = async (memberId, memberName) => {
    if (!confirm(`Remove ${memberName} from "${project.name}"?`)) return;
    setRemovingId(memberId);
    try {
      await removeMember(project.id, memberId);
      toast.success(`${memberName} removed`);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      onMemberRemoved();
    } catch (err) {
      toast.error(err.message || "Failed to remove member");
    } finally {
      setRemovingId(null);
    }
  };

  const total = members.reduce((sum, m) => sum + parseInt(m.task_count), 0);

  return (
    <div className="animate-slideUp flex flex-col gap-4">
      {/* Project header */}
      <div className="border-b border-[#1e1e1e] pb-4">
        <p className="text-[10px] uppercase tracking-widest text-[#444] mb-1">
          Selected Project
        </p>
        <h2 className="text-base font-semibold text-white leading-tight">
          {project.name}
        </h2>
        <p className="text-xs text-[#444] mt-1">
          {members.length} member{members.length !== 1 ? "s" : ""} · {total}{" "}
          task{total !== 1 ? "s" : ""} assigned
        </p>
      </div>

      {/* Member list */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-[#1a1a1a] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : members.length === 0 ? (
        <p className="text-xs text-[#333] text-center py-6">No members yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {members.map((member, i) => {
            const count = parseInt(member.task_count);
            const isOwnerMember = member.id === project.owner_id;
            return (
              <div
                key={member.id}
                className="animate-slideUp group flex items-center gap-3 bg-[#141414] border border-[#1e1e1e] rounded-xl px-3.5 py-3 hover:border-[#2a2a2a] transition-all"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {member.name[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-white truncate">
                      {member.name}
                    </p>
                    {isOwnerMember && (
                      <span className="text-[9px] text-[#555] border border-[#222] px-1.5 py-0.5 rounded-full shrink-0">
                        owner
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#444] truncate">
                    {member.email}
                  </p>
                </div>

                {/* Task count badge */}
                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      count > 0
                        ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                        : "text-[#444] bg-[#1a1a1a] border border-[#222]"
                    }`}
                  >
                    {count} task{count !== 1 ? "s" : ""}
                  </span>

                  {/* Remove button — owner only, can't remove self */}
                  {isOwner && !isOwnerMember && (
                    <button
                      onClick={() => handleRemove(member.id, member.name)}
                      disabled={removingId === member.id}
                      className="opacity-0 group-hover:opacity-100 text-[#444] hover:text-red-400 transition-all text-base leading-none disabled:opacity-30"
                      title="Remove member"
                    >
                      {removingId === member.id ? "…" : "×"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const res = await getProjects();
      const list = res.data.projects || [];
      setProjects(list);
      // Keep selected project in sync if it was removed
      if (selectedProject) {
        const still = list.find((p) => p.id === selectedProject.id);
        setSelectedProject(still || null);
      }
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  }, [selectedProject]);

  useEffect(() => {
    loadProjects();
  }, []); // eslint-disable-line

  const handleSelectProject = (project) => {
    setSelectedProject((prev) => (prev?.id === project.id ? null : project));
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10 flex gap-7">
        {/* ── Left: Member panel ─────────────────────────────────────── */}
        <div
          className={`transition-all duration-300 ease-in-out shrink-0 ${
            selectedProject
              ? "w-72 opacity-100"
              : "w-0 opacity-0 overflow-hidden"
          }`}
        >
          {selectedProject && (
            <MemberPanel
              key={selectedProject.id}
              project={selectedProject}
              currentUserId={user.id}
              onMemberRemoved={loadProjects}
            />
          )}
        </div>

        {/* ── Right: Projects grid ───────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="animate-slideDown flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-white">Projects</h1>
              <p className="text-sm text-[#444] mt-0.5">
                {projects?.length} project{projects?.length !== 1 ? "s" : ""}
                {selectedProject && (
                  <span className="ml-2 text-[#333]">
                    · viewing{" "}
                    <span className="text-[#555]">{selectedProject.name}</span>
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-hover px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#e8e8e8] transition-colors"
            >
              + New Project
            </button>
          </div>

          {projects?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects?.map((project, i) => (
                <div
                  key={project.id}
                  className="animate-slideUp"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <ProjectCard
                    project={project}
                    inviter={user}
                    selected={selectedProject?.id === project.id}
                    onSelect={() => handleSelectProject(project)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-fadeIn text-center py-24 text-[#333] text-sm">
              No projects yet.{" "}
              <button
                onClick={() => setShowCreate(true)}
                className="text-[#555] hover:text-white transition-colors underline underline-offset-2"
              >
                Create your first one.
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreate={() => {
            setShowCreate(false);
            loadProjects();
          }}
        />
      )}
    </div>
  );
}
