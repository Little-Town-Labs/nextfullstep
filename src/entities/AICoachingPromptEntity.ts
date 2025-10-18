import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * AI Coaching Prompt Entity
 * Stores coaching prompts for AI-powered coaching features
 */
@Entity("ai_coaching_prompts")
export class AICoachingPromptEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text")
  prompt!: string;

  @Column("varchar")
  updatedBy!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
