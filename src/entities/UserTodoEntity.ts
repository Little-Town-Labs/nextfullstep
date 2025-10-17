import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

/**
 * UserTodoEntity - Represents personal todos created by users
 * Separate from AI-generated roadmap tasks but can be linked to them
 */
@Entity({ name: "user_todos" })
export class UserTodoEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 36 })
  @Index() // Index for fast user queries
  userId!: string; // Clerk user ID

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  // Categorization
  @Column({
    type: "varchar",
    length: 50,
    default: "personal_upskilling"
  })
  category!: "ai_suggested" | "personal_upskilling" | "general";

  @Column({
    type: "varchar",
    length: 50,
    default: "normal"
  })
  priority!: "critical" | "high" | "normal" | "low";

  @Column({
    type: "varchar",
    length: 50,
    default: "pending"
  })
  @Index() // Index for filtering by status
  status!: "pending" | "in_progress" | "completed" | "archived";

  // Relationships to roadmaps
  @Column({ type: "varchar", length: 36, nullable: true })
  @Index() // Index for roadmap queries
  linkedToRoadmapId?: string; // Links to RoadmapEntity.id

  @Column({ type: "varchar", length: 36, nullable: true })
  @Index() // Index for task queries
  linkedToTaskId?: string; // Links to RoadmapTaskEntity.id

  // Source tracking
  @Column({
    type: "varchar",
    length: 50,
    default: "user_created"
  })
  source!: "user_created" | "ai_chat_extraction" | "roadmap_derived";

  // Additional metadata
  @Column({ type: "text", nullable: true })
  notes?: string; // User notes about the todo

  @Column({ type: "integer", nullable: true })
  estimatedMinutes?: number; // Estimated time to complete (in minutes)

  @Column({ type: "text", nullable: true })
  tags?: string; // JSON array of tags for organization

  // Dates
  @Column({ type: "timestamp", nullable: true })
  @Index() // Index for due date queries
  dueDate?: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  archivedAt?: Date;

  // Timestamps
  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
