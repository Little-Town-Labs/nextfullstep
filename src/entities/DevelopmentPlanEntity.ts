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

/**
 * Development Plan Entity
 * Stores user development plans for career growth
 */
@Entity("development_plans")
export class DevelopmentPlanEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  @Index("development_plans_user_id_idx")
  user_id!: string;

  @Column("text", { nullable: true })
  title!: string | null;

  @Column("text")
  content!: string;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at" })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user?: UserEntity;
}
