import "reflect-metadata";
import { initializeDatabase } from "../lib/data-source";

/**
 * List all tables in the database
 * Run with: npx tsx src/scripts/list-database-tables.ts
 */

async function listDatabaseTables() {
  console.log("🔍 Fetching database tables...\n");

  try {
    const dataSource = await initializeDatabase();

    // Query to get all tables
    const tables = await dataSource.query(`
      SELECT
        table_schema,
        table_name,
        table_type
      FROM
        information_schema.tables
      WHERE
        table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY
        table_schema, table_name;
    `);

    console.log("📊 Tables in Database:");
    console.log("=".repeat(80));
    console.log(
      `${"Schema".padEnd(20)} ${"Table Name".padEnd(40)} ${"Type".padEnd(15)}`
    );
    console.log("=".repeat(80));

    for (const table of tables) {
      console.log(
        `${table.table_schema.padEnd(20)} ${table.table_name.padEnd(40)} ${table.table_type.padEnd(15)}`
      );
    }

    console.log("=".repeat(80));
    console.log(`\nTotal tables found: ${tables.length}\n`);

    // Get table sizes
    console.log("💾 Table Sizes:");
    console.log("=".repeat(80));

    const sizes = await dataSource.query(`
      SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
      FROM
        pg_tables
      WHERE
        schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY
        size_bytes DESC;
    `);

    console.log(
      `${"Schema".padEnd(20)} ${"Table Name".padEnd(40)} ${"Size".padEnd(15)}`
    );
    console.log("=".repeat(80));

    for (const table of sizes) {
      console.log(
        `${table.schemaname.padEnd(20)} ${table.tablename.padEnd(40)} ${table.size.padEnd(15)}`
      );
    }

    console.log("=".repeat(80));

    // List entities that SHOULD exist (from data-source.ts)
    console.log("\n✅ Expected Tables (from TypeORM entities):");
    console.log("=".repeat(80));
    const expectedTables = [
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

    expectedTables.forEach((table) => {
      const exists = tables.some(
        (t: any) => t.table_name === table && t.table_schema === "public"
      );
      const status = exists ? "✓ EXISTS" : "✗ MISSING";
      console.log(`  ${status.padEnd(15)} ${table}`);
    });

    // Find tables that exist but are NOT in our entities
    console.log("\n⚠️  Unexpected Tables (not in TypeORM entities):");
    console.log("=".repeat(80));

    const unexpectedTables = tables.filter(
      (t: any) =>
        t.table_schema === "public" &&
        !expectedTables.includes(t.table_name) &&
        !t.table_name.startsWith("typeorm_") // Ignore TypeORM migration tables
    );

    if (unexpectedTables.length === 0) {
      console.log("  No unexpected tables found. Database is clean! ✨");
    } else {
      unexpectedTables.forEach((table: any) => {
        console.log(`  ⚠️  ${table.table_name} (${table.table_type})`);
      });
      console.log(
        `\n  Total unexpected tables: ${unexpectedTables.length}`
      );
    }

    console.log("\n" + "=".repeat(80));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error listing database tables:", error);
    process.exit(1);
  }
}

// Run the script
listDatabaseTables();
