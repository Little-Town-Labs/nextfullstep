import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration to change user_todos.title from varchar(255) to text
 * This allows longer task titles from AI-generated roadmap tasks
 */
export class AlterTodoTitleToText1729338000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Alter the title column from varchar(255) to text
    await queryRunner.query(`
      ALTER TABLE "user_todos"
      ALTER COLUMN "title" TYPE text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to varchar(255)
    // WARNING: This may truncate data if any titles are longer than 255 chars
    await queryRunner.query(`
      ALTER TABLE "user_todos"
      ALTER COLUMN "title" TYPE varchar(255)
    `);
  }
}
