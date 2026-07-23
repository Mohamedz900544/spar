import crypto from "crypto";
import mongoose from "mongoose";
import { loadEnvFiles } from "../config/env.js";
import GhostProcessApiLog from "../models/GhostProcessApiLog.js";
import GhostProcessConsumptionRequest from "../models/GhostProcessConsumptionRequest.js";
import GhostProcessKeyVersion from "../models/GhostProcessKeyVersion.js";
import GhostProcessLicense from "../models/GhostProcessLicense.js";
import GhostProcessLicenseToken from "../models/GhostProcessLicenseToken.js";

const DEFAULT_TIMEZONE = "Africa/Cairo";
const CODE_PREFIX = "GP";
const OPENAI_KEY_PATTERN = /sk-[A-Za-z0-9_-]{8,}/g;
const SECRET_FIELD_NAMES = new Set([
  "api_key",
  "apikey",
  "openai_api_key",
  "authorization",
  "license_token",
  "token",
]);

const ERROR_STATUS = {
  invalid_code: 404,
  revoked: 403,
  hardware_mismatch: 403,
  outside_time_window: 403,
  no_questions_remaining: 403,
  invalid_license_token: 401,
  openai_key_missing: 503,
  server_error: 500,
};

const isObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

const trimString = (value) => `${value ?? ""}`.trim();

const normalizeCode = (value) => trimString(value).toUpperCase();

const normalizeHardwareId = (value) => trimString(value);

const nowIso = () => new Date().toISOString();

