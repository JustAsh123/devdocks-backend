import express from "express";
import * as tasksController from "../controllers/tasksController.js";

const router = express.Router();

// tokenValidator is applied to /tasks in script.js

// ── Project-scoped task routes ────────────────────────────────────────────────
// GET    /tasks/:projectId            → list all tasks in a project
router.get("/:projectId", tasksController.getTasks);

// POST   /tasks/:projectId            → create a new task
router.post("/:projectId", tasksController.addTask);

// PUT    /tasks/:projectId/:taskId    → update task title / description
router.put("/:projectId/:taskId", tasksController.updateTask);

// DELETE /tasks/:projectId/:taskId    → delete a task
router.delete("/:projectId/:taskId", tasksController.deleteTask);

// PATCH  /tasks/:projectId/:taskId/assign    → assign to a member
router.patch("/:projectId/:taskId/assign", tasksController.assignTask);

// PATCH  /tasks/:projectId/:taskId/unassign  → remove assignee
router.patch("/:projectId/:taskId/unassign", tasksController.unassignTask);

// PATCH  /tasks/:projectId/:taskId/status    → update status
router.patch("/:projectId/:taskId/status", tasksController.updateTaskStatus);

export default router;
