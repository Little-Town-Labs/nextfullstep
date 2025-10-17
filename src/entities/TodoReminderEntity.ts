import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { UserTodoEntity } from "./UserTodoEntity";

/**
 * TodoReminderEntity - Manages reminders for user todos
 * Future enhancement for notification system
 */
@Entity({ name: "todo_reminders" })
export class TodoReminderEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Foreign key relationship to UserTodoEntity with CASCADE delete
  @ManyToOne(() => UserTodoEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "todoId" })
  todo!: UserTodoEntity;

  @Column({ type: "uuid" })
  @Index() // Index for fast todo queries
  todoId!: string; // Links to UserTodoEntity.id

  @Column({ type: "uuid" })
  @Index() // Index for user queries
  userId!: string; // Clerk user ID

  @Column({ type: "timestamp" })
  @Index() // Index for scheduling queries
  reminderTime!: Date; // When to send the reminder

  // Reminder configuration
  @Column({
    type: "enum",
    enum: ["once", "daily", "weekly", "custom"],
    default: "once"
  })
  frequency!: "once" | "daily" | "weekly" | "custom";

  @Column({
    type: "enum",
    enum: ["email", "push", "in_app", "all"],
    default: "email"
  })
  method!: "email" | "push" | "in_app" | "all";

  @Column({
    type: "enum",
    enum: ["pending", "sent", "failed", "canceled"],
    default: "pending"
  })
  status!: "pending" | "sent" | "failed" | "canceled";

  // Content
  @Column({ type: "varchar", length: 255, nullable: true })
  customMessage?: string; // Custom reminder message

  // Tracking
  @Column({ type: "timestamp", nullable: true })
  sentAt?: Date;

  @Column({ type: "integer", default: 0 })
  attemptCount!: number; // Number of send attempts

  @Column({ type: "text", nullable: true })
  errorMessage?: string; // Error details if failed

  // Timestamps
  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
