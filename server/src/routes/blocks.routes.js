// server/src/routes/blocks.routes.js
import express from "express";
import { authRequired } from "../middleware/auth.js";
import BlockProject from "../models/BlockProject.js";   // ←ــــــــــــــ أضف هذا

import {
  getMyProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/blocksController.js";

const router = express.Router();


// كل المسارات دي محتاجة auth
// router.use(authRequired);
// /api/blocks/....
router.get("/projects/my", authRequired, getMyProjects);
router.get("/projects/:id", authRequired, getProjectById);
router.post("/projects", authRequired, createProject);
router.put("/projects/:id", authRequired, updateProject);
router.delete("/projects/:id", authRequired, deleteProject);

export default router;
