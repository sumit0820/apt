import "dotenv/config";
import { runSubscriptionCron } from "../src/lib/subscription-cron";

runSubscriptionCron()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
