import express from "express";
import mongoose from "mongoose";
import BlockProject from "../models/BlockProject.js";
import User from "../models/User.js";

const router = express.Router();

const toSafeText = (value, fallback = "") => (value || fallback).toString().trim();

router.get("/:parentId/:childId", async (req, res) => {
  try {
    const { parentId, childId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(parentId) || !mongoose.Types.ObjectId.isValid(childId)) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    const user = await User.findById(parentId)
      .select("name photoUrl children")
      .lean();
    if (!user) return res.status(404).json({ message: "Portfolio not found" });

    const child = (user.children || []).find((item) => item?._id?.toString() === childId);
    if (!child) return res.status(404).json({ message: "Portfolio not found" });

    const scratchProjects = (child.scratchProjects || []).map((project) => {
      const projectId = toSafeText(project.projectId || project.id);
      return {
        id: project._id?.toString() || projectId,
        type: "scratch",
        sourceLabel: "Scratch",
        title: toSafeText(project.title, `Scratch Project ${projectId}`),
        description: `Interactive Scratch project by ${child.name}.`,
        projectId,
        url: project.url || `https://scratch.mit.edu/projects/${projectId}`,
        embedUrl: projectId ? `https://scratch.mit.edu/projects/${projectId}/embed` : "",
        thumbnailUrl: projectId ? `https://uploads.scratch.mit.edu/get_image/project/${projectId}_480x360.png` : "",
        createdAt: project.createdAt || null,
      };
    }).filter((project) => project.projectId);

    const blockProjects = await BlockProject.find({ user: user._id })
      .sort({ updatedAt: -1 })
      .lean();

    const blocksPlayProjects = blockProjects.map((project) => {
      const blockCount = Object.keys(project.data?.builder?.blocks || {}).length;
      return {
        id: project._id.toString(),
        type: "blocks",
        sourceLabel: "Blocks Play",
        title: project.title || "My page",
        description: `${blockCount} block${blockCount === 1 ? "" : "s"} made in Blocks Play.`,
        builder: project.data?.builder || { rootSectionIds: [], sections: {}, blocks: {} },
        zoom: project.data?.zoom || 1,
        blockCount,
        sharePath: `/blocks/share/${project._id.toString()}`,
        createdAt: project.createdAt || null,
        updatedAt: project.updatedAt || null,
      };
    });

    const projects = [...scratchProjects, ...blocksPlayProjects].sort((left, right) => {
      const leftDate = new Date(left.updatedAt || left.createdAt || 0).getTime();
      const rightDate = new Date(right.updatedAt || right.createdAt || 0).getTime();
      return rightDate - leftDate;
    });

    return res.json({
      child: {
        id: child._id.toString(),
        name: child.name,
        age: child.age,
        portfolioAbout: child.portfolioAbout || "",
      },
      school: {
        name: "SP School",
      },
      owner: {
        name: user.name || "",
        photoUrl: user.photoUrl || "",
      },
      projects,
    });
  } catch (err) {
    console.error("PUBLIC PORTFOLIO ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
