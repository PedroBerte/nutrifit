#!/usr/bin/env node
// Run this once to create the CrossFit migration file and apply it to the DB
// Usage: node create-crossfit-migration.js
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { execSync } = require("child_process");

// Load .env manually (no dotenv dep needed)
const envFile = path.join(__dirname, ".env");
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, "utf8").split("\n");
  for (const line of lines) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
}

const dir = path.join(__dirname, "prisma", "migrations", "20260305000000_add_crossfit_fields");
const file = path.join(dir, "migration.sql");

const sql = `-- AlterTable ExerciseTemplate: add CrossFit fields
ALTER TABLE "ExerciseTemplate" ADD COLUMN IF NOT EXISTS "setType" TEXT NOT NULL DEFAULT 'Reps';
ALTER TABLE "ExerciseTemplate" ADD COLUMN IF NOT EXISTS "weightUnit" TEXT NOT NULL DEFAULT 'kg';
ALTER TABLE "ExerciseTemplate" ADD COLUMN IF NOT EXISTS "isBisetWithPrevious" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ExerciseTemplate" ADD COLUMN IF NOT EXISTS "targetDurationSeconds" INTEGER;
ALTER TABLE "ExerciseTemplate" ADD COLUMN IF NOT EXISTS "targetCalories" DECIMAL(65,30);

-- AlterTable SetSession: add duration and calories
ALTER TABLE "SetSession" ADD COLUMN IF NOT EXISTS "durationSeconds" INTEGER;
ALTER TABLE "SetSession" ADD COLUMN IF NOT EXISTS "calories" DECIMAL(65,30);
`;

// Step 1: Create migration file
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, sql);
console.log("✓ Migration file created:", file);

// Step 2: Apply migration directly to DB
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("✗ DATABASE_URL not set. Set it in .env");
  process.exit(1);
}

const client = new Client({ connectionString: dbUrl });

async function applyMigration() {
  await client.connect();
  console.log("✓ Connected to database");

  try {
    await client.query(sql);
    console.log("✓ SQL columns added");

    // Record in _prisma_migrations table so prisma knows it's applied
    const migrationName = "20260305000000_add_crossfit_fields";
    await client.query(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (gen_random_uuid(), 'manual', NOW(), $1, NULL, NULL, NOW(), 1)
      ON CONFLICT (migration_name) DO NOTHING
    `, [migrationName]);
    console.log("✓ Migration recorded in _prisma_migrations");
  } finally {
    await client.end();
  }

  // Step 3: Regenerate Prisma Client
  console.log("✓ Regenerating Prisma Client...");
  execSync("npx prisma generate", { stdio: "inherit", cwd: __dirname });
  console.log("✓ Prisma Client regenerated!");
  console.log("");
  console.log("Done! Now restart your dev server: npm run dev");
}

applyMigration().catch((err) => {
  console.error("✗ Error:", err.message);
  process.exit(1);
});