const toPositiveInt = (value, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const isDuplicateKeyError = (error) => error?.code === 11000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getObjectIdString = (value) =>
  value?._id?.toString?.() || value?.id?.toString?.() || value?.toString?.();

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(`${value}`);

const asDateOrNull = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const serializeDate = (value) => {
  const date = asDateOrNull(value);
  return date ? date.toISOString() : null;
};

const errorResponse = (error, licenseId = null, message = error) => ({
  ok: false,
  statusCode: ERROR_STATUS[error] || 400,
  licenseId,
  body: {
    ok: false,
    error,
    message,
  },
});

const successResponse = (body, licenseId, statusCode = 200) => ({
  ok: true,
  statusCode,
  licenseId,
  body,
});

const hashValue = (value) =>
  crypto.createHash("sha256").update(`${value}`).digest("hex");

const generateToken = () => `gp_${crypto.randomBytes(32).toString("base64url")}`;

const generateCode = () => {
  const first = crypto.randomBytes(3).toString("hex").toUpperCase();
  const second = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${CODE_PREFIX}-${first}-${second}`;
};

export const maskSecretText = (value) =>
  `${value ?? ""}`.replace(OPENAI_KEY_PATTERN, (match) => {
    if (match.length <= 10) return "sk-***";
    return `${match.slice(0, 7)}...${match.slice(-4)}`;
  });

export const sanitizeForLicenseLog = (value) => {
  if (typeof value === "string") return maskSecretText(value);
  if (Array.isArray(value)) return value.map((item) => sanitizeForLicenseLog(item));
  if (!isObject(value)) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (SECRET_FIELD_NAMES.has(normalizedKey)) {
        return [key, "[masked]"];
      }
      return [key, sanitizeForLicenseLog(entry)];
    })
  );
};

const serializeLicense = (license, consumedQuestions = 0) => {
  if (!license) return null;
  const raw = license.toObject ? license.toObject() : license;
  const id = getObjectIdString(raw);

  return {
    id,
    _id: id,
    code: raw.code,
    customer_name: raw.customer_name,
    phone: raw.phone,
    hardware_id: raw.hardware_id || null,
    remaining_questions: raw.remaining_questions || 0,
    window_start: serializeDate(raw.window_start),
    window_end: serializeDate(raw.window_end),
    window_timezone: raw.window_timezone || DEFAULT_TIMEZONE,
    status: raw.status,
    openai_key_version_ack: raw.openai_key_version_ack || null,
    created_at: serializeDate(raw.created_at),
    activated_at: serializeDate(raw.activated_at),
    last_seen_at: serializeDate(raw.last_seen_at),
    consumed_questions: consumedQuestions || raw.consumed_questions || 0,
  };
};

const fetchLicenseById = async (licenseId) => {
  if (!isValidObjectId(licenseId)) return null;
  return GhostProcessLicense.findById(licenseId).lean();
};

const getLicenseByToken = async (licenseToken) => {
  const tokenHash = hashValue(trimString(licenseToken));
  const tokenRecord = await GhostProcessLicenseToken.findOne({
    token_hash: tokenHash,
    revoked_at: null,
  })
    .populate("license")
    .lean();

  if (!tokenRecord?.license) return null;
  return { license: tokenRecord.license, tokenId: tokenRecord._id };
};

const issueLicenseToken = async (licenseId) => {
  const token = generateToken();
  await GhostProcessLicenseToken.create({
    license: licenseId,
    token_hash: hashValue(token),
    issued_at: new Date(),
  });
  return token;
};

const getTimezoneOffsetMs = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );

  const asUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second
  );

  return asUtc - date.getTime();
};

const parseZonedLocalDateTime = (value, timeZone = DEFAULT_TIMEZONE) => {
  const match = trimString(value).match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
  );
  if (!match) return null;

  const [, year, month, day, hour, minute, second = "0"] = match;
  const utcGuess = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );

  const guessedDate = new Date(utcGuess);
  const offset = getTimezoneOffsetMs(guessedDate, timeZone);
  let utcDate = new Date(utcGuess - offset);
  const correctedOffset = getTimezoneOffsetMs(utcDate, timeZone);
  if (correctedOffset !== offset) {
    utcDate = new Date(utcGuess - correctedOffset);
  }

  return utcDate;
};

const parseWindowDate = (value, timeZone = DEFAULT_TIMEZONE) => {
  const raw = trimString(value);
  if (!raw) return null;

  const hasExplicitOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
  const date = hasExplicitOffset
    ? new Date(raw)
    : parseZonedLocalDateTime(raw, timeZone);

  if (!date || Number.isNaN(date.getTime())) {
    throw new Error("Invalid allowed time window");
  }

  return date;
};

const normalizeWindowPayload = (payload = {}) => {
  const timezone = trimString(payload.window_timezone) || DEFAULT_TIMEZONE;
  return {
    window_start: parseWindowDate(payload.window_start, timezone),
    window_end: parseWindowDate(payload.window_end, timezone),
    window_timezone: timezone,
  };
};

const isAllowedNow = (license, now = new Date()) => {
  const start = asDateOrNull(license.window_start);
  const end = asDateOrNull(license.window_end);

  if (start && now.getTime() < start.getTime()) return false;
  if (end && now.getTime() > end.getTime()) return false;

  return true;
};

const getOpenAIKeyVersion = async () => {
  const version = nowIso();
  const keyVersion = await GhostProcessKeyVersion.findOneAndUpdate(
    { singleton_key: "openai" },
    {
      $setOnInsert: {
        openai_key_version: version,
        refreshed_at: new Date(version),
        created_at: new Date(version),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  return keyVersion.openai_key_version;
};

const buildLicensePayload = async (license, message, licenseToken = null) => {
  const openaiKeyVersion = await getOpenAIKeyVersion();
  return {
    ok: true,
    ...(licenseToken ? { license_token: licenseToken } : {}),
    remaining_questions: license.remaining_questions || 0,
    allowed_now: isAllowedNow(license),
    window_start: serializeDate(license.window_start),
    window_end: serializeDate(license.window_end),
    window_timezone: license.window_timezone || DEFAULT_TIMEZONE,
    display_name: license.customer_name,
    phone: license.phone,
    openai_key_version: openaiKeyVersion,
    key_refresh_required: license.openai_key_version_ack !== openaiKeyVersion,
    message,
  };
};

const validateUsableLicense = (license, hardwareId, { checkWindow = true } = {}) => {
  if (!license) return "invalid_license_token";
  if (license.status === "revoked") return "revoked";
  if (license.hardware_id && license.hardware_id !== hardwareId) {
    return "hardware_mismatch";
  }
  if (!license.hardware_id) return "hardware_mismatch";
  if (checkWindow && !isAllowedNow(license)) return "outside_time_window";
  return null;
};

const buildUsableLicenseQuery = (licenseId, hardwareId) => {
  const now = new Date();
  return {
    _id: licenseId,
    status: "active",
    hardware_id: hardwareId,
    remaining_questions: { $gt: 0 },
    $and: [
      { $or: [{ window_start: null }, { window_start: { $lte: now } }] },
      { $or: [{ window_end: null }, { window_end: { $gte: now } }] },
    ],
  };
};

const updateLastSeen = async (licenseId) =>
  GhostProcessLicense.findByIdAndUpdate(
    licenseId,
    { $set: { last_seen_at: new Date() } },
    { new: true }
  ).lean();

const resolveExistingConsumption = async (licenseId, requestId) => {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const existing = await GhostProcessConsumptionRequest.findOne({
      license: licenseId,
      request_id: requestId,
    }).lean();

    if (existing?.response_json) {
      return successResponse(existing.response_json, licenseId);
    }

    await wait(40);
  }

  return errorResponse("server_error", licenseId);
};

export const listGhostProcessLicenses = async () => {
  const [licenses, counts] = await Promise.all([
    GhostProcessLicense.find().sort({ created_at: -1 }).lean(),
    GhostProcessConsumptionRequest.aggregate([
      { $match: { response_json: { $ne: null } } },
      { $group: { _id: "$license", consumed_questions: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map(
    counts.map((entry) => [entry._id.toString(), entry.consumed_questions])
  );

  return licenses.map((license) =>
    serializeLicense(license, countMap.get(license._id.toString()) || 0)
  );
};

export const createGhostProcessLicenses = async (payload = {}) => {
  const count = Math.min(Math.max(Number.parseInt(payload.count || 1, 10), 1), 50);
  const customerName = trimString(payload.customer_name);
  const phone = trimString(payload.phone);
  const remainingQuestions = toPositiveInt(payload.remaining_questions, 0);
  const requestedCode = normalizeCode(payload.code);
  const windowPayload = normalizeWindowPayload(payload);

  if (!customerName || !phone) {
    throw new Error("Customer name and phone are required");
  }
  if (requestedCode && count > 1) {
    throw new Error("Custom code can only be used when creating one license");
  }
  if (
    windowPayload.window_start &&
    windowPayload.window_end &&
    windowPayload.window_start.getTime() > windowPayload.window_end.getTime()
  ) {
    throw new Error("Window start must be before window end");
  }
  if (requestedCode && (await GhostProcessLicense.exists({ code: requestedCode }))) {
    throw new Error("Activation code already exists");
  }

  const created = [];
  for (let index = 0; index < count; index += 1) {
    let code = requestedCode || generateCode();
    let inserted = false;

    for (let attempt = 0; attempt < 8 && !inserted; attempt += 1) {
      try {
        const license = await GhostProcessLicense.create({
          code,
          customer_name: customerName,
          phone,
          remaining_questions: remainingQuestions,
          window_start: windowPayload.window_start,
          window_end: windowPayload.window_end,
          window_timezone: windowPayload.window_timezone,
          status: "active",
          created_at: new Date(),
        });
        created.push(serializeLicense(license));
        inserted = true;
      } catch (error) {
        if (requestedCode && isDuplicateKeyError(error)) {
          throw new Error("Activation code already exists");
        }
        if (requestedCode || !isDuplicateKeyError(error)) {
          throw error;
        }
        code = generateCode();
      }
    }

    if (!inserted) throw new Error("Could not generate a unique code");
  }

  return created;
};

export const addQuestionsToLicense = async (licenseId, amount) => {
  const increment = Number.parseInt(amount, 10);
  if (!Number.isFinite(increment) || increment <= 0) {
    throw new Error("Question amount must be greater than zero");
  }

  const license = await GhostProcessLicense.findByIdAndUpdate(
    licenseId,
    { $inc: { remaining_questions: increment } },
    { new: true, runValidators: true }
  ).lean();

  return serializeLicense(license);
};

export const updateLicenseWindow = async (licenseId, payload = {}) => {
  const windowPayload = normalizeWindowPayload(payload);
  if (
    windowPayload.window_start &&
    windowPayload.window_end &&
    windowPayload.window_start.getTime() > windowPayload.window_end.getTime()
  ) {
    throw new Error("Window start must be before window end");
  }

  const license = await GhostProcessLicense.findByIdAndUpdate(
    licenseId,
    { $set: windowPayload },
    { new: true, runValidators: true }
  ).lean();

  return serializeLicense(license);
};

export const resetLicenseHardware = async (licenseId) => {
  const [license] = await Promise.all([
    GhostProcessLicense.findByIdAndUpdate(
      licenseId,
      {
        $set: {
          hardware_id: null,
          activated_at: null,
          last_seen_at: null,
        },
      },
      { new: true }
    ).lean(),
    GhostProcessLicenseToken.updateMany(
      { license: licenseId, revoked_at: null },
      { $set: { revoked_at: new Date() } }
    ),
  ]);

  return serializeLicense(license);
};

export const updateLicenseStatus = async (licenseId, status) => {
  if (!["active", "revoked"].includes(status)) {
    throw new Error("Status must be active or revoked");
  }

  const license = await GhostProcessLicense.findByIdAndUpdate(
    licenseId,
    { $set: { status } },
    { new: true, runValidators: true }
  ).lean();

  return serializeLicense(license);
};

export const activateGhostProcessLicense = async ({
  activation_code,
  hardware_id,
}) => {
  const code = normalizeCode(activation_code);
  const hardwareId = normalizeHardwareId(hardware_id);
  const license = await GhostProcessLicense.findOne({ code }).lean();

  if (!license) return errorResponse("invalid_code");
  const licenseId = license._id.toString();
  if (license.status === "revoked") return errorResponse("revoked", licenseId);
  if (license.hardware_id && license.hardware_id !== hardwareId) {
    return errorResponse("hardware_mismatch", licenseId);
  }
  if (!isAllowedNow(license)) {
    return errorResponse("outside_time_window", licenseId);
  }

  let refreshed = license;
  const timestamp = new Date();
  if (!license.hardware_id) {
    const setPayload = {
      hardware_id: hardwareId,
      last_seen_at: timestamp,
    };
    if (!license.activated_at) setPayload.activated_at = timestamp;

    refreshed = await GhostProcessLicense.findOneAndUpdate(
      {
        _id: license._id,
        status: "active",
        $or: [{ hardware_id: null }, { hardware_id: { $exists: false } }],
      },
      { $set: setPayload },
      { new: true }
    ).lean();

    if (!refreshed) {
      const current = await fetchLicenseById(license._id);
      if (current?.hardware_id !== hardwareId) {
        return errorResponse("hardware_mismatch", licenseId);
      }
      refreshed = await updateLastSeen(license._id);
    }
  } else {
    refreshed = await updateLastSeen(license._id);
  }

  const token = await issueLicenseToken(refreshed._id);

  return successResponse(
    await buildLicensePayload(refreshed, "Activated", token),
    refreshed._id.toString(),
    201
  );
};

export const validateGhostProcessLicense = async ({
  license_token,
  hardware_id,
}) => {
  const hardwareId = normalizeHardwareId(hardware_id);
  const token = trimString(license_token);
  const tokenRecord = await getLicenseByToken(token);

  if (!tokenRecord) return errorResponse("invalid_license_token");

  const error = validateUsableLicense(tokenRecord.license, hardwareId);
  if (error) return errorResponse(error, tokenRecord.license._id.toString());

  const refreshed = await updateLastSeen(tokenRecord.license._id);

  return successResponse(
    await buildLicensePayload(refreshed, "Validated", token),
    refreshed._id.toString()
  );
};

export const consumeGhostProcessQuestion = async ({
  license_token,
  hardware_id,
  request_id,
}) => {
  const hardwareId = normalizeHardwareId(hardware_id);
  const token = trimString(license_token);
  const requestId = trimString(request_id);
  const tokenRecord = await getLicenseByToken(token);

  if (!tokenRecord) return errorResponse("invalid_license_token");

  const currentLicense = await fetchLicenseById(tokenRecord.license._id);
  const licenseId = currentLicense?._id?.toString?.();
  const error = validateUsableLicense(currentLicense, hardwareId);
  if (error) return errorResponse(error, licenseId);

  const existing = await GhostProcessConsumptionRequest.findOne({
    license: currentLicense._id,
    request_id: requestId,
  }).lean();

  if (existing?.response_json) {
    return successResponse(existing.response_json, licenseId);
  }
  if (existing && !existing.response_json) {
    return resolveExistingConsumption(currentLicense._id, requestId);
  }

  let consumption;
  try {
    consumption = await GhostProcessConsumptionRequest.create({
      license: currentLicense._id,
      request_id: requestId,
      hardware_id: hardwareId,
      created_at: new Date(),
    });
  } catch (insertError) {
    if (isDuplicateKeyError(insertError)) {
      return resolveExistingConsumption(currentLicense._id, requestId);
    }
    throw insertError;
  }

  const before = await GhostProcessLicense.findOneAndUpdate(
    buildUsableLicenseQuery(currentLicense._id, hardwareId),
    {
      $inc: { remaining_questions: -1 },
      $set: { last_seen_at: new Date() },
    },
    { new: false }
  ).lean();

  if (!before) {
    await GhostProcessConsumptionRequest.deleteOne({ _id: consumption._id });
    const latest = await fetchLicenseById(currentLicense._id);
    const latestError = validateUsableLicense(latest, hardwareId);
    return errorResponse(latestError || "no_questions_remaining", licenseId);
  }

  const refreshed = await fetchLicenseById(currentLicense._id);
  const body = await buildLicensePayload(refreshed, "Question consumed", token);
  const remainingBefore = before.remaining_questions;
  const remainingAfter = remainingBefore - 1;

  await GhostProcessConsumptionRequest.findByIdAndUpdate(consumption._id, {
    $set: {
      remaining_before: remainingBefore,
      remaining_after: remainingAfter,
      response_json: body,
    },
  });

  return successResponse(body, licenseId);
};

export const getOpenAIKeyForLicense = async ({
  license_token,
  hardware_id,
}) => {
  const hardwareId = normalizeHardwareId(hardware_id);
  const tokenRecord = await getLicenseByToken(trimString(license_token));
  if (!tokenRecord) return errorResponse("invalid_license_token");

  const freshLicense = await fetchLicenseById(tokenRecord.license._id);
  const licenseId = freshLicense?._id?.toString?.();
  const error = validateUsableLicense(freshLicense, hardwareId);
  if (error) return errorResponse(error, licenseId);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return errorResponse("openai_key_missing", licenseId);

  const keyVersion = await getOpenAIKeyVersion();
  await GhostProcessLicense.findByIdAndUpdate(freshLicense._id, {
    $set: {
      openai_key_version_ack: keyVersion,
      last_seen_at: new Date(),
    },
  });

  return successResponse(
    {
      ok: true,
      api_key: apiKey,
      key_version: keyVersion,
      message: "key refreshed",
    },
    licenseId
  );
};

export const refreshOpenAIKeyVersion = async () => {
  loadEnvFiles({ override: true });

  if (!process.env.OPENAI_API_KEY) {
    return {
      ok: false,
      statusCode: ERROR_STATUS.openai_key_missing,
      body: {
        ok: false,
        error: "openai_key_missing",
        message: "openai_key_missing",
      },
    };
  }

  const version = nowIso();
  await GhostProcessKeyVersion.findOneAndUpdate(
    { singleton_key: "openai" },
    {
      $set: {
        openai_key_version: version,
        refreshed_at: new Date(version),
      },
      $setOnInsert: {
        created_at: new Date(version),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    ok: true,
    statusCode: 200,
    body: {
      ok: true,
      openai_key_version: version,
      has_openai_key: true,
      message: "OpenAI key version refreshed",
    },
  };
};

export const getOpenAIKeyStatus = async () => ({
  openai_key_version: await getOpenAIKeyVersion(),
  has_openai_key: Boolean(process.env.OPENAI_API_KEY),
});

export const listGhostProcessLogs = async ({ license_id, limit = 100 } = {}) => {
  const parsedLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 100, 1), 300);
  const filter =
    license_id && isValidObjectId(license_id) ? { license: license_id } : {};
  const visibleConsumptionFilter = {
    ...filter,
    response_json: { $ne: null },
    hidden_from_logs: { $ne: true },
  };

  const [apiLogs, consumptionLogs] = await Promise.all([
    GhostProcessApiLog.find(filter)
      .sort({ created_at: -1 })
      .limit(parsedLimit)
      .populate("license", "code customer_name")
      .lean(),
    GhostProcessConsumptionRequest.find(visibleConsumptionFilter)
      .sort({ created_at: -1 })
      .limit(parsedLimit)
      .populate("license", "code customer_name")
      .lean(),
  ]);

  return {
    api_logs: apiLogs.map((log) => ({
      id: log._id.toString(),
      license_id: getObjectIdString(log.license),
      code: log.license?.code || null,
      customer_name: log.license?.customer_name || null,
      endpoint: log.endpoint,
      method: log.method,
      hardware_id: log.hardware_id,
      app_version: log.app_version,
      request_id: log.request_id,
      status_code: log.status_code,
      ok: Boolean(log.ok),
      error_code: log.error_code,
      message: log.message,
      meta: sanitizeForLicenseLog(log.meta || {}),
      created_at: serializeDate(log.created_at),
    })),
    consumption_logs: consumptionLogs.map((log) => ({
      id: log._id.toString(),
      license_id: getObjectIdString(log.license),
      code: log.license?.code || null,
      customer_name: log.license?.customer_name || null,
      request_id: log.request_id,
      hardware_id: log.hardware_id,
      remaining_before: log.remaining_before,
      remaining_after: log.remaining_after,
      created_at: serializeDate(log.created_at),
    })),
  };
};

export const deleteGhostProcessLogs = async ({ license_id } = {}) => {
  const filter =
    license_id && isValidObjectId(license_id) ? { license: license_id } : {};

  const [apiLogsResult, consumptionLogsResult] = await Promise.all([
    GhostProcessApiLog.deleteMany(filter),
    GhostProcessConsumptionRequest.updateMany(
      {
        ...filter,
        response_json: { $ne: null },
        hidden_from_logs: { $ne: true },
      },
      {
        $set: {
          hidden_from_logs: true,
          logs_hidden_at: new Date(),
        },
      }
    ),
  ]);

  return {
    api_logs_deleted: apiLogsResult.deletedCount || 0,
    consumption_logs_removed: consumptionLogsResult.modifiedCount || 0,
  };
};

export const logGhostProcessApiRequest = async ({
  licenseId = null,
  endpoint,
  method,
  hardwareId = "",
  appVersion = "",
  requestId = "",
  statusCode,
  responseBody = {},
  meta = {},
}) => {
  try {
    await GhostProcessApiLog.create({
      license: licenseId && isValidObjectId(licenseId) ? licenseId : null,
      endpoint,
      method,
      hardware_id: hardwareId || null,
      app_version: appVersion || null,
      request_id: requestId || null,
      status_code: statusCode,
      ok: Boolean(responseBody?.ok),
      error_code: responseBody?.error || null,
      message: responseBody?.message || null,
      meta: sanitizeForLicenseLog(meta || {}),
      created_at: new Date(),
    });
  } catch (error) {
    console.error("GhostProcess API log error:", maskSecretText(error.message));
  }
};

export const getGhostProcessLicenseByCode = async (code) => {
  const license = await GhostProcessLicense.findOne({
    code: normalizeCode(code),
  }).lean();
  return serializeLicense(license);
};
