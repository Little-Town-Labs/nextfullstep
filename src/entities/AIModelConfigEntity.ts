import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

@Entity({ name: "ai_model_configs" })
export class AIModelConfigEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Model Identification
  @Column({ type: "varchar", length: 255, unique: true })
  @Index()
  modelId!: string; // e.g., "openai/gpt-4o-mini", "anthropic/claude-3.5-sonnet"

  @Column({ type: "varchar", length: 100 })
  provider!: string; // e.g., "openai", "anthropic", "google", "meta"

  @Column({ type: "varchar", length: 255 })
  displayName!: string; // e.g., "GPT-4o Mini", "Claude 3.5 Sonnet"

  @Column({ type: "text", nullable: true })
  description?: string; // Model description for admins

  // Model Configuration
  @Column({ type: "boolean", default: true })
  isEnabled!: boolean; // Can be used for assessments

  @Column({ type: "boolean", default: false })
  isDefault!: boolean; // Default model for new assessments

  @Column({ type: "decimal", precision: 10, scale: 4, nullable: true })
  costPer1kInputTokens?: number; // Cost per 1k input tokens in USD

  @Column({ type: "decimal", precision: 10, scale: 4, nullable: true })
  costPer1kOutputTokens?: number; // Cost per 1k output tokens in USD

  @Column({ type: "int", nullable: true })
  maxTokens?: number; // Maximum tokens supported

  @Column({ type: "decimal", precision: 3, scale: 2, default: 0.7 })
  temperature!: number; // Default temperature for this model

  @Column({ type: "int", default: 3000 })
  maxOutputTokens!: number; // Max tokens to generate

  // Capabilities (stored as JSON)
  @Column({ type: "json", nullable: true })
  capabilities?: {
    assessments?: boolean;
    coaching?: boolean;
    streaming?: boolean;
    functionCalling?: boolean;
  };

  // Performance & Status
  @Column({ type: "varchar", length: 50, default: "active" })
  status!: string; // active, deprecated, unavailable

  @Column({ type: "int", default: 0 })
  usageCount!: number; // Track how many times this model has been used

  @Column({ type: "timestamp", nullable: true })
  lastUsedAt?: Date; // Last time this model was used

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
