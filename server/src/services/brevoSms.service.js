import axios from "axios";

const BREVO_API_BASE_URL = "https://api.brevo.com/v3";
const SMS_CREDITS_CACHE_MS = Number(
  process.env.BREVO_SMS_CREDITS_CACHE_MS || 5 * 60 * 1000
);

let smsCreditsCache = {
  checkedAt: 0,
  credits: null,
};

const getBrevoSmsConfig = () => ({
  enabled: process.env.BREVO_SMS_ENABLED === "true",
  apiKey: process.env.BREVO_SMS_API_KEY || process.env.BREVO_API_KEY || "",
  sender: process.env.BREVO_SMS_SENDER || "SparviLab",
  type: (process.env.BREVO_SMS_TYPE || "transactional").toLowerCase(),
  tag: process.env.BREVO_SMS_TAG || "",
  unicodeEnabled: process.env.BREVO_SMS_UNICODE_ENABLED !== "false",
  organisationPrefix: process.env.BREVO_SMS_ORGANISATION_PREFIX || "",
  webUrl: process.env.BREVO_SMS_WEBHOOK_URL || "",
  forceOverrideRecipient:
    process.env.BREVO_SMS_FORCE_OVERRIDE_RECIPIENT === "true",
  overrideRecipient: process.env.BREVO_SMS_OVERRIDE_RECIPIENT || "",
  enforceCreditsCheck: process.env.BREVO_SMS_ENFORCE_CREDITS_CHECK !== "false",
});

const normalizeSmsRecipient = (value) =>
  (value || "").toString().replace(/\D/g, "");

const getBrevoSmsCredits = async (apiKey) => {
  const now = Date.now();
  if (
    smsCreditsCache.checkedAt &&
    now - smsCreditsCache.checkedAt < SMS_CREDITS_CACHE_MS
  ) {
    return {
      ok: true,
      credits: Number(smsCreditsCache.credits || 0),
      cached: true,
    };
  }

  try {
    const { data } = await axios.get(`${BREVO_API_BASE_URL}/account`, {
      headers: {
        "api-key": apiKey,
        Accept: "application/json",
      },
      timeout: 15000,
    });

    const plan = Array.isArray(data?.plan)
      ? data.plan.find((entry) => entry?.type === "sms")
      : null;
    const credits = Number(plan?.credits || 0);

    smsCreditsCache = {
      checkedAt: now,
      credits,
    };

    return {
      ok: true,
      credits,
      cached: false,
    };
  } catch (error) {
    const providerMessage =
      error?.response?.data?.message ||
      error?.response?.data?.code ||
      error?.message ||
      "Unknown error";
    return {
      ok: false,
      error: providerMessage,
    };
  }
};

export const sendBrevoSms = async ({
  recipient,
  content,
  type,
  tag,
  unicodeEnabled,
}) => {
  const config = getBrevoSmsConfig();

  if (!config.enabled) {
    return { sent: false, skipped: true, reason: "brevo_sms_disabled" };
  }

  if (!config.apiKey) {
    return { sent: false, skipped: true, reason: "missing_brevo_sms_api_key" };
  }

  if (config.enforceCreditsCheck) {
    const creditsInfo = await getBrevoSmsCredits(config.apiKey);
    if (creditsInfo.ok && creditsInfo.credits <= 0) {
      return { sent: false, skipped: true, reason: "no_sms_credits", credits: 0 };
    }
    if (!creditsInfo.ok) {
      console.warn("[brevo][sms] credits check failed:", creditsInfo.error);
    }
  }

  let recipientNumber = normalizeSmsRecipient(recipient);
  if (config.forceOverrideRecipient) {
    const overrideNumber = normalizeSmsRecipient(config.overrideRecipient);
    if (overrideNumber) {
      recipientNumber = overrideNumber;
    }
  }

  if (!recipientNumber) {
    return { sent: false, skipped: true, reason: "invalid_sms_recipient" };
  }

  const message = (content || "").toString().trim();
  if (!message) {
    return { sent: false, skipped: true, reason: "missing_sms_content" };
  }

  const payload = {
    sender: config.sender,
    recipient: recipientNumber,
    content: message,
    type: (type || config.type || "transactional").toLowerCase(),
    unicodeEnabled:
      typeof unicodeEnabled === "boolean"
        ? unicodeEnabled
        : config.unicodeEnabled,
    ...(tag || config.tag ? { tag: tag || config.tag } : {}),
    ...(config.webUrl ? { webUrl: config.webUrl } : {}),
    ...(config.organisationPrefix
      ? { organisationPrefix: config.organisationPrefix }
      : {}),
  };

  try {
    const { data } = await axios.post(
      `${BREVO_API_BASE_URL}/transactionalSMS/send`,
      payload,
      {
        headers: {
          "api-key": config.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 15000,
      }
    );

    return { sent: true, provider: "brevo_sms_api", data };
  } catch (error) {
    const providerMessage =
      error?.response?.data?.message ||
      error?.response?.data?.code ||
      error?.message ||
      "Unknown error";
    console.error("[brevo][sms] send failed:", providerMessage);
    return { sent: false, error: providerMessage };
  }
};
