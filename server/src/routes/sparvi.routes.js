import express from "express";
import { authRequired, adminOnly } from "../middleware/auth.js";
import {
  constantTimeSecretEquals,
  getSparviInstructorAccessSummary,
  rotateSparviInstructorPassword,
  verifySparviInstructorPassword,
} from "../services/sparviAccess.service.js";

const router = express.Router();

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
    console.error("Rotate Sparvi password error:", err);
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
      const { password, roomId, clientId, role, source, timestamp } = req.body || {};

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
        console.warn("[sparvi] Invalid instructor password attempt", {
          roomId: roomId || "",
          clientId: clientId || "",
          role: role || "",
          source: source || "",
          timestamp: timestamp || null,
        });

        return res.status(401).json({
          ok: false,
          message: "Invalid instructor password",
        });
      }

      return res.json({ ok: true });
    } catch (err) {
      console.error("Verify Sparvi password error:", err);
      return res.status(500).json({
        ok: false,
        message: "Failed to verify instructor password",
      });
    }
  }
);

export default router;
