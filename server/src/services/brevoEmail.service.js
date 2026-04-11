import axios from "axios";
import { createTransport } from "nodemailer";

const BREVO_API_BASE_URL = "https://api.brevo.com/v3";
const BREVO_FIXED_SENDER_NAME = "Sparvi Lab";
const BREVO_BRAND_IMAGE_URL = "https://i.ibb.co/gFbR9ptZ/instructor-team.jpg";

const getBrevoConfig = () => ({
  enabled: process.env.BREVO_EMAIL_ENABLED !== "false",
  apiKey: process.env.BREVO_API_KEY || "",
  senderEmail: process.env.BREVO_SENDER_EMAIL || "",
  senderName: BREVO_FIXED_SENDER_NAME,
  overrideRecipient: process.env.BREVO_OVERRIDE_RECIPIENT || "",
  smtpHost: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
  smtpPort: Number(process.env.BREVO_SMTP_PORT || 587),
  smtpSecure: process.env.BREVO_SMTP_SECURE === "true",
  smtpLogin: process.env.BREVO_SMTP_LOGIN || "",
  smtpPassword: process.env.BREVO_SMTP_PASSWORD || "",
});

const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").toString().trim());

const escapeHtml = (value = "") =>
  `${value}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildBrandedHtml = (htmlContent = "", textContent = "") => {
  const hasCustomHtml = Boolean((htmlContent || "").toString().trim());
  const safeTextFallback = escapeHtml(textContent || "").replace(/\n/g, "<br />");
  const content = hasCustomHtml
    ? htmlContent
    : `<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;color:#0f172a;line-height:1.6;font-size:14px;">${safeTextFallback}</div>`;

  return `
    <div style="background:#f8fafc;padding:18px 12px;">
      <div style="max-width:720px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:12px;">
          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:999px;padding:8px 12px;display:inline-block;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle;">
                  <img
                    src="${BREVO_BRAND_IMAGE_URL}"
                    alt="Sparvi Lab"
                    width="42"
                    height="42"
                    style="display:block;width:42px;height:42px;border-radius:50%;object-fit:cover;"
                  />
                </td>
                <td style="vertical-align:middle;padding-left:10px;">
                  <span style="font-family:Arial,sans-serif;font-size:16px;line-height:1.2;font-weight:700;color:#102a5a;">
                    ${BREVO_FIXED_SENDER_NAME}
                  </span>
                </td>
              </tr>
            </table>
          </div>
        </div>
        ${content}
      </div>
    </div>
  `;
};

export const sendBrevoEmail = async ({
  to,
  toName = "",
  subject,
  textContent = "",
  htmlContent = "",
  replyTo = null,
}) => {
  const config = getBrevoConfig();

  if (!config.enabled) {
    return { sent: false, skipped: true, reason: "brevo_disabled" };
  }

  if (!config.senderEmail) {
    return { sent: false, skipped: true, reason: "missing_brevo_sender_email" };
  }

  let recipientEmail = (to || "").toString().trim();
  if (config.overrideRecipient && isEmail(config.overrideRecipient)) {
    recipientEmail = config.overrideRecipient.trim();
  }

  if (!isEmail(recipientEmail)) {
    return { sent: false, skipped: true, reason: "invalid_recipient_email" };
  }

  const finalSubject = (subject || "").toString().trim();
  if (!finalSubject) {
    return { sent: false, skipped: true, reason: "missing_subject" };
  }

  const hasText = Boolean((textContent || "").toString().trim());
  const hasOriginalHtml = Boolean((htmlContent || "").toString().trim());
  if (!hasText && !hasOriginalHtml) {
    return { sent: false, skipped: true, reason: "missing_email_content" };
  }
  const finalHtmlContent = buildBrandedHtml(htmlContent, textContent);
  const hasHtml = Boolean(finalHtmlContent.trim());

  const messagePayload = {
    sender: {
      email: config.senderEmail,
      name: config.senderName,
    },
    to: [
      {
        email: recipientEmail,
        ...(toName ? { name: toName } : {}),
      },
    ],
    subject: finalSubject,
    ...(hasText ? { textContent } : {}),
    ...(hasHtml ? { htmlContent: finalHtmlContent } : {}),
    ...(replyTo && isEmail(replyTo.email)
      ? {
          replyTo: {
            email: replyTo.email.trim(),
            ...(replyTo.name ? { name: replyTo.name } : {}),
          },
        }
      : {}),
  };

  // Prefer API key auth when available.
  if (config.apiKey) {
    try {
      const { data } = await axios.post(
        `${BREVO_API_BASE_URL}/smtp/email`,
        messagePayload,
        {
          headers: {
            "api-key": config.apiKey,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 15000,
        }
      );

      return { sent: true, provider: "brevo_api", data };
    } catch (error) {
      const providerMessage =
        error?.response?.data?.message ||
        error?.response?.data?.code ||
        error?.message ||
        "Unknown error";
      console.error("[brevo][api] send failed:", providerMessage);
      // Continue to SMTP fallback if configured.
    }
  }

  if (!config.smtpLogin || !config.smtpPassword) {
    return { sent: false, skipped: true, reason: "missing_brevo_api_and_smtp_config" };
  }

  try {
    const transporter = createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpLogin,
        pass: config.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: toName ? `"${toName}" <${recipientEmail}>` : recipientEmail,
      subject: finalSubject,
      ...(hasText ? { text: textContent } : {}),
      ...(hasHtml ? { html: finalHtmlContent } : {}),
      ...(replyTo && isEmail(replyTo.email)
        ? {
            replyTo: replyTo.name
              ? `"${replyTo.name}" <${replyTo.email.trim()}>`
              : replyTo.email.trim(),
          }
        : {}),
    });

    return { sent: true, provider: "brevo_smtp", data: info };
  } catch (error) {
    const providerMessage =
      error?.message ||
      "Unknown error";
    console.error("[brevo][smtp] send failed:", providerMessage);
    return { sent: false, error: providerMessage };
  }
};
