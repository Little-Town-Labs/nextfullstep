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

  // Career Profile (From Onboarding)
  @Column({ type: "varchar", length: 50, nullable: true })
  experienceLevel?: string; // beginner, some-experience, intermediate, advanced

  @Column({ type: "varchar", length: 50, nullable: true })
  timeCommitment?: string; // casual, parttime, serious, fulltime

  // Career Readiness (From Landing Page Assessment)
  @Column({ type: "int", nullable: true })
  @Index()
  careerReadinessScore?: number; // 0-100 from landing page assessment

  @Column({ type: "varchar", length: 20, nullable: true })
  qualificationTier?: string; // cold, warm, hot, qualified - for sales prioritization

  @Column({ type: "varchar", length: 100, nullable: true })
  currentSituation?: string; // student, early_career, mid_career, senior, career_break, entrepreneur

  @Column({ type: "varchar", length: 100, nullable: true })
  desiredOutcome?: string; // first_project, full_time_role, upskill, start_business, transition_role, exploring

  // Progress Tracking
  @Column({ type: "int", default: 0 })
  currentStreak?: number; // Days in a row working on roadmap

  @Column({ type: "timestamp", nullable: true })
  lastActiveDate?: Date; // Last time they engaged with platform

  // Attribution (Links to Landing Page Assessment)
  @Column({ type: "uuid", nullable: true })
  @Index()
  linkedAssessmentLeadId?: string; // Links to AssessmentLeadEntity if they came from landing page

  @Column({ type: "varchar", length: 100, nullable: true })
  acquisitionChannel?: string; // organic, landing_page_assessment, direct_signup

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
