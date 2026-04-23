import * as projectService from "../services/projectService.js";

export const loadProject = async (req, res) => {
  const userId = req.user.id;

  const result = await projectService.getProjects(userId);

  if (!result.success) {
    return res.json({
      success: false,
      message: result.message,
    });
  }
  return res.json({
    success: true,
    message: result.message,
    projects: result.projects,
  });
};

export const getProjectMembers = async (req, res) => {
  const { projId } = req.params;
  const result = await projectService.getProjectMembers(projId);
  if (!result.success) {
    return res.json({
      success: false,
      message: result.message,
    });
  }
  return res.json({
    success: true,
    message: result.message,
    members: result.members,
  });
};

export const createProject = async (req, res) => {
  const { projName } = req.body;
  const userId = req.user.id;

  if (!projName) {
    return res.status(400).json({ message: "Project name is required" });
  }

  const result = await projectService.createProject(projName, userId);

  if (!result.success) {
    return res.json({
      success: false,
      message: result.message,
    });
  }
  return res.json({
    success: true,
    message: result.message,
    project: result.project.name,
    user: req.user.name,
  });
};

export const projectInvite = async (req, res) => {
  const { projId, email } = req.body;
  const userId = req.user.id;

  // Check if we have all fields
  if (!projId || !email) {
    return res.json({
      success: false,
      message: "All fields are required",
    });
  }

  const result = await projectService.inviteProject(projId, userId, email);
  if (!result.success) {
    return res.json({
      success: false,
      message: result.message,
    });
  }
  return res.json({
    success: true,
    message: result.message,
    statement: `${email} has been invited to the project by ${req.user.name}`,
    invite: result.invite,
  });
};

export const getInvites = async (req, res) => {
  const userId = req.user.id;
  const result = await projectService.getInvites(userId);
  if (!result.success) {
    return res.json({
      success: false,
      message: result.message,
    });
  }
  return res.json({
    success: true,
    message: result.message,
    invites: result.invites,
  });
};

export const inviteResponse = async (req, res) => {
  const { inviteId, response } = req.body;
  const userId = req.user.id;

  if (!inviteId || !response) {
    return res.json({
      success: false,
      message: "Enter all fields",
    });
  }

  const result = await projectService.inviteResponse(
    userId,
    inviteId,
    response,
  );
  if (!result.success) {
    return res.json({
      success: false,
      message: result.message,
    });
  }
  return res.json({
    success: true,
    message: result.message,
  });
};
