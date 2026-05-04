import axios from "axios";

const DEFAULT_COUNTRY_CODE = (process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "20").replace(
  /\D/g,
  ""
);

const getWhatsAppConfig = () => ({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  graphVersion: process.env.WHATSAPP_GRAPH_VERSION || "v25.0",
  // In test mode, route ALL outgoing messages to the only allowed recipient.
  // Remove / leave empty when the WhatsApp app goes to production.
  overrideRecipient: process.env.WHATSAPP_OVERRIDE_RECIPIENT || "",
});

const isWhatsAppConfigured = ({ accessToken, phoneNumberId }) =>
  Boolean(accessToken && phoneNumberId);

export const normalizePhoneForWhatsApp = (phone) => {
  const raw = (phone || "").toString().trim();
  if (!raw) return "";

  // If the number starts with +, it already has a country code – just strip non-digits
  if (raw.startsWith("+")) {
    const digits = raw.replace(/\D/g, "");
    return digits || "";
  }

  let digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  // International prefix like 0020... → drop leading 00
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // Already has the default country code
  if (digits.startsWith(DEFAULT_COUNTRY_CODE)) return digits;
  // Common case: Egyptian mobile without leading 0 (10 digits starting with 1)
  if (digits.length === 10 && digits.startsWith("1")) {
    return `${DEFAULT_COUNTRY_CODE}${digits}`;
  }
  // Local number starting with 0 → replace leading 0 with country code
  if (digits.startsWith("0")) return `${DEFAULT_COUNTRY_CODE}${digits.slice(1)}`;
  return digits;
};

export const sendWhatsAppText = async ({ to, body }) => {
  const config = getWhatsAppConfig();
  let normalizedTo = normalizePhoneForWhatsApp(to);

  if (!normalizedTo || !body?.trim()) {
    return { sent: false, skipped: true, reason: "missing_to_or_body" };
  }

  // Test-mode override: redirect to the only allowed recipient
  if (config.overrideRecipient) {
    const overrideTo = normalizePhoneForWhatsApp(config.overrideRecipient);
    if (overrideTo) {
      normalizedTo = overrideTo;
    }
  }

  if (!isWhatsAppConfigured(config)) {
    return { sent: false, skipped: true, reason: "missing_whatsapp_config" };
  }

  const endpoint = `https://graph.facebook.com/${config.graphVersion}/${config.phoneNumberId}/messages`;

  try {
    const { data } = await axios.post(
      endpoint,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizedTo,
        type: "text",
        text: { body: body.trim() },
      },
      {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    return { sent: true, data };
  } catch (error) {
    const providerError = error?.response?.data?.error || null;
    const providerMessage =
      providerError?.message || error?.message || "Unknown error";
    return {
      sent: false,
      error: providerMessage,
      errorCode: providerError?.code,
      errorSubcode: providerError?.error_subcode,
      errorType: providerError?.type,
      fbtraceId: providerError?.fbtrace_id,
    };
  }
};

export const sendWhatsAppTemplate = async ({
  to,
  templateName,
  languageCode = "en_US",
  bodyParams = [],
}) => {
  const config = getWhatsAppConfig();
  let normalizedTo = normalizePhoneForWhatsApp(to);

  if (!normalizedTo || !templateName?.trim()) {
    return { sent: false, skipped: true, reason: "missing_to_or_template" };
  }

  // Test-mode override: redirect to the only allowed recipient
  if (config.overrideRecipient) {
    const overrideTo = normalizePhoneForWhatsApp(config.overrideRecipient);
    if (overrideTo) {
      normalizedTo = overrideTo;
    }
  }

  if (!isWhatsAppConfigured(config)) {
    return { sent: false, skipped: true, reason: "missing_whatsapp_config" };
  }

  const endpoint = `https://graph.facebook.com/${config.graphVersion}/${config.phoneNumberId}/messages`;
  const sanitizeTemplateText = (value) =>
    `${value ?? ""}`
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 1024);

  const toTextParameter = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const parameterName =
        value.parameter_name || value.parameterName || value.name || "";
      const textValue = value.text ?? value.value ?? "";
      return {
        type: "text",
        ...(parameterName ? { parameter_name: `${parameterName}` } : {}),
        text: sanitizeTemplateText(textValue),
      };
    }

    return {
      type: "text",
      text: sanitizeTemplateText(value),
    };
  };
  const components =
    Array.isArray(bodyParams) && bodyParams.length
      ? [
          {
            type: "body",
            parameters: bodyParams.map(toTextParameter),
          },
        ]
      : undefined;

  try {
    const { data } = await axios.post(
      endpoint,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizedTo,
        type: "template",
        template: {
          name: templateName.trim(),
          language: { code: languageCode },
          ...(components ? { components } : {}),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    return { sent: true, data };
  } catch (error) {
    const providerError = error?.response?.data?.error || null;
    const providerMessage =
      providerError?.message || error?.message || "Unknown error";
    return {
      sent: false,
      error: providerMessage,
      errorCode: providerError?.code,
      errorSubcode: providerError?.error_subcode,
      errorType: providerError?.type,
      fbtraceId: providerError?.fbtrace_id,
    };
  }
};
