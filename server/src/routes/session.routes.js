import { Router } from 'express'
import { adminOnly, authRequired } from '../middleware/auth.js';
import { createSession, deleteSession, getAllSessions, updateSession, updateSessionStatus } from '../controllers/session.controller.js';

const router = Router()

// /api/admin/sessions/.....
router.get('/', authRequired, adminOnly, getAllSessions)
router.post("/", authRequired, adminOnly, createSession);
router.patch("/:id/status", authRequired, adminOnly, updateSessionStatus);
router.patch("/:id", authRequired, adminOnly, updateSession)
router.delete("/:id", authRequired, adminOnly, deleteSession)

export default router