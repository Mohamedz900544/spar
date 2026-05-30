import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { authRequired, adminOnly } from "../middleware/auth.js";
import {
  downloadSPRecordingLessonFile,
  getPublicSPRecordingCourse,
  listPublicSPRecordingCourses,
} from "../controllers/spRecording.controller.js";
import {
  constantTimeSecretEquals,
  getSparviInstructorAccessSummary,
  rotateSparviInstructorPassword,
  verifySparviInstructorPassword,
} from "../services/sparviAccess.service.js";

const router = express.Router();
const pointerInstallerPath = fileURLToPath(
  new URL("../SPpointer/Sparvi Desktop Student.exe", import.meta.url)
);
const pointerApkPath = fileURLToPath(
  new URL("../SPpointer/SparviPointer.apk", import.meta.url)
);

const extractBearerToken = (authorizationHeader = "") => {
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return "";
  }
  return token.trim();
};

const requireSparviSharedSecretIfConfigured = (req, res, next) => {
  const expectedSecret = process.env.SPARVI_SERVER_SHARED_SECRET || "";
  if (!expectedSecret) {
    return next();
  }

  const providedToken = extractBearerToken(req.headers.authorization || "");
  if (!providedToken) {
    return res.status(401).json({
      ok: false,
      message: "Missing Sparvi server authorization",
    });
  }

  if (!constantTimeSecretEquals(providedToken, expectedSecret)) {
    return res.status(403).json({
      ok: false,
      message: "Forbidden",
    });
  }

  return next();
};

const requireSPRecordingApiKey = (req, res, next) => {
  const expectedSecret =
    process.env.SP_RECORDING_API_KEY ||
    process.env.SPARVI_SERVER_SHARED_SECRET ||
    "";

  if (!expectedSecret) {
    return res.status(500).json({
      ok: false,
      message: "SP recording API key is not configured",
    });
  }

  const providedToken =
    extractBearerToken(req.headers.authorization || "") ||
    `${req.headers["x-sp-recording-api-key"] || ""}`.trim();

  if (!providedToken) {
    return res.status(401).json({
      ok: false,
      message: "Missing SP recording authorization",
    });
  }

  if (!constantTimeSecretEquals(providedToken, expectedSecret)) {
    return res.status(403).json({
      ok: false,
      message: "Forbidden",
    });
  }

  return next();
};

router.get("/access", authRequired, adminOnly, async (req, res) => {
  try {
    const summary = await getSparviInstructorAccessSummary();
    return res.json({
      ok: true,
      ...summary,
    });
  } catch (err) {
    console.error("Load Sparvi instructor access error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to load Sparvi instructor access",
    });
  }
});

router.post("/rotate-password", authRequired, adminOnly, async (req, res) => {
  try {
    const { password, rotatedAt } = await rotateSparviInstructorPassword();
    return res.json({
      ok: true,
      password,
      rotatedAt,
    });
  } catch (err) {
    console.error("Rotate SP School password error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to rotate instructor password",
    });
  }
});

router.post(
  "/verify-password",
  requireSparviSharedSecretIfConfigured,
  async (req, res) => {
    try {
      const { password, role } = req.body || {};

      if (!password) {
        return res.status(400).json({
          ok: false,
          message: "Password is required",
        });
      }

      if (role && role !== "instructor") {
        return res.status(403).json({
          ok: false,
          message: "Invalid instructor password",
        });
      }

      const isValid = await verifySparviInstructorPassword(password);
      if (!isValid) {
        console.warn("[sparvi] Invalid instructor password attempt");

        return res.status(401).json({
          ok: false,
          message: "Invalid instructor password",
        });
      }

      return res.json({ ok: true });
    } catch (err) {
      console.error("Verify SP School password error:", err);
      return res.status(500).json({
        ok: false,
        message: "Failed to verify instructor password",
      });
    }
  }
);

router.get("/recordings", requireSPRecordingApiKey, listPublicSPRecordingCourses);
router.get(
  "/recordings/:courseId",
  requireSPRecordingApiKey,
  getPublicSPRecordingCourse
);
router.get(
  "/recordings/:courseId/lessons/:lessonId/download",
  requireSPRecordingApiKey,
  downloadSPRecordingLessonFile
);

router.get("/pointer/download", (req, res) => {
  if (!fs.existsSync(pointerInstallerPath)) {
    return res.status(404).json({
      ok: false,
      message: "SP School Pointer installer is not available",
    });
  }

  return res.download(
    pointerInstallerPath,
    "SP School Pointer - Windows.exe",
    (err) => {
      if (err && !res.headersSent) {
        return res.status(500).json({
          ok: false,
          message: "Failed to download SP School Pointer",
        });
      }
    }
  );
});

router.get("/pointer/android/download", (req, res) => {
  if (!fs.existsSync(pointerApkPath)) {
    return res.status(404).json({
      ok: false,
      message: "SP School Pointer APK is not available",
    });
  }

  return res.download(
    pointerApkPath,
    "SP School Pointer - Android.apk",
    (err) => {
      if (err && !res.headersSent) {
        return res.status(500).json({
          ok: false,
          message: "Failed to download SP School Pointer APK",
        });
      }
    }
  );
});

export default router;
