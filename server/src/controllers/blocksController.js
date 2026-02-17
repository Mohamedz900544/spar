// server/src/controllers/blocksController.js
import BlockProject from "../models/BlockProject.js";
import User from "../models/User.js";

/**
 * GET /api/blocks/projects/my
 */
export const getMyProjects = async (req, res) => {
  try {
    const projects = await BlockProject.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();
    const user = await User.findById(req.user._id, "name photoUrl id");

    return res.json({ projects, user });
  } catch (err) {
    console.error("getMyProjects error:", err);
    return res.status(500).json({ message: "Failed to load projects" });
  }
};

/**
 * GET /api/blocks/projects/:id
 */
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await BlockProject.findById(id).lean();
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (String(project.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    return res.json({ project });
  } catch (err) {
    console.error("getProjectById error:", err);
    return res.status(500).json({ message: "Failed to load project" });
  }
};

/**
 * POST /api/blocks/projects
 * body: { title?: string, data: {...} }
 */
export const createProject = async (req, res) => {
  try {
    const { title, data } = req.body;

    console.log(data)
    if (!data || typeof data !== "object") {
      return res.status(400).json({ message: "data is required" });
    }

    const project = await BlockProject.create({
      user: req.user._id,
      title: (title || "My page").trim(),
      data,
    });

    return res.status(201).json({ project });
  } catch (err) {
    console.error("createProject error:", err);
    return res.status(500).json({ message: "Failed to create project" });
  }
};

/**
 * PUT /api/blocks/projects/:id
 * body: { title?: string, data?: {...} }
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, data } = req.body;

    const project = await BlockProject.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (String(project.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (typeof title === "string") {
      project.title = title.trim();
    }
    if (data && typeof data === "object") {
      project.data = data;
    }

    await project.save();
    return res.json({ project });
  } catch (err) {
    console.error("updateProject error:", err);
    return res.status(500).json({ message: "Failed to update project" });
  }
};

/**
 * DELETE /api/blocks/projects/:id
 */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await BlockProject.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (String(project.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await project.deleteOne();
    return res.json({ message: "Project deleted" });
  } catch (err) {
    console.error("deleteProject error:", err);
    return res.status(500).json({ message: "Failed to delete project" });
  }
};
