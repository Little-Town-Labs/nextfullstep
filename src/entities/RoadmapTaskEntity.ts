import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "roadmap_tasks" })
export class RoadmapTaskEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 36 })
  roadmapId!: string; // Links to RoadmapEntity

  @Column({ type: "varchar", length: 36 })
  userId!: string;

  @Column({ type: "varchar", length: 100 })
  phaseId!: string; // immediate, short_term, mid_term, long_term

  @Column({ type: "varchar", length: 255 })
  phaseName!: string; // Immediate Actions (Next 30 days)

  @Column({ type: "text" })
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 50, default: "NORMAL" })
  priority!: string; // CRITICAL, HIGH, NORMAL, LOW

  @Column({ type: "integer", nullable: true })
  estimatedHours?: number;

  @Column({ type: "varchar", length: 50, default: "pending" })
  status!: string; // pending, in_progress, completed, skipped

  @Column({ type: "integer", default: 0 })
  sortOrder!: number; // Order within phase

  @Column({ type: "text", nullable: true })
  resources?: string; // JSON array of resource links

  @Column({ type: "text", nullable: true })
  notes?: string; // User notes

  @Column({ type: "timestamp", nullable: true })
  targetDate?: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt?: Date;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
