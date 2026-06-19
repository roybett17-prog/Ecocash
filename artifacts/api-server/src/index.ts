import app from "./app";
import { logger } from "./lib/logger";
import { registerTelegramWebhook } from "./lib/telegram.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Auto-register Telegram webhook on startup
  // Uses REPLIT_DOMAINS (dev) or REPLIT_DEPLOYMENT_DOMAIN (production)
  const domain =
    process.env.REPLIT_DOMAINS?.split(",")[0] ??
    process.env.REPLIT_DEPLOYMENT_DOMAIN ??
    null;

  if (domain) {
    const webhookUrl = `https://${domain}/api/telegram/webhook`;
    logger.info({ webhookUrl }, "Registering Telegram webhook");
    await registerTelegramWebhook(webhookUrl);
  } else {
    logger.warn("No REPLIT_DOMAINS found — Telegram webhook not registered automatically");
  }
});
