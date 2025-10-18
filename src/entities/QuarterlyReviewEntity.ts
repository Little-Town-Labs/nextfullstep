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
 * Quarterly Review Entity
 * Stores quarterly performance reviews for users
 */
@Entity("quarterly_reviews")
@Index("quarterly_reviews_user_id_review_date_idx", ["user_id", "review_date"])
export class QuarterlyReviewEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  user_id!: string;

  @Column("timestamp")
  review_date!: Date;

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
