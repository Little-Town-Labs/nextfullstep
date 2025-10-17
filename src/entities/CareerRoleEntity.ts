import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "career_roles" })
export class CareerRoleEntity {
  @PrimaryColumn({ type: "varchar", length: 100 })
  id!: string; // ai-prompt-engineer, ai-content-creator, ai-coach

  @Column({ type: "varchar", length: 255 })
  name!: string; // AI Prompt Engineer

  @Column({ type: "text" })
  shortDescription!: string;

  @Column({ type: "text" })
  systemPrompt!: string; // The full career advisor prompt

  @Column({ type: "varchar", length: 100 })
  category!: string; // Content & Communication, Training & Enablement, etc.

  @Column({ type: "varchar", length: 50 })
  accessibilityLevel!: string; // High, Medium, Low

  @Column({ type: "varchar", length: 100 })
  typicalTimeline!: string; // 1-6 months

  @Column({ type: "varchar", length: 100 })
  avgStartingSalary!: string; // $45K-$70K

  @Column({ type: "varchar", length: 100 })
  freelanceRate!: string; // $30-$150/hr

  @Column({ type: "varchar", length: 100 })
  growthRate!: string; // High, Very High, Explosive

  @Column({ type: "varchar", length: 50 })
  remoteOpportunity!: string; // Excellent, Good, Limited

  @Column({ type: "boolean", default: true })
  isActive!: boolean; // Enable/disable roles

  @Column({ type: "integer", default: 0 })
  sortOrder!: number; // Display order

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
