import express from "express";
import { body, validationResult } from "express-validator";
import {
  activateGhostProcessLicense,
  consumeGhostProcessQuestion,
  logGhostProcessApiRequest,
  maskSecretText,
  validateGhostProcessLicense,
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

const validationErrorFor = (errors) => {
  const fields = errors.array().map((error) => error.path);
  if (fields.includes("activation_code")) return "invalid_code";
  if (fields.includes("license_token")) return "invalid_license_token";
  if (fields.includes("hardware_id")) return "hardware_mismatch";
  if (fields.includes("request_id")) return "server_error";
  return "server_error";
};

const sendValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;

  const error = validationErrorFor(errors);
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
    requestId: req.body?.request_id,
    statusCode: 400,
    responseBody: bodyPayload,
    meta: { validation: bodyPayload.details },
  });

  res.status(400).json(bodyPayload);
  return true;
};

const sendResult = async (req, res, result) => {
  await logGhostProcessApiRequest({
    licenseId: result.licenseId,
    endpoint: req.originalUrl,
    method: req.method,
    hardwareId: req.body?.hardware_id,
    appVersion: req.body?.app_version,
    requestId: req.body?.request_id,
    statusCode: result.statusCode,
    responseBody: result.body,
  });

  return res.status(result.statusCode).json(result.body);
};

const sendServerError = async (req, res, error) => {
  console.error("GhostProcess activation API error:", maskSecretText(error.message));
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
    requestId: req.body?.request_id,
    statusCode: 500,
    responseBody: bodyPayload,
  });

  return res.status(500).json(bodyPayload);
};

router.post(
  "/activate",
  [
    trimBodyString("activation_code").isLength({ max: 120 }),
    trimBodyString("hardware_id").isLength({ min: 8, max: 256 }),
    optionalAppVersion,
  ],
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;
    try {
      const result = await activateGhostProcessLicense(req.body);
      await sendResult(req, res, result);
    } catch (error) {
      await sendServerError(req, res, error);
    }
  }
);

router.post(
  "/validate",
  [
    trimBodyString("license_token").isLength({ max: 256 }),
    trimBodyString("hardware_id").isLength({ min: 8, max: 256 }),
    optionalAppVersion,
  ],
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;
    try {
      const result = await validateGhostProcessLicense(req.body);
      await sendResult(req, res, result);
    } catch (error) {
      await sendServerError(req, res, error);
    }
  }
);

router.post(
  "/consume-question",
  [
    trimBodyString("license_token").isLength({ max: 256 }),
    trimBodyString("hardware_id").isLength({ min: 8, max: 256 }),
    trimBodyString("request_id").isLength({ min: 8, max: 120 }),
  ],
  async (req, res) => {
    if (sendValidationErrors(req, res)) return;
    try {
      const result = await consumeGhostProcessQuestion(req.body);
      await sendResult(req, res, result);
    } catch (error) {
      await sendServerError(req, res, error);
    }
  }
);

export default router;
