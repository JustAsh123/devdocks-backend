import * as tasksService from "../services/tasksService.js";

// GET /tasks/:projectId
export const getTasks = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  const result = await tasksService.getTasks(projectId, userId);
  if (!result.success) {
    return res.status(403).json({ success: false, message: result.error });
  }
  return res.json({ success: true, tasks: result.data });
};

// POST /tasks/:projectId
export const addTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, priority } = req.body;
  const userId = req.user.id;

  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });
  }

  const result = await tasksService.addTask(
    title,
    description || "",
    projectId,
    userId,
    priority,  // optional, defaults to "medium" in service
  );
  if (!result.success) {
    return res.status(403).json({ success: false, message: result.error });
  }
  return res.status(201).json({ success: true, task: result.data });
};

// PUT /tasks/:projectId/:taskId
export const updateTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title, description } = req.body;
  const userId = req.user.id;

  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });
  }

  const result = await tasksService.updateTask(
    taskId,
    projectId,
    userId,
    title,
    description || "",
  );
  if (!result.success) {
    return res.status(403).json({ success: false, message: result.error });
  }
  return res.json({ success: true, task: result.data });
};

// DELETE /tasks/:projectId/:taskId
export const deleteTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  const userId = req.user.id;

  const result = await tasksService.deleteTask(taskId, projectId, userId);
  if (!result.success) {
    return res.status(403).json({ success: false, message: result.error });
  }
  return res.json({ success: true, message: result.message });
};

// PATCH /tasks/:projectId/:taskId/assign
export const assignTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  const { assigneeId } = req.body;
  const userId = req.user.id;

  if (!assigneeId) {
    return res
      .status(400)
      .json({ success: false, message: "assigneeId is required" });
  }

  const result = await tasksService.assignTask(
    taskId,
    projectId,
    assigneeId,
    userId,
  );
  if (!result.success) {
    return res.status(403).json({ success: false, message: result.error });
  }
  return res.json({ success: true, task: result.data });
};

// PATCH /tasks/:projectId/:taskId/unassign
export const unassignTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  const userId = req.user.id;

  const result = await tasksService.unassignTask(taskId, projectId, userId);
  if (!result.success) {
    return res.status(403).json({ success: false, message: result.error });
  }
  return res.json({ success: true, task: result.data });
};

// PATCH /tasks/:projectId/:taskId/status
export const updateTaskStatus = async (req, res) => {
  const { projectId, taskId } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  if (!status) {
    return res
      .status(400)
      .json({ success: false, message: "status is required" });
  }

  const result = await tasksService.updateTaskStatus(
    taskId,
    projectId,
    userId,
    status,
  );
  if (!result.success) {
    return res.status(400).json({ success: false, message: result.error });
  }
  return res.json({ success: true, task: result.data });
};
