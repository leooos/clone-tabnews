import { createRouter } from "next-connect";
import controller from "infra/controller";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const isDryRun = true;
  const pendingMigrations = await runMigrations(isDryRun);
  return response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  const isDryRun = false;
  const migratedMigrations = await runMigrations(isDryRun);

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }
  return response.status(200).json(migratedMigrations);
}

async function runMigrations(isDryRun) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const defaultMigrationOptions = {
      dbClient: dbClient,
      dryRun: isDryRun,
      dir: resolve("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (isDryRun) {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      return pendingMigrations;
    }

    if (!isDryRun) {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });
      return migratedMigrations;
    }
  } finally {
    await dbClient.end();
  }
}
