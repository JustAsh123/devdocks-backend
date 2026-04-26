import express from "express";
const router = express.Router();
import * as projectController from "../controllers/projectController.js";

router.get("/load", projectController.loadProject);
router.get("/members/:projId", projectController.getProjectMembers);
router.get("/members-stats/:projId", projectController.getMembersStats);
router.get("/invites", projectController.getInvites);
router.post("/create", projectController.createProject);
router.post("/invite", projectController.projectInvite);
router.post("/response", projectController.inviteResponse);
router.delete("/members/:projId/:memberId", projectController.removeMember);

export default router;
