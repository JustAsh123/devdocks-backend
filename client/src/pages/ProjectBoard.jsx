import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AddTaskModal from "../modals/AddTaskModal";
import TaskDetailModal from "../modals/TaskDetailModal";
import { getTasks, updateTaskStatus } from "../api/tasks";
import { getProjects, getMembersStats } from "../api/projects";
import { getDocuments } from "../api/documents";

// ── Column config ─────────────────────────────────────────────────────────────
const COLUMNS = [
  {
    id: "backlog",
    label: "Backlog",
    color: "text-[#888]",
    dot: "bg-[#555]",
    border: "border-[#2a2a2a]",
    dropBg: "bg-[#1a1a1a]/60",
  },
  {
    id: "todo",
    label: "Todo",
    color: "text-blue-400",
    dot: "bg-blue-500",
    border: "border-blue-500/20",
    dropBg: "bg-blue-500/5",
  },
  {
    id: "in_progress",
    label: "In Progress",
    color: "text-amber-400",
    dot: "bg-amber-500",
    border: "border-amber-500/20",
    dropBg: "bg-amber-500/5",
  },
  {
    id: "done",
    label: "Done",
    color: "text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-500/20",
    dropBg: "bg-emerald-500/5",
  },
];

const PRIORITY_STYLES = {
  low: "text-[#777] bg-[#1e1e1e] border-[#2a2a2a]",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  high: "text-red-400 bg-red-500/10 border-red-500/30",
};

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onDragStart, onClick }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onClick(task)}
      className="card-hover group bg-[#1a1a1a] border border-[#262626] rounded-xl p-3.5 cursor-pointer
        hover:border-[#383838] hover:bg-[#1e1e1e] active:opacity-70 select-none"
    >
      {/* Priority badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-white leading-snug">
          {task.title}
        </p>
        <span
          className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full border capitalize ${
            PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
          }`}
        >
          {task.priority || "medium"}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-[#555] mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Assignee */}
      <div className="flex items-center gap-2 mt-auto">
        {task.assignee_name ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-[9px] font-bold text-white">
              {task.assignee_name[0].toUpperCase()}
            </div>
            <span className="text-[11px] text-[#666]">
              {task.assignee_name}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-[#3a3a3a]">Unassigned</span>
        )}
      </div>
    </div>
  );
}

