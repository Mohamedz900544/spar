import express from "express";
import { body, validationResult } from "express-validator";
import {
  getOpenAIKeyForLicense,
  logGhostProcessApiRequest,
  maskSecretText,
} from "../services/ghostprocessLicensing.service.js";

const router = express.Router();

const trimBodyString = (field) =>
  body(field)
    .isString()
    .withMessage(`${field}_required`)
    .trim()
    .notEmpty()
    .withMessage(`${field}_required`);

const optionalAppVersion = body("app_version")
  .optional({ checkFalsy: true })
  .isString()
  .trim()
  .isLength({ max: 80 });

const sendValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;

  const fields = errors.array().map((error) => error.path);
  const error = fields.includes("license_token")
    ? "invalid_license_token"
    : fields.includes("hardware_id")
      ? "hardware_mismatch"
      : "server_error";
  const bodyPayload = {
    ok: false,
    error,
    message: error,
    details: errors.array().map((item) => ({
      field: item.path,
      message: item.msg,
    })),
  };

  void logGhostProcessApiRequest({
    endpoint: req.originalUrl,
    method: req.method,
    hardwareId: req.body?.hardware_id,
    appVersion: req.body?.app_version,
    statusCode: 400,
    responseBody: bodyPayload,
    meta: { validation: bodyPayload.details },
  });

  res.status(400).json(bodyPayload);
  return true;
};

router.post(
  "/key",
  [
    trimBodyString("license_token").isLength({ max: 256 }),
    trimBodyString("hardware_id").isLength({ min: 8, max: 256 }),
    optionalAppVersion,
  ],
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;

    try {
      const result = await getOpenAIKeyForLicense(req.body);
      await logGhostProcessApiRequest({
        licenseId: result.licenseId,
        endpoint: req.originalUrl,
        method: req.method,
        hardwareId: req.body?.hardware_id,
        appVersion: req.body?.app_version,
        statusCode: result.statusCode,
        responseBody: result.body,
        meta: {
          returned_api_key: Boolean(result.body?.api_key),
          key_version: result.body?.key_version,
        },
      });

      return res.status(result.statusCode).json(result.body);
    } catch (error) {
      console.error("GhostProcess OpenAI key API error:", maskSecretText(error.message));
      const bodyPayload = {
        ok: false,
        error: "server_error",
        message: "server_error",
      };
      await logGhostProcessApiRequest({
        endpoint: req.originalUrl,
        method: req.method,
        hardwareId: req.body?.hardware_id,
        appVersion: req.body?.app_version,
        statusCode: 500,
        responseBody: bodyPayload,
      });
      return res.status(500).json(bodyPayload);
    }
  }
);

export default router;
