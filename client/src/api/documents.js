import API from "./axios";

export const getDocuments = (projId) =>
  API.get(`/documents/${projId}`);

export const getDocument = (projId, docId) =>
  API.get(`/documents/${projId}/${docId}`);

export const createDocument = (projId, title, content = "") =>
  API.post(`/documents/${projId}`, { title, content });

export const updateDocument = (projId, docId, title, content) =>
  API.put(`/documents/${projId}/${docId}`, { title, content });

export const deleteDocument = (projId, docId) =>
  API.delete(`/documents/${projId}/${docId}`);
