import "reflect-metadata";
import { initializeDatabase } from "../lib/data-source";
import * as readline from "readline";

/**
 * Cleanup Database Tables
 * Drops tables that are not defined in TypeORM entities
 *
 * Run with: npx tsx src/scripts/cleanup-database-tables.ts
 *
 * WARNING: This script will permanently delete tables and their data!
 * Always backup your database before running this script.
 */

// Expected tables based on our TypeORM entities
const EXPECTED_TABLES = [
  "user",
  "career_role",
  "career_assessment",
  "roadmap",
  "roadmap_task",
  "user_todo",
  "todo_reminder",
  "ai_model_config",
  "ai_usage_log",
  "audit_log",
  "api_key",
];

// Tables to protect (never drop these even if they're not in entities)
const PROTECTED_TABLES = [
  "typeorm_metadata", // TypeORM system table
  "migrations", // Migration tracking
  "pg_stat_statements", // PostgreSQL stats
];

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function cleanupDatabaseTables() {
  console.log("🧹 Database Table Cleanup Script");
  console.log("=".repeat(80));
  console.log("⚠️  WARNING: This will permanently delete tables and their data!");
  console.log("=".repeat(80));
  console.log("");

  try {
    const dataSource = await initializeDatabase();

    // Get all tables
    const tables = await dataSource.query(`
      SELECT
        table_schema,
        table_name
      FROM
        information_schema.tables
      WHERE
        table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY
        table_name;
    `);

    console.log(`📊 Found ${tables.length} tables in the database\n`);

    // Identify tables to drop
    const tablesToDrop = tables.filter(
      (t: any) =>
        !EXPECTED_TABLES.includes(t.table_name) &&
        !PROTECTED_TABLES.includes(t.table_name) &&
        !t.table_name.startsWith("typeorm_") &&
        !t.table_name.startsWith("pg_")
    );

    if (tablesToDrop.length === 0) {
      console.log("✅ No unused tables found. Database is clean!");
      process.exit(0);
    }

    console.log("❌ Tables marked for deletion:");
    console.log("=".repeat(80));
    tablesToDrop.forEach((table: any, index: number) => {
      console.log(`  ${index + 1}. ${table.table_name}`);
    });
    console.log("=".repeat(80));
    console.log(
      `\nTotal tables to drop: ${tablesToDrop.length}\n`
    );

    // Get row counts for tables to be dropped
    console.log("📊 Data in tables to be dropped:");
    console.log("=".repeat(80));
    for (const table of tablesToDrop) {
      try {
        const result = await dataSource.query(
          `SELECT COUNT(*) as count FROM "${table.table_name}"`
        );
        const count = parseInt(result[0].count);
        console.log(
          `  ${table.table_name.padEnd(40)} ${count.toLocaleString()} rows`
        );
      } catch (error) {
        console.log(
          `  ${table.table_name.padEnd(40)} (unable to count rows)`
        );
      }
    }
    console.log("=".repeat(80));
    console.log("");

    // Confirmation prompt
    const answer1 = await promptUser(
      "⚠️  Are you sure you want to drop these tables? Type 'yes' to continue: "
    );

    if (answer1.toLowerCase() !== "yes") {
      console.log("\n❌ Cleanup cancelled.");
      process.exit(0);
    }

    const answer2 = await promptUser(
      "⚠️  This action cannot be undone. Type 'DELETE' to confirm: "
    );

    if (answer2 !== "DELETE") {
      console.log("\n❌ Cleanup cancelled.");
      process.exit(0);
    }

    console.log("\n🗑️  Dropping tables...\n");

    // Drop tables
    let successCount = 0;
    let errorCount = 0;

    for (const table of tablesToDrop) {
      try {
        // Drop table with CASCADE to remove dependencies
        await dataSource.query(
          `DROP TABLE IF EXISTS "${table.table_name}" CASCADE`
        );
        console.log(`  ✅ Dropped: ${table.table_name}`);
        successCount++;
      } catch (error: any) {
        console.error(`  ❌ Failed to drop ${table.table_name}: ${error.message}`);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("🎉 Cleanup Complete!");
    console.log("=".repeat(80));
    console.log(`  ✅ Successfully dropped: ${successCount} tables`);
    if (errorCount > 0) {
      console.log(`  ❌ Failed to drop: ${errorCount} tables`);
    }
    console.log("=".repeat(80));

    // Show remaining tables
    const remainingTables = await dataSource.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);

    console.log(`\n📊 Remaining tables: ${remainingTables[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during cleanup:", error);
    process.exit(1);
  }
}

// Run the script
cleanupDatabaseTables();
