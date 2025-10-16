import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";

@Entity({ name: "ai_usage_logs" })
export class AIUsageLogEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // User & Model Information
  @Column({ type: "varchar", length: 255 })
  @Index()
  userId!: string; // References UserEntity.id

  @Column({ type: "varchar", length: 255 })
  @Index()
  modelId!: string; // e.g., "openai/gpt-4o-mini"

  @Column({ type: "varchar", length: 100 })
  provider!: string; // e.g., "openai", "anthropic"

  // Request Information
  @Column({ type: "varchar", length: 100 })
  requestType!: string; // e.g., "assessment", "coaching", "roadmap"

  @Column({ type: "varchar", length: 255, nullable: true })
  relatedEntityId?: string; // ID of assessment, roadmap, etc.

  // Token Usage
  @Column({ type: "int" })
  inputTokens!: number;

  @Column({ type: "int" })
  outputTokens!: number;

  @Column({ type: "int" })
  totalTokens!: number;

  // Cost Tracking
  @Column({ type: "decimal", precision: 10, scale: 6, nullable: true })
  estimatedCost?: number; // Estimated cost in USD

  // Performance
  @Column({ type: "int", nullable: true })
  latencyMs?: number; // Request latency in milliseconds

  @Column({ type: "varchar", length: 50 })
  status!: string; // success, error, timeout

  @Column({ type: "text", nullable: true })
  errorMessage?: string; // Error details if failed

  @CreateDateColumn({ type: "timestamp" })
  @Index()
  createdAt!: Date;
}
