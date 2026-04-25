import { pool } from "../db.js";

// ── Guard: check if a user is a member of a project ──────────────────────────
export const isMember = async (user_id, project_id) => {
  const query = `
    SELECT 1 FROM project_members 
    WHERE user_id = $1 AND project_id = $2;
    `;
  try {
    const res = await pool.query(query, [user_id, project_id]);
    return res.rowCount > 0;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// ── Guard: check if a task belongs to a project ───────────────────────────────
const taskBelongsToProject = async (task_id, project_id) => {
  const res = await pool.query(
    "SELECT 1 FROM tasks WHERE id = $1 AND project_id = $2",
    [task_id, project_id],
  );
  return res.rowCount > 0;
};

// ── Create a task ─────────────────────────────────────────────────────────────
export const addTask = async (title, description, project_id, user_id, priority = "medium") => {
  const query = `
    INSERT INTO tasks (title, description, project_id, created_by, priority)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
    `;
  try {
    if (!(await isMember(user_id, project_id))) {
      return { success: false, error: "User is not a member of this project" };
    }
    const res = await pool.query(query, [title, description, project_id, user_id, priority]);
    return { success: true, data: res.rows[0] };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
};

// ── Get all tasks for a project ───────────────────────────────────────────────
export const getTasks = async (project_id, user_id) => {
  try {
    if (!(await isMember(user_id, project_id))) {
      return { success: false, error: "User is not a member of this project" };
    }
    const res = await pool.query(
      `SELECT t.*, u.name AS assignee_name 
       FROM tasks t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [project_id],
    );
    return { success: true, data: res.rows };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
};

// ── Update task title / description ──────────────────────────────────────────
export const updateTask = async (
  task_id,
  project_id,
  user_id,
  title,
  description,
) => {
  try {
    if (!(await isMember(user_id, project_id))) {
      return { success: false, error: "User is not a member of this project" };
    }
    if (!(await taskBelongsToProject(task_id, project_id))) {
      return { success: false, error: "Task not found in this project" };
    }
    const res = await pool.query(
      `UPDATE tasks SET title = $1, description = $2 WHERE id = $3 RETURNING *`,
      [title, description, task_id],
    );
    return { success: true, data: res.rows[0] };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
};

// ── Delete a task ─────────────────────────────────────────────────────────────
export const deleteTask = async (task_id, project_id, user_id) => {
  try {
    if (!(await isMember(user_id, project_id))) {
      return { success: false, error: "User is not a member of this project" };
    }
    if (!(await taskBelongsToProject(task_id, project_id))) {
      return { success: false, error: "Task not found in this project" };
    }
    await pool.query("DELETE FROM tasks WHERE id = $1", [task_id]);
    return { success: true, message: "Task deleted successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
};

// ── Assign a task to a project member ────────────────────────────────────────
export const assignTask = async (task_id, project_id, assignee_id, user_id) => {
  try {
    if (!(await isMember(user_id, project_id))) {
      return { success: false, error: "User is not a member of this project" };
    }
    if (!(await taskBelongsToProject(task_id, project_id))) {
      return { success: false, error: "Task not found in this project" };
    }
    if (!(await isMember(assignee_id, project_id))) {
      return {
        success: false,
        error: "Assignee is not a member of this project",
      };
    }
    const res = await pool.query(
      `UPDATE tasks SET assigned_to = $1 WHERE id = $2 RETURNING *`,
      [assignee_id, task_id],
    );
    return { success: true, data: res.rows[0] };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
};

// ── Unassign a task ───────────────────────────────────────────────────────────
export const unassignTask = async (task_id, project_id, user_id) => {
  try {
    if (!(await isMember(user_id, project_id))) {
      return { success: false, error: "User is not a member of this project" };
    }
    if (!(await taskBelongsToProject(task_id, project_id))) {
      return { success: false, error: "Task not found in this project" };
    }
    const res = await pool.query(
      `UPDATE tasks SET assigned_to = NULL WHERE id = $1 RETURNING *`,
      [task_id],
    );
    return { success: true, data: res.rows[0] };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
};

// ── Update task status (todo | in_progress | done) ───────────────────────────
export const updateTaskStatus = async (
  task_id,
  project_id,
  user_id,
  status,
) => {
  const VALID_STATUSES = ["todo", "in_progress", "done", "backlog"];
  if (!VALID_STATUSES.includes(status)) {
    return {
      success: false,
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
    };
  }
  try {
    if (!(await isMember(user_id, project_id))) {
      return { success: false, error: "User is not a member of this project" };
    }
    if (!(await taskBelongsToProject(task_id, project_id))) {
      return { success: false, error: "Task not found in this project" };
    }
    const res = await pool.query(
      `UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *`,
      [status, task_id],
    );
    return { success: true, data: res.rows[0] };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
};
