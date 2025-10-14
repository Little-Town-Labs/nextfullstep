import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "career_assessments" })
export class CareerAssessmentEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 36 })
  userId!: string;

  @Column({ type: "varchar", length: 100 })
  roleId!: string; // ai-prompt-engineer, ai-content-creator, ai-coach

  @Column({ type: "varchar", length: 255 })
  roleName!: string; // AI Prompt Engineer

  @Column({ type: "varchar", length: 50, default: "in_progress" })
  status!: string; // in_progress, completed, abandoned

  @Column({ type: "integer", default: 0 })
  currentQuestionNumber!: number; // 0-8 (0 = not started, 8 = all answered)

  @Column({ type: "text", nullable: true })
  responses?: string; // JSON array of Q&A responses

  @Column({ type: "varchar", length: 50, nullable: true })
  verdictTier?: string; // QUALIFIED_NOW, NEARLY_QUALIFIED, SIGNIFICANT_GAPS, NOT_VIABLE

  @Column({ type: "integer", nullable: true })
  verdictScore?: number; // 0-100

  @Column({ type: "varchar", length: 100, nullable: true })
  verdictTimeline?: string; // "1-3 months", "4-8 months", etc.

  @Column({ type: "text", nullable: true })
  strengths?: string; // JSON array

  @Column({ type: "text", nullable: true })
  gaps?: string; // JSON array

  @Column({ type: "text", nullable: true })
  recommendations?: string; // JSON array

  @Column({ type: "text", nullable: true })
  fullAnalysis?: string; // Complete GPT response for reference

  @CreateDateColumn({ type: "timestamp" })
  startedAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt?: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
