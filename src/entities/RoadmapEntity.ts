import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "roadmaps" })
export class RoadmapEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 36 })
  userId!: string;

  @Column({ type: "varchar", length: 36 })
  assessmentId!: string; // Links to CareerAssessmentEntity

  @Column({ type: "varchar", length: 100 })
  roleId!: string; // ai-prompt-engineer, ai-content-creator, ai-coach

  @Column({ type: "varchar", length: 255 })
  roleName!: string;

  @Column({ type: "varchar", length: 50, default: "active" })
  status!: string; // active, paused, completed, archived

  @Column({ type: "text", nullable: true })
  phases?: string; // JSON array of phase objects with tasks

  @Column({ type: "integer", default: 0 })
  totalTasks!: number;

  @Column({ type: "integer", default: 0 })
  completedTasks!: number;

  @Column({ type: "integer", default: 0 })
  progressPercentage!: number; // 0-100

  @Column({ type: "integer", default: 0 })
  daysActive!: number; // Days since roadmap created

  @Column({ type: "integer", default: 0 })
  currentStreak!: number; // Days of consecutive activity

  @Column({ type: "integer", default: 0 })
  longestStreak!: number;

  @Column({ type: "timestamp", nullable: true })
  lastActivityDate?: Date;

  @Column({ type: "timestamp", nullable: true })
  targetCompletionDate?: Date;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
