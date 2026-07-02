import "dotenv/config";
import cron from "node-cron";
import { runSubscriptionCron } from "../src/lib/subscription-cron";

async function run() {
  console.log(`[cron] Running subscription job at ${new Date().toISOString()}`);
  try {
    const result = await runSubscriptionCron();
    console.log("[cron] Completed:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("[cron] Failed:", err);
    process.exitCode = 1;
  }
}

// Every day at 6:00 AM IST
cron.schedule("0 6 * * *", run, { timezone: "Asia/Kolkata" });

console.log("[cron] Scheduled daily at 6:00 AM IST (Asia/Kolkata)");

if (process.env.CRON_RUN_ON_START === "true") {
  run().catch(console.error);
}
