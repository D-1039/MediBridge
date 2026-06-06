/**
 * Seed demo accounts for MediBridge integration testing.
 * Run: node scripts/seed-demo-users.js (from backend/, after migrate)
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool } = require("../src/config/database");

const DEMO_PASSWORD = "password123";

const users = [
  { full_name: "Admin User", email: "admin@medibridge.health", role: "admin" },
  { full_name: "Demo Donor", email: "donor@medibridge.health", role: "donor" },
  {
    full_name: "Demo Pharmacist",
    email: "pharmacist@medibridge.health",
    role: "pharmacist",
  },
  {
    full_name: "Demo Receiver",
    email: "receiver@medibridge.health",
    role: "receiver",
  },
];

async function seed() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 12);
  for (const u of users) {
    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4::user_role)
       ON CONFLICT (email) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role`,
      [u.full_name, u.email.toLowerCase(), hash, u.role]
    );
    console.log(`✓ ${u.role}: ${u.email}`);
  }
  console.log(`\nPassword for all: ${DEMO_PASSWORD}`);
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
