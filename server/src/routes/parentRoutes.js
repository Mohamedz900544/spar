// src/routes/parentRoutes.js
import express from "express";
import { authRequired } from "../middleware/auth.js";
import { upload2 } from '../config/multer.js'

import { getDashboardData, getParentProfile, linkRound, rateSession } from "../controllers/parent.controller.js";
const router = express.Router();



/**
 * GET /api/parent/dashboard
 * Returns rounds + enrollments + photos for the current user
 */
router.get("/dashboard", authRequired, getDashboardData);

/**
 * POST /api/parent/link-round
 * body: { code }
 * - Links round to parent
 * - Creates enrollments for children
 * - Returns UPDATED full list of enrollments and photos
 */
router.post("/link-round", authRequired, linkRound);

/**
 * POST /api/parent/rate-session
 */
router.post("/rate-session", authRequired, rateSession);

router.put('/profile', authRequired, upload2.single('profilePhoto'), getParentProfile)

export default router;