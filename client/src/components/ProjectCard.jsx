import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectMembers } from "../api/projects";
import InviteMemberModal from "../modals/InviteMemberModal";
import { useAuth } from "../context/AuthContext";

function ProjectCard({ project, selected, onSelect }) {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const formattedDate = new Date(project.created_at).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  const [members, setMembers] = useState([]);

  useEffect(() => {
    getProjectMembers(project.id)
      .then((res) => {
        setMembers(res.data.members || []);
      })
      .catch(() => {});
  }, [project.id]);

  return (
    <div
      onClick={onSelect}
      className={`card-hover group bg-[#141414] border rounded-xl p-5 flex flex-col gap-4 cursor-pointer transition-all duration-200 ${
        selected
          ? "border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          : "border-[#222] hover:border-[#333]"
      }`}
    >
      {showModal && (
        <InviteMemberModal
          project={project}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-white group-hover:text-white transition-colors">
            {project.name}
          </h3>
          <p className="text-xs text-[#444] mt-0.5">Created {formattedDate}</p>
        </div>
        {user.id === project.owner_id && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            className="btn-hover text-xs text-[#444] hover:text-white border border-[#222] hover:border-[#3a3a3a] px-2.5 py-1 rounded-lg transition-all shrink-0"
          >
            + Invite
          </button>
        )}
      </div>

      {/* Members */}
      <div className="flex items-center gap-1.5 flex-wrap min-h-[24px]">
        {members.map((member, i) => (
          <span
            key={i}
            className="px-2.5 py-1 bg-[#1e1e1e] border border-[#2a2a2a] text-[#777] text-xs rounded-full
              hover:border-[#3a3a3a] hover:text-[#aaa] transition-colors cursor-default"
          >
            {member.name}
          </span>
        ))}
      </div>

      {/* Open Board */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/project/${project.id}`);
        }}
        className="btn-hover w-full text-center py-2 rounded-lg border border-[#222] text-xs text-[#444]
          hover:border-white/20 hover:text-white hover:bg-white/5 transition-all duration-200 group/btn"
      >
        <span className="inline-flex items-center gap-1.5">
          Open Board
          <span className="transition-transform duration-200 group-hover/btn:translate-x-0.5">
            →
          </span>
        </span>
      </button>
    </div>
  );
}

export default memo(ProjectCard);
