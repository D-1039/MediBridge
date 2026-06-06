require("dotenv").config();
const { Client } = require("pg");

async function main() {
  const baseUrl = process.env.DATABASE_URL.replace(/\/medibridge.*$/, "/postgres");
  const client = new Client({ connectionString: baseUrl });
  await client.connect();
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
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
