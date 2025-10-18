import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { UserEntity } from "./UserEntity";

export enum AuditAction {
  // User Management
  USER_PROMOTE_ADMIN = "user_promote_admin",
  USER_DEMOTE_ADMIN = "user_demote_admin",
  USER_UPDATE = "user_update",
  USER_DELETE = "user_delete",

  // AI Model Management
  MODEL_CREATE = "model_create",
  MODEL_UPDATE = "model_update",
  MODEL_DELETE = "model_delete",
  MODEL_SET_DEFAULT = "model_set_default",

  // Career Role Management
  CAREER_ROLE_CREATE = "career_role_create",
  CAREER_ROLE_UPDATE = "career_role_update",
  CAREER_ROLE_DELETE = "career_role_delete",

  // System Configuration
  CONFIG_UPDATE = "config_update",

  // Authentication & Authorization
  ADMIN_LOGIN = "admin_login",
  ADMIN_LOGOUT = "admin_logout",
  API_KEY_CREATE = "api_key_create",
  API_KEY_REVOKE = "api_key_revoke",

  // Security Events
  UNAUTHORIZED_ACCESS_ATTEMPT = "unauthorized_access_attempt",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
}

export enum AuditSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

@Entity("audit_logs")
@Index(["performedById", "createdAt"])
@Index(["action", "createdAt"])
@Index(["severity", "createdAt"])
export class AuditLogEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "varchar",
    length: 100,
  })
  action!: AuditAction;

  @Column({
    type: "varchar",
    length: 20,
    default: AuditSeverity.INFO,
  })
  severity!: AuditSeverity;

  @Column({
    type: "uuid",
    nullable: true,
  })
  performedById!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "performedById" })
  performedBy?: UserEntity;

  @Column({
    type: "uuid",
    nullable: true,
  })
  targetUserId!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "targetUserId" })
  targetUser?: UserEntity;

  @Column({
    type: "varchar",
    length: 255,
  })
  description!: string;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  metadata!: Record<string, any> | null;

  @Column({
    type: "varchar",
    length: 45,
    nullable: true,
  })
  ipAddress!: string | null;

  @Column({
    type: "varchar",
    length: 500,
    nullable: true,
  })
  userAgent!: string | null;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  resourceType!: string | null;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  resourceId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
