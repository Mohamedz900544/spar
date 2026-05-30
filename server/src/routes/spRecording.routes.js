import { Router } from "express";
import multer from "multer";
import {
  createSPRecordingCourse,
  deleteSPRecordingCourse,
  downloadSPRecordingLessonFile,
  listAdminSPRecordingCourses,
  updateSPRecordingCourse,
} from "../controllers/spRecording.controller.js";
import { adminOnly, authRequired } from "../middleware/auth.js";

const router = Router();

const maxFileSizeMb = Number(process.env.SP_RECORDING_MAX_FILE_MB || 200);

const sparviUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith(".sparvi")) {
      return cb(new Error("Only .sparvi files are allowed"));
    }
    return cb(null, true);
  },
});

const uploadAnySparviFile = (req, res, next) => {
  sparviUpload.any()(req, res, (err) => {
    if (!err) return next();

    const isTooLarge = err.code === "LIMIT_FILE_SIZE";
    return res.status(400).json({
      ok: false,
      message: isTooLarge
        ? `SP recording file is too large. Max size is ${maxFileSizeMb}MB.`
        : err.message || "Could not upload SP recording file",
    });
  });
};

router.get("/", authRequired, adminOnly, listAdminSPRecordingCourses);
router.post("/", authRequired, adminOnly, uploadAnySparviFile, createSPRecordingCourse);
router.patch(
  "/:courseId",
  authRequired,
  adminOnly,
  uploadAnySparviFile,
  updateSPRecordingCourse
);
router.delete("/:courseId", authRequired, adminOnly, deleteSPRecordingCourse);
router.get(
  "/:courseId/lessons/:lessonId/download",
  authRequired,
  adminOnly,
  downloadSPRecordingLessonFile
);

export default router;
