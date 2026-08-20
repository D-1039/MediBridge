const path = require("path");
const { Client } = require("pg");
const { PostgresInstance } = require("pg-embedded");

const DATA_DIR = path.join(__dirname, "../.pg-data");
const PORT = 5433;

async function waitForDb(connectionString, attempts = 30) {
  for (let i = 0; i < attempts; i += 1) {
    const client = new Client({ connectionString });
    try {
      await client.connect();
      await client.query("SELECT 1");
      await client.end();
      return;
    } catch {
      await client.end().catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error("Embedded PostgreSQL did not become ready in time");
}

async function main() {
  // If a Postgres server is already running on the configured port, reuse it.
  const baseUrl = `postgresql://postgres:postgres@127.0.0.1:${PORT}/postgres`;
  const { Client } = require("pg");
  const client = new Client({ connectionString: baseUrl });
  try {
    await client.connect();
    await client.query("SELECT 1");
    console.log(`Found existing PostgreSQL on port ${PORT}, reusing it.`);
    // Ensure the target database exists
    const r = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'medibridge'"
    );
    if (r.rowCount === 0) {
      await client.query("CREATE DATABASE medibridge");
      console.log("Database medibridge created");
    } else {
      console.log("Database medibridge already exists");
    }
    await client.end();
    const databaseUrl = `postgresql://postgres:postgres@127.0.0.1:${PORT}/medibridge`;
    await waitForDb(databaseUrl);
    console.log(`Embedded PostgreSQL ready on port ${PORT}`);
    console.log(`DATABASE_URL=${databaseUrl}`);
    // Keep Node alive so callers using this script can rely on DB availability.
    setInterval(() => {}, 60 * 60 * 1000);
    return;
  } catch (e) {
    // No server found on the port — continue to start an embedded instance.
    try {
      await client.end();
    } catch {}
  }

  const postgres = new PostgresInstance({
    port: PORT,
    username: "postgres",
    password: "postgres",
    persistent: true,
    dataDir: DATA_DIR,
    setupTimeout: 300,
  });

  await postgres.start();

  await waitForDb(baseUrl);

  const exists = await postgres.databaseExists("medibridge");
  if (!exists) {
    await postgres.createDatabase("medibridge");
  }

  const databaseUrl = `postgresql://postgres:postgres@127.0.0.1:${PORT}/medibridge`;
  await waitForDb(databaseUrl);

  console.log(`Embedded PostgreSQL ready on port ${PORT}`);
  console.log(`DATABASE_URL=${databaseUrl}`);

  const shutdown = async () => {
    await postgres.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Keep Node alive so the embedded server keeps running.
  setInterval(() => {}, 60 * 60 * 1000);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
