import express from "express";
import * as tasksController from "../controllers/tasksController.js";

const router = express.Router();

router.get("/:projectId", tasksController.getTasks);
router.post("/:projectId", tasksController.addTask);
router.put("/:projectId/:taskId", tasksController.updateTask);
router.delete("/:projectId/:taskId", tasksController.deleteTask);
router.patch("/:projectId/:taskId/assign", tasksController.assignTask);
router.patch("/:projectId/:taskId/unassign", tasksController.unassignTask);
router.patch("/:projectId/:taskId/status", tasksController.updateTaskStatus);

export default router;
