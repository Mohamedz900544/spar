import axios from "axios";

const DEFAULT_COUNTRY_CODE = (process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "20").replace(
  /\D/g,
  ""
);

const getWhatsAppConfig = () => ({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  graphVersion: process.env.WHATSAPP_GRAPH_VERSION || "v25.0",
});

const isWhatsAppConfigured = ({ accessToken, phoneNumberId }) =>
  Boolean(accessToken && phoneNumberId);

export const normalizePhoneForWhatsApp = (phone) => {
  const digits = (phone || "").toString().replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith(DEFAULT_COUNTRY_CODE)) return digits;
  if (digits.startsWith("0")) return `${DEFAULT_COUNTRY_CODE}${digits.slice(1)}`;
  return digits;
};

export const sendWhatsAppText = async ({ to, body }) => {
  const config = getWhatsAppConfig();
  const normalizedTo = normalizePhoneForWhatsApp(to);

  if (!normalizedTo || !body?.trim()) {
    return { sent: false, skipped: true, reason: "missing_to_or_body" };
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
    const providerMessage =
      error?.response?.data?.error?.message || error?.message || "Unknown error";
    console.error("[whatsapp] send failed:", providerMessage);
    return { sent: false, error: providerMessage };
  }
};

export const sendWhatsAppTemplate = async ({
  to,
  templateName,
  languageCode = "en_US",
  bodyParams = [],
}) => {
  const config = getWhatsAppConfig();
  const normalizedTo = normalizePhoneForWhatsApp(to);

  if (!normalizedTo || !templateName?.trim()) {
    return { sent: false, skipped: true, reason: "missing_to_or_template" };
  }

  if (!isWhatsAppConfigured(config)) {
    return { sent: false, skipped: true, reason: "missing_whatsapp_config" };
  }

  const endpoint = `https://graph.facebook.com/${config.graphVersion}/${config.phoneNumberId}/messages`;
  const components =
    Array.isArray(bodyParams) && bodyParams.length
      ? [
          {
            type: "body",
            parameters: bodyParams.map((value) => ({
              type: "text",
              text: `${value ?? ""}`.slice(0, 1024),
            })),
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
    const providerMessage =
      error?.response?.data?.error?.message || error?.message || "Unknown error";
    console.error("[whatsapp] template send failed:", providerMessage);
    return { sent: false, error: providerMessage };
  }
};
