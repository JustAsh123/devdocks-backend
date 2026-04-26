import * as documentService from "../services/documentService.js";

// List all docs for a project
export const getDocuments = async (req, res) => {
  const { projId } = req.params;
  const userId = req.user.id;

  const result = await documentService.getDocuments(projId, userId);
  if (!result.success) {
    return res.status(403).json({ success: false, message: result.message });
  }
  return res.json({ success: true, documents: result.documents });
};

// Get a single doc with its full content
export const getDocument = async (req, res) => {
  const { projId, docId } = req.params;
  const userId = req.user.id;

  const result = await documentService.getDocument(docId, projId, userId);
  if (!result.success) {
    return res.status(result.message === "Access denied" ? 403 : 404).json({
      success: false,
      message: result.message,
    });
  }
  return res.json({ success: true, document: result.document });
};

// Create a new doc
export const createDocument = async (req, res) => {
  const { projId } = req.params;
  const userId = req.user.id;
  const { title, content } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: "Title is required" });
  }

  const result = await documentService.createDocument(projId, userId, title, content);
  if (!result.success) {
    return res.status(403).json({ success: false, message: result.message });
  }
  return res.status(201).json({
    success: true,
    message: result.message,
    document: result.document,
  });
};

// Update a doc's title and/or content
export const updateDocument = async (req, res) => {
  const { projId, docId } = req.params;
  const userId = req.user.id;
  const { title, content } = req.body;

  if (!title && content === undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Provide at least a title or content to update" });
  }

  const result = await documentService.updateDocument(docId, projId, userId, title, content);
  if (!result.success) {
    return res.status(result.message === "Access denied" ? 403 : 404).json({
      success: false,
      message: result.message,
    });
  }
  return res.json({
    success: true,
    message: result.message,
    document: result.document,
  });
};

// Delete a doc
export const deleteDocument = async (req, res) => {
  const { projId, docId } = req.params;
  const userId = req.user.id;

  const result = await documentService.deleteDocument(docId, projId, userId);
  if (!result.success) {
    return res.status(result.message === "Access denied" ? 403 : 404).json({
      success: false,
      message: result.message,
    });
  }
  return res.json({ success: true, message: result.message });
};
