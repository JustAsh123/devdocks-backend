import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import ReactMarkdown from "react-markdown";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../api/documents";
import { getProjects } from "../api/projects";

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function timeAgo(dateParam) {
  if (!dateParam) return "";
  const date = new Date(dateParam);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function DocRow({ doc, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all ${
        active
          ? "bg-[#1e1e1e] border-[#333] text-white"
          : "bg-transparent border-transparent text-[#888] hover:bg-[#161616] hover:text-[#ccc] hover:border-[#222]"
      }`}
    >
      <p className="text-sm font-medium truncate leading-snug">{doc.title}</p>
      <p className="text-[11px] text-[#444] mt-0.5 truncate">
        {doc.created_by_name} · {fmtDate(doc.updated_at)}
      </p>
    </button>
  );
}

// SimpleMDE config
const mdeOptions = {
  spellChecker: false,
  status: false,
  minHeight: "calc(100vh - 200px)",
  toolbar: [
    "bold",
    "italic",
    "heading",
    "|",
    "quote",
    "unordered-list",
    "ordered-list",
    "|",
    "link",
    "image",
    "|",
    "guide",
  ],
};

// Isolated editor — owns its own title/content state so typing never re-renders the parent
function DocEditor({
  projectId,
  doc,
  initialTitle,
  initialContent,
  onSaved,
  onDeleted,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const saveTimerRef = useRef(null);

  // Debounced auto-save — fires 1.5 s after user stops typing
  const scheduleAutoSave = (nextTitle, nextContent) => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await updateDocument(projectId, doc.id, nextTitle, nextContent);
        setIsDirty(false);
        onSaved(doc.id, nextTitle);
      } catch {
        // Silent — user can hit Save manually
      }
    }, 1500);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    setIsDirty(true);
    scheduleAutoSave(val, content);
  };

  const handleContentChange = (val = "") => {
    setContent(val);
    setIsDirty(true);
    scheduleAutoSave(title, val);
  };

  const handleSave = async () => {
    clearTimeout(saveTimerRef.current);
    setSaving(true);
    try {
      await updateDocument(projectId, doc.id, title, content);
      setIsDirty(false);
      onSaved(doc.id, title);
      toast.success("Saved");
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${title}"?`)) return;
    setDeleting(true);
    try {
      await deleteDocument(projectId, doc.id);
      toast.success("Document deleted");
      onDeleted(doc.id);
    } catch (err) {
      toast.error(err.message || "Failed to delete");
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-start justify-between px-8 py-6 border-b border-[#1a1a1a] shrink-0">
        <div className="flex-1 mr-6 overflow-hidden">
          {isEditing ? (
            <input
              value={title}
              onChange={handleTitleChange}
              className="w-full bg-transparent text-white font-bold text-3xl outline-none truncate placeholder:text-[#555]"
              placeholder="Untitled Document"
              autoFocus
            />
          ) : (
            <h1 className="text-white font-bold text-3xl truncate">
              {title || "Untitled Document"}
            </h1>
          )}
          <p className="text-[13px] text-[#555] mt-2 truncate font-medium">
            Created by{" "}
            <span className="text-[#888]">
              {doc.created_by_name || "Unknown"}
            </span>{" "}
            <span className="mx-1.5 text-[#333]">•</span> Last edited{" "}
            {timeAgo(doc.updated_at)}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 mt-1">
          {isDirty && (
            <span className="text-[11px] text-[#444] animate-fadeIn">
              Unsaved
            </span>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`text-xs font-medium transition-colors ${
              isEditing
                ? "text-[#888] hover:text-white"
                : "text-blue-400 hover:text-blue-300"
            }`}
          >
            {isEditing ? "Done Editing" : "Edit Document"}
          </button>

          <div className="w-px h-4 bg-[#2a2a2a]" />

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-red-400/60 hover:text-red-400 transition-colors disabled:opacity-40"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>

          {isEditing && (
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="px-3.5 py-1.5 bg-white text-black text-xs font-medium rounded-lg hover:bg-[#e0e0e0] transition-colors disabled:opacity-40 ml-1"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden bg-[#0f0f0f]">
        {isEditing ? (
          <div className="flex h-full w-full">
            <div className="flex-1 border-r border-[#1a1a1a] h-full mde-dark-theme p-4 overflow-y-auto">
              <SimpleMDE
                value={content}
                onChange={handleContentChange}
                options={mdeOptions}
              />
            </div>
            <div className="flex-1 h-full overflow-y-auto px-8 py-6 text-[#d4d4d4] prose prose-invert max-w-none">
              <ReactMarkdown>{content || "*Empty document*"}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-10 py-8 text-[#d4d4d4] prose prose-invert max-w-3xl mx-auto">
            <ReactMarkdown>{content || "*Empty document*"}</ReactMarkdown>
          </div>
        )}
      </div>
    </>
  );
}

export default function Documents() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [docs, setDocs] = useState([]);
  const [activeDocMeta, setActiveDocMeta] = useState(null); // lightweight: { id, title, content }
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    getProjects()
      .then((res) => {
        const proj = (res.data.projects || []).find((p) => p.id === projectId);
        if (proj) setProjectName(proj.name);
      })
      .catch(() => {});
  }, [projectId]);

  const loadDocs = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await getDocuments(projectId);
      setDocs(res.data.documents || []);
    } catch {
      setDocs([]);
    } finally {
      setLoadingList(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const openDoc = async (doc) => {
    if (activeDocMeta?.id === doc.id) return;
    setLoadingDoc(true);
    setActiveDocMeta(null);
    try {
      const res = await getDocument(projectId, doc.id);
      const full = res.data.document;
      setActiveDocMeta({
        id: full.id,
        title: full.title,
        content: full.content || "",
        created_by_name: full.created_by_name,
        updated_at: full.updated_at,
      });
    } catch {
      toast.error("Failed to load document");
    } finally {
      setLoadingDoc(false);
    }
  };

  // Called by DocEditor after a save — update sidebar title + timestamp
  const handleSaved = (docId, newTitle) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === docId
          ? { ...d, title: newTitle, updated_at: new Date().toISOString() }
          : d,
      ),
    );
  };

  // Called by DocEditor after a delete
  const handleDeleted = (docId) => {
    setDocs((prev) => prev.filter((d) => d.id !== docId));
    setActiveDocMeta(null);
  };

  const handleCreate = async () => {
    const t = newTitle.trim();
    if (!t) return;
    setCreating(false);
    try {
      const res = await createDocument(projectId, t);
      const doc = res.data.document;
      setDocs((prev) => [{ ...doc, created_by_name: "" }, ...prev]);
      setActiveDocMeta({ id: doc.id, title: doc.title, content: "" });
      setNewTitle("");
      toast.success("Document created");
    } catch (err) {
      toast.error(err.message || "Failed to create document");
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0f0f0f] flex flex-col"
      data-color-mode="dark"
    >
      <Navbar />

      {/* Page header */}
      <div className="px-8 pt-5 pb-4 border-b border-[#1a1a1a] shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate(`/project/${projectId}`)}
            className="text-[#555] hover:text-white transition-colors text-sm"
          >
            ← Board
          </button>
          <span className="text-[#333]">/</span>
          <span className="text-white text-sm font-medium">
            {projectName || "Project"}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Docs</h1>
            <p className="text-xs text-[#444] mt-0.5">
              {docs.length} document{docs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#e0e0e0] transition-colors"
          >
            + New Doc
          </button>
        </div>
      </div>

      {/* New doc input bar */}
      {creating && (
        <div className="animate-slideDown px-8 py-3 border-b border-[#1a1a1a] bg-[#111] flex items-center gap-3 shrink-0">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") {
                setCreating(false);
                setNewTitle("");
              }
            }}
            placeholder="Document title..."
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded-lg px-3.5 py-2 outline-none focus:border-[#444] placeholder:text-[#444] transition-colors"
          />
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#e0e0e0] transition-colors"
          >
            Create
          </button>
          <button
            onClick={() => {
              setCreating(false);
              setNewTitle("");
            }}
            className="text-[#555] hover:text-white transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r border-[#1a1a1a] flex flex-col overflow-y-auto p-3 gap-1">
          {loadingList ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 bg-[#1a1a1a] rounded-xl animate-pulse"
              />
            ))
          ) : docs.length === 0 ? (
            <p className="text-xs text-[#333] text-center py-10">
              No documents yet.
            </p>
          ) : (
            docs.map((doc) => (
              <DocRow
                key={doc.id}
                doc={doc}
                active={activeDocMeta?.id === doc.id}
                onClick={() => openDoc(doc)}
              />
            ))
          )}
        </aside>

        {/* Editor area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!activeDocMeta && !loadingDoc ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#333]">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
              <p className="text-sm">Select a document to edit</p>
            </div>
          ) : loadingDoc ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="w-5 h-5 rounded-full border-2 border-[#333] border-t-[#666] animate-spin" />
            </div>
          ) : (
            // key=id causes DocEditor to fully remount when switching docs
            // so it never carries over stale state, but also never re-renders mid-typing
            <DocEditor
              key={activeDocMeta.id}
              projectId={projectId}
              doc={activeDocMeta}
              initialTitle={activeDocMeta.title}
              initialContent={activeDocMeta.content}
              onSaved={handleSaved}
              onDeleted={handleDeleted}
            />
          )}
        </main>
      </div>
    </div>
  );
}
