require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const fs = require("fs");
const path = require("path");
const { pool } = require("../config/database");

const MIGRATIONS_DIR = path.join(__dirname, "../../migrations");

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getApplied() {
  const { rows } = await pool.query(
    "SELECT name FROM schema_migrations ORDER BY id"
  );
  return new Set(rows.map((r) => r.name));
}

async function migrateUp() {
  await ensureMigrationsTable();
  const applied = await getApplied();
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && !f.endsWith(".down.sql"))
    .sort();

  for (const file of files) {
    const name = file.replace(".sql", "");
    if (applied.has(name)) {
      console.log(`Skip: ${name}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
        name,
      ]);
      await client.query("COMMIT");
      console.log(`Applied: ${name}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}

async function migrateDown() {
  const applied = await getApplied();
  const downs = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".down.sql"))
    .sort()
    .reverse();

  for (const file of downs) {
    const name = file.replace(".down.sql", "");
    if (!applied.has(name)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("DELETE FROM schema_migrations WHERE name = $1", [
        name,
      ]);
      await client.query("COMMIT");
      console.log(`Rolled back: ${name}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}

const cmd = process.argv[2];
(async () => {
  try {
    if (cmd === "down") await migrateDown();
    else await migrateUp();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
