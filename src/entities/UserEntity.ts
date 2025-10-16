import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Clerk Authentication
  @Column({ type: "varchar", length: 255, unique: true })
  @Index()
  clerkUserId!: string; // Primary identifier from Clerk

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  name?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  profileImageUrl?: string; // Profile picture from Clerk

  // Career Selection
  @Column({ type: "varchar", length: 100, nullable: true })
  selectedRoleId?: string; // ai-prompt-engineer, ai-content-creator, ai-coach

  @Column({ type: "varchar", length: 255, nullable: true })
  currentLocation?: string; // City/region for salary calibration

  // Subscription Management
  @Column({ type: "varchar", length: 50, default: "free" })
  subscriptionTier!: string; // free, pro, enterprise

  @Column({ type: "varchar", length: 50, default: "active" })
  subscriptionStatus!: string; // active, canceled, past_due, trialing

  @Column({ type: "varchar", length: 255, nullable: true })
  stripeCustomerId?: string; // Stripe customer ID

  @Column({ type: "varchar", length: 255, nullable: true })
  stripeSubscriptionId?: string; // Stripe subscription ID

  @Column({ type: "timestamp", nullable: true })
  subscriptionEndsAt?: Date; // When subscription expires

  // Usage Tracking
  @Column({ type: "int", default: 0 })
  assessmentsUsed!: number; // Number of assessments taken this period

  @Column({ type: "int", default: 1 })
  assessmentsLimit!: number; // Max assessments allowed (1 for free, unlimited for pro)

  @Column({ type: "int", default: 0 })
  roadmapsUsed!: number; // Number of active roadmaps

  @Column({ type: "int", default: 1 })
  roadmapsLimit!: number; // Max roadmaps allowed (1 for free, 5 for pro)

  @Column({ type: "timestamp", nullable: true })
  usageResetAt?: Date; // When usage limits reset (monthly)

  // Onboarding & Status
  @Column({ type: "boolean", default: false })
  onboardingCompleted!: boolean;

  @Column({ type: "varchar", length: 50, default: "active" })
  status!: string; // active, inactive, suspended

  // Admin & Permissions
  @Column({ type: "varchar", length: 20, default: "user" })
  role!: string; // user, admin

  @Column({ type: "boolean", default: false })
  @Index()
  isAdmin!: boolean; // Quick admin check

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
