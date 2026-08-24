const fs = require("fs");
const { Client } = require("pg");

const connectionString = "postgresql://medibridge_db_e9q5_user:bYdaxT5uNa8Q62HPDy52a6HDl6IHsMZq@dpg-da69c7e1egvs739rk28g-a.oregon-postgres.render.com/medibridge_db_e9q5?ssl=true";

const client = new Client({ 
  connectionString, 
  ssl: { rejectUnauthorized: false } 
});

async function run() {
  await client.connect();
  const files = [
    "migrations/001_initial_schema.sql",
    "migrations/002_add_user_roles.sql",
    "migrations/003_add_ocr_metadata.sql",
    "migrations/004_add_medicine_status.sql",
    "migrations/005_batch_number_verification.sql"
  ];

  for (const file of files) {
    console.log(`Applying ${file}...`);
    const sql = fs.readFileSync(file, "utf8");
    await client.query(sql);
  }

  console.log("All migrations applied successfully!");
  await client.end();
}

run().catch(console.error);
