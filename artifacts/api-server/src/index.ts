import app from "./app";
import { logger } from "./lib/logger";
import { backfillMissingPrototypes } from "./lib/prototypes";

const rawPort = process.env["PORT"] ?? "8080";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

try {
  await backfillMissingPrototypes();
} catch (err) {
  logger.warn({ err }, "Prototype backfill skipped");
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
