import axios from "axios";

const API_BASE_URL = "https://graph.facebook.com/v22.0";

const getCredentials = () => {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error("WhatsApp credentials are missing");
  }

  return { phoneNumberId, accessToken };
};

const postMessage = async (payload) => {
  const { phoneNumberId, accessToken } = getCredentials();
  const url = `${API_BASE_URL}/${phoneNumberId}/messages`;

  const res = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return res.data;
};

export const sendWhatsAppText = async ({ to, text }) => {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  };

  return postMessage(payload);
};

export const sendWhatsAppTemplate = async ({ to, name, language }) => {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name,
      language: { code: language || "en_US" },
    },
  };

  return postMessage(payload);
};