// ── Kanban Column ─────────────────────────────────────────────────────────────
function KanbanColumn({
  col,
  tasks,
  onDrop,
  onDragOver,
  onDragLeave,
  isDragOver,
  onTaskClick,
  onAddTask,
}) {
  return (
    <div
      className="animate-slideUp flex flex-col min-w-[280px] max-w-[280px]"
      style={{
        animationDelay: `${COLUMNS.findIndex((c) => c.id === col.id) * 70}ms`,
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${col.dot}`} />
          <span className={`text-sm font-medium ${col.color}`}>
            {col.label}
          </span>
          <span className="text-xs text-[#444] font-mono">{tasks.length}</span>
        </div>
        <button
          onClick={() => onAddTask(col.id)}
          className="text-[#444] hover:text-[#888] transition-colors text-lg leading-none"
          title="Add task"
        >
          +
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDrop={(e) => onDrop(e, col.id)}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`flex-1 rounded-xl border p-2 min-h-[480px] transition-all duration-150 ${col.border} ${
          isDragOver
            ? col.dropBg + " border-dashed scale-[1.01]"
            : "bg-[#111]/50"
        }`}
      >
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={(e, t) => {
                e.dataTransfer.setData("taskId", t.id);
                e.dataTransfer.setData("fromStatus", t.status);
              }}
              onClick={onTaskClick}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-32 text-[#333] text-xs">
              Drop tasks here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Project Members Sidebar ───────────────────────────────────────────────────
function BoardMembers({ projectId }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!projectId) return;
    getMembersStats(projectId)
      .then((res) => setMembers(res.data.members || []))
      .catch(() => {});
  }, [projectId]);

  return (
    <div className="w-72 border-l border-[#1a1a1a] bg-[#0c0c0c] flex flex-col">
      <div className="px-6 py-5 border-b border-[#1a1a1a]">
        <h3 className="text-sm font-semibold text-white">Team Workload</h3>
        <p className="text-xs text-[#555] mt-1">
          {members.length} active members
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between p-3 rounded-xl bg-[#141414] border border-[#1e1e1e] hover:border-[#2a2a2a] transition-colors"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {m.name[0].toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-[#e0e0e0] truncate">
                  {m.name}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${m.task_count > 0 ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" : "text-[#555] bg-[#1a1a1a]"}`}
            >
              {m.task_count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Documents Carousel ────────────────────────────────────────────────────────
function DocsCarousel({ projectId, navigate }) {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    if (!projectId) return;
    getDocuments(projectId)
      .then((res) => setDocs(res.data.documents || []))
      .catch(() => {});
  }, [projectId]);

  if (docs.length === 0) return null;

  return (
    <div className="border-t border-[#1a1a1a] bg-[#0c0c0c] px-8 py-6 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <svg
            className="w-4 h-4 text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          Project Documents
        </h3>
        <button
          onClick={() => navigate(`/project/${projectId}/docs`)}
          className="text-xs text-[#555] hover:text-white transition-colors"
        >
          View All →
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {docs.map((doc) => (
          <button
            key={doc.id}
            onClick={() => navigate(`/project/${projectId}/docs`)}
            className="flex-shrink-0 w-64 p-4 text-left rounded-xl border border-[#2a2a2a] bg-[#141414] hover:bg-[#1e1e1e] hover:border-[#3a3a3a] transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#222] flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                📄
              </div>
              <span className="text-[10px] font-medium text-[#555] group-hover:text-[#888]">
                {new Date(doc.updated_at).toLocaleDateString()}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-[#e0e0e0] truncate">
              {doc.title || "Untitled Document"}
            </h4>
            <p className="text-[11px] text-[#666] mt-1.5 truncate font-medium">
              By {doc.created_by_name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Board Page ───────────────────────────────────────────────────────────
export default function ProjectBoard() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addToStatus, setAddToStatus] = useState("todo");
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch project name
  useEffect(() => {
    getProjects()
      .then((res) => {
        const proj = (res.data.projects || []).find((p) => p.id === projectId);
        if (proj) setProjectName(proj.name);
      })
      .catch(() => {});
  }, [projectId]);

  // Fetch tasks
  const loadTasks = useCallback(async () => {
    try {
      const res = await getTasks(projectId);
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, toStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData("taskId");
    const fromStatus = e.dataTransfer.getData("fromStatus");
    if (!taskId || fromStatus === toStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: toStatus } : t)),
    );
    try {
      await updateTaskStatus(projectId, taskId, toStatus);
    } catch {
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: fromStatus } : t)),
      );
    }
  };

  const handleTaskAdded = (newTask) => {
    setTasks((prev) => [{ ...newTask, status: addToStatus }, ...prev]);
    loadTasks(); // re-sync with server
  };

  const handleOpenAdd = (status) => {
    setAddToStatus(status);
    setShowAddModal(true);
  };

  const columnTasks = (colId) => tasks.filter((t) => t.status === colId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#444] text-sm">
          <span className="w-4 h-4 rounded-full border-2 border-[#333] border-t-[#666] animate-spin" />
          Loading board...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      <Navbar />

      {/* Board header */}
      <div className="px-8 pt-6 pb-4 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-[#555] hover:text-white transition-colors text-sm"
          >
            ← Dashboard
          </button>
          <span className="text-[#333]">/</span>
          <span className="text-white text-sm font-medium">
            {projectName || "Project"}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Board</h1>
            <p className="text-xs text-[#444] mt-0.5">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/project/${projectId}/docs`)}
              className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 text-sm font-medium rounded-lg transition-all flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              Project Docs
            </button>
            <button
              onClick={() => handleOpenAdd("todo")}
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#e0e0e0] transition-colors"
            >
              + New Task
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Kanban & Docs Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Kanban columns */}
          <div className="flex-1 overflow-x-auto px-8 py-6">
            <div
              className="flex gap-5 h-full"
              style={{ minWidth: "max-content" }}
            >
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  col={col}
                  tasks={columnTasks(col.id)}
                  isDragOver={dragOverCol === col.id}
                  onDragOver={(e) => {
                    handleDragOver(e);
                    setDragOverCol(col.id);
                  }}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={handleDrop}
                  onTaskClick={setSelectedTask}
                  onAddTask={handleOpenAdd}
                />
              ))}
            </div>
          </div>

          {/* Documents Carousel */}
          <DocsCarousel projectId={projectId} navigate={navigate} />
        </div>

        {/* Right Sidebar: Members */}
        <BoardMembers projectId={projectId} />
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddTaskModal
          projectId={projectId}
          onClose={() => setShowAddModal(false)}
          onAdd={handleTaskAdded}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={projectId}
          onClose={() => setSelectedTask(null)}
          onUpdate={loadTasks}
          onDelete={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
        />
      )}
    </div>
  );
}
