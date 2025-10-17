import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

/**
 * Migration to create user_todos and todo_reminders tables
 * Run this migration when synchronize is disabled in production
 */
export class CreateUserTodoTables1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user_todos table
    await queryRunner.createTable(
      new Table({
        name: "user_todos",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "userId",
            type: "uuid",
          },
          {
            name: "title",
            type: "varchar",
            length: "255",
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "category",
            type: "varchar",
            length: "50",
            default: "'personal_upskilling'",
          },
          {
            name: "priority",
            type: "varchar",
            length: "50",
            default: "'normal'",
          },
          {
            name: "status",
            type: "varchar",
            length: "50",
            default: "'pending'",
          },
          {
            name: "linkedToRoadmapId",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "linkedToTaskId",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "source",
            type: "varchar",
            length: "50",
            default: "'user_created'",
          },
          {
            name: "notes",
            type: "text",
            isNullable: true,
          },
          {
            name: "estimatedMinutes",
            type: "integer",
            isNullable: true,
          },
          {
            name: "tags",
            type: "text",
            isNullable: true,
          },
          {
            name: "dueDate",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "completedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "archivedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    // Create trigger function to auto-update updatedAt timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger on user_todos to auto-update updatedAt on row modification
    await queryRunner.query(`
      CREATE TRIGGER update_user_todos_updated_at
      BEFORE UPDATE ON "user_todos"
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create indexes for user_todos
    await queryRunner.createIndex(
      "user_todos",
      new TableIndex({
        name: "IDX_USER_TODOS_USER_ID",
        columnNames: ["userId"],
      })
    );

    await queryRunner.createIndex(
      "user_todos",
      new TableIndex({
        name: "IDX_USER_TODOS_STATUS",
        columnNames: ["status"],
      })
    );

    await queryRunner.createIndex(
      "user_todos",
      new TableIndex({
        name: "IDX_USER_TODOS_DUE_DATE",
        columnNames: ["dueDate"],
      })
    );

    await queryRunner.createIndex(
      "user_todos",
      new TableIndex({
        name: "IDX_USER_TODOS_ROADMAP_ID",
        columnNames: ["linkedToRoadmapId"],
      })
    );

    await queryRunner.createIndex(
      "user_todos",
      new TableIndex({
        name: "IDX_USER_TODOS_TASK_ID",
        columnNames: ["linkedToTaskId"],
      })
    );

    // Create todo_reminders table
    await queryRunner.createTable(
      new Table({
        name: "todo_reminders",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "todoId",
            type: "uuid",
          },
          {
            name: "userId",
            type: "uuid",
          },
          {
            name: "reminderTime",
            type: "timestamp",
          },
          {
            name: "frequency",
            type: "varchar",
            length: "50",
            default: "'once'",
          },
          {
            name: "method",
            type: "varchar",
            length: "50",
            default: "'email'",
          },
          {
            name: "status",
            type: "varchar",
            length: "50",
            default: "'pending'",
          },
          {
            name: "customMessage",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "sentAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "attemptCount",
            type: "integer",
            default: 0,
          },
          {
            name: "errorMessage",
            type: "text",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    // Create trigger on todo_reminders to auto-update updatedAt on row modification
    await queryRunner.query(`
      CREATE TRIGGER update_todo_reminders_updated_at
      BEFORE UPDATE ON "todo_reminders"
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create indexes for todo_reminders
    await queryRunner.createIndex(
      "todo_reminders",
      new TableIndex({
        name: "IDX_TODO_REMINDERS_TODO_ID",
        columnNames: ["todoId"],
      })
    );

    await queryRunner.createIndex(
      "todo_reminders",
      new TableIndex({
        name: "IDX_TODO_REMINDERS_USER_ID",
        columnNames: ["userId"],
      })
    );

    await queryRunner.createIndex(
      "todo_reminders",
      new TableIndex({
        name: "IDX_TODO_REMINDERS_TIME",
        columnNames: ["reminderTime"],
      })
    );

    // Add foreign key constraint to enforce referential integrity
    await queryRunner.query(`
      ALTER TABLE "todo_reminders"
      ADD CONSTRAINT "FK_TODO_REMINDERS_TODO_ID"
      FOREIGN KEY ("todoId")
      REFERENCES "user_todos"("id")
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint first
    await queryRunner.query(`
      ALTER TABLE "todo_reminders"
      DROP CONSTRAINT IF EXISTS "FK_TODO_REMINDERS_TODO_ID"
    `);

    // Drop triggers
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_todo_reminders_updated_at ON "todo_reminders"
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_user_todos_updated_at ON "user_todos"
    `);

    // Drop indexes
    await queryRunner.dropIndex("todo_reminders", "IDX_TODO_REMINDERS_TIME");
    await queryRunner.dropIndex("todo_reminders", "IDX_TODO_REMINDERS_USER_ID");
    await queryRunner.dropIndex("todo_reminders", "IDX_TODO_REMINDERS_TODO_ID");

    await queryRunner.dropIndex("user_todos", "IDX_USER_TODOS_TASK_ID");
    await queryRunner.dropIndex("user_todos", "IDX_USER_TODOS_ROADMAP_ID");
    await queryRunner.dropIndex("user_todos", "IDX_USER_TODOS_DUE_DATE");
    await queryRunner.dropIndex("user_todos", "IDX_USER_TODOS_STATUS");
    await queryRunner.dropIndex("user_todos", "IDX_USER_TODOS_USER_ID");

    // Drop tables
    await queryRunner.dropTable("todo_reminders");
    await queryRunner.dropTable("user_todos");

    // Drop trigger function
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS update_updated_at_column()
    `);
  }
}
