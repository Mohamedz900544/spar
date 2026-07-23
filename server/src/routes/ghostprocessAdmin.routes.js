import express from "express";
import { body, param, query, validationResult } from "express-validator";
import { authRequired, adminOnly } from "../middleware/auth.js";
import {
  addQuestionsToLicense,
  createGhostProcessLicenses,
  deleteGhostProcessLogs,
  getOpenAIKeyStatus,
  listGhostProcessLicenses,
  listGhostProcessLogs,
  refreshOpenAIKeyVersion,
  resetLicenseHardware,
  sanitizeForLicenseLog,
  updateLicenseStatus,
  updateLicenseWindow,
} from "../services/ghostprocessLicensing.service.js";

const router = express.Router();

router.use(authRequired, adminOnly);

const sendValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;

  return res.status(400).json({
    ok: false,
    message: "Validation error",
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  });
};

const safeErrorMessage = (error) =>
  sanitizeForLicenseLog(error?.message || "Server error");

const licenseIdParam = param("id").isMongoId();

router.get("/licenses", async (req, res) => {
  try {
    const [licenses, keyStatus] = await Promise.all([
      listGhostProcessLicenses(),
      getOpenAIKeyStatus(),
    ]);
    res.json({
      ok: true,
      licenses,
      key_status: keyStatus,
    });
  } catch (error) {
    console.error("GhostProcess licenses list error:", safeErrorMessage(error));
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

router.post(
  "/licenses",
  [
    body("customer_name").isString().trim().notEmpty().isLength({ max: 160 }),
    body("phone").isString().trim().notEmpty().isLength({ max: 80 }),
    body("remaining_questions").optional().isInt({ min: 0 }).toInt(),
    body("count").optional().isInt({ min: 1, max: 50 }).toInt(),
    body("code").optional({ checkFalsy: true }).isString().trim().isLength({ max: 120 }),
    body("window_start").optional({ checkFalsy: true }).isString().trim(),
    body("window_end").optional({ checkFalsy: true }).isString().trim(),
    body("window_timezone").optional({ checkFalsy: true }).isString().trim().isLength({ max: 80 }),
  ],
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;
    try {
      const licenses = await createGhostProcessLicenses(req.body);
      res.status(201).json({ ok: true, licenses });
    } catch (error) {
      console.error("GhostProcess create license error:", safeErrorMessage(error));
      res.status(400).json({ ok: false, message: safeErrorMessage(error) });
    }
  }
);

router.patch(
  "/licenses/:id/questions",
  [licenseIdParam, body("amount").isInt({ min: 1, max: 100000 }).toInt()],
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;
    try {
      const license = await addQuestionsToLicense(req.params.id, req.body.amount);
      if (!license) {
        return res.status(404).json({ ok: false, message: "License not found" });
      }
      return res.json({ ok: true, license });
    } catch (error) {
      console.error("GhostProcess add questions error:", safeErrorMessage(error));
      return res.status(400).json({ ok: false, message: safeErrorMessage(error) });
    }
  }
);

router.patch(
  "/licenses/:id/window",
  [
    licenseIdParam,
    body("window_start").optional({ checkFalsy: true }).isString().trim(),
    body("window_end").optional({ checkFalsy: true }).isString().trim(),
    body("window_timezone").optional({ checkFalsy: true }).isString().trim().isLength({ max: 80 }),
  ],
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;
    try {
      const license = await updateLicenseWindow(req.params.id, req.body);
      if (!license) {
        return res.status(404).json({ ok: false, message: "License not found" });
      }
      return res.json({ ok: true, license });
    } catch (error) {
      console.error("GhostProcess update window error:", safeErrorMessage(error));
      return res.status(400).json({ ok: false, message: safeErrorMessage(error) });
    }
  }
);

router.post("/licenses/:id/reset-hardware", [licenseIdParam], async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  try {
    const license = await resetLicenseHardware(req.params.id);
    if (!license) {
      return res.status(404).json({ ok: false, message: "License not found" });
    }
    return res.json({ ok: true, license });
  } catch (error) {
    console.error("GhostProcess reset hardware error:", safeErrorMessage(error));
    return res.status(400).json({ ok: false, message: safeErrorMessage(error) });
  }
});

router.patch(
  "/licenses/:id/status",
  [licenseIdParam, body("status").isIn(["active", "revoked"])],
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;
    try {
      const license = await updateLicenseStatus(req.params.id, req.body.status);
      if (!license) {
        return res.status(404).json({ ok: false, message: "License not found" });
      }
      return res.json({ ok: true, license });
    } catch (error) {
      console.error("GhostProcess update status error:", safeErrorMessage(error));
      return res.status(400).json({ ok: false, message: safeErrorMessage(error) });
    }
  }
);

router.get(
  "/logs",
  [
    query("license_id").optional({ checkFalsy: true }).isMongoId(),
    query("limit").optional({ checkFalsy: true }).isInt({ min: 1, max: 300 }).toInt(),
  ],
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;
    try {
      const logs = await listGhostProcessLogs(req.query);
      return res.json({ ok: true, ...logs });
    } catch (error) {
      console.error("GhostProcess logs error:", safeErrorMessage(error));
      return res.status(500).json({ ok: false, message: "Server error" });
    }
  }
);

router.delete(
  "/logs",
  [query("license_id").optional({ checkFalsy: true }).isMongoId()],
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;
    try {
      const result = await deleteGhostProcessLogs(req.query);
      return res.json({ ok: true, ...result });
    } catch (error) {
      console.error("GhostProcess delete logs error:", safeErrorMessage(error));
      return res.status(500).json({ ok: false, message: "Server error" });
    }
  }
);

router.get("/key-status", async (req, res) => {
  try {
    return res.json({ ok: true, ...(await getOpenAIKeyStatus()) });
  } catch (error) {
    console.error("GhostProcess key status error:", safeErrorMessage(error));
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

router.post("/refresh-key", async (req, res) => {
  try {
    const result = await refreshOpenAIKeyVersion();
    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    console.error("GhostProcess refresh key error:", safeErrorMessage(error));
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

export default router;
