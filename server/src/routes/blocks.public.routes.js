import express from "express";
import BlockProject from "../models/BlockProject.js";

const router = express.Router();

router.get("/share/:id", async (req, res) => {
  try {
    const project = await BlockProject.findById(req.params.id).populate('user', "name photoUrl email").lean();
    if (!project) return res.status(404).json({ message: "Not found" });

    return res.json({
      builder: project.data?.builder || { rootSectionIds: [], sections: {}, blocks: {} },
      zoom: project.data?.zoom || 1,
      title: project.title || "Shared page",
      user: project.user
    });
  } catch (err) {
    console.error("PUBLIC SHARE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
