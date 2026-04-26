import express from "express";
const router = express.Router();
import * as documentController from "../controllers/documentController.js";

router.get("/:projId", documentController.getDocuments);
router.get("/:projId/:docId", documentController.getDocument);
router.post("/:projId", documentController.createDocument);
router.put("/:projId/:docId", documentController.updateDocument);
router.delete("/:projId/:docId", documentController.deleteDocument);

export default router;
