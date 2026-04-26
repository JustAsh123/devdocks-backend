import { pool } from "../db.js";

// Check if user belongs to the project
const isMember = async (projId, userId) => {
  const res = await pool.query(
    "SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2",
    [projId, userId]
  );
  return res.rowCount > 0;
};

// Get all docs in a project (no content, just metadata)
export const getDocuments = async (projId, userId) => {
  if (!(await isMember(projId, userId))) {
    return { success: false, message: "Access denied" };
  }

  const result = await pool.query(
    `SELECT d.id, d.title, d.created_at, d.updated_at, u.name AS created_by_name
     FROM documents d
     INNER JOIN users u ON u.id = d.created_by
     WHERE d.project_id = $1
     ORDER BY d.updated_at DESC`,
    [projId]
  );

  return { success: true, documents: result.rows };
};

// Get a single doc with its full content
export const getDocument = async (docId, projId, userId) => {
  if (!(await isMember(projId, userId))) {
    return { success: false, message: "Access denied" };
  }

  const result = await pool.query(
    `SELECT d.id, d.project_id, d.title, d.content, d.created_at, d.updated_at,
            u.name AS created_by_name, u.id AS created_by
     FROM documents d
     INNER JOIN users u ON u.id = d.created_by
     WHERE d.id = $1 AND d.project_id = $2`,
    [docId, projId]
  );

  if (result.rowCount === 0) {
    return { success: false, message: "Document not found" };
  }

  return { success: true, document: result.rows[0] };
};

// Create a new doc — content defaults to empty string
export const createDocument = async (projId, userId, title, content = "") => {
  if (!(await isMember(projId, userId))) {
    return { success: false, message: "Access denied" };
  }

  const result = await pool.query(
    `INSERT INTO documents (project_id, created_by, title, content)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [projId, userId, title, content]
  );

  return {
    success: true,
    document: result.rows[0],
    message: "Document created successfully",
  };
};

// Update title and/or content — skips fields that aren't passed
export const updateDocument = async (docId, projId, userId, title, content) => {
  if (!(await isMember(projId, userId))) {
    return { success: false, message: "Access denied" };
  }

  const exists = await pool.query(
    "SELECT id FROM documents WHERE id = $1 AND project_id = $2",
    [docId, projId]
  );
  if (exists.rowCount === 0) {
    return { success: false, message: "Document not found" };
  }

  const result = await pool.query(
    `UPDATE documents
     SET title = COALESCE($1, title),
         content = COALESCE($2, content),
         updated_at = NOW()
     WHERE id = $3 AND project_id = $4
     RETURNING *`,
    [title, content, docId, projId]
  );

  return {
    success: true,
    document: result.rows[0],
    message: "Document updated successfully",
  };
};

// Delete a doc
export const deleteDocument = async (docId, projId, userId) => {
  if (!(await isMember(projId, userId))) {
    return { success: false, message: "Access denied" };
  }

  const result = await pool.query(
    "DELETE FROM documents WHERE id = $1 AND project_id = $2 RETURNING id",
    [docId, projId]
  );

  if (result.rowCount === 0) {
    return { success: false, message: "Document not found" };
  }

  return { success: true, message: "Document deleted successfully" };
};
