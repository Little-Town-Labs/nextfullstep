import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { UserEntity } from "./UserEntity";

@Entity("api_keys")
@Index(["userId", "isActive"])
@Index(["keyHash"])
export class APIKeyEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "varchar",
    length: 100,
  })
  name!: string;

  @Column({
    type: "varchar",
    length: 255,
    unique: true,
  })
  keyHash!: string; // SHA-256 hash of the API key

  @Column({
    type: "varchar",
    length: 50,
    nullable: true,
  })
  keyPrefix!: string; // First 8 characters for identification (e.g., "nfs_1234")

  @Column({
    type: "uuid",
  })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: UserEntity;

  @Column({
    type: "boolean",
    default: true,
  })
  isActive!: boolean;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  permissions!: string[] | null; // e.g., ["read:users", "write:assessments"]

  @Column({
    type: "jsonb",
    nullable: true,
  })
  rateLimit!: {
    requestsPerMinute: number;
    requestsPerDay: number;
  } | null;

  @Column({
    type: "varchar",
    length: 45,
    nullable: true,
  })
  lastUsedIpAddress!: string | null;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  lastUsedAt!: Date | null;

  @Column({
    type: "integer",
    default: 0,
  })
  usageCount!: number;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  expiresAt!: Date | null;

  @Column({
    type: "text",
    nullable: true,
  })
  description!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({
    type: "varchar",
    length: 100,
    nullable: true,
  })
  createdByIpAddress!: string | null;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  revokedAt!: Date | null;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  revokedReason!: string | null;
}
