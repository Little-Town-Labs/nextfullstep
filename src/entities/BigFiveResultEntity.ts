import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from "typeorm";

@Entity({ name: "bigfive_results" })
@Unique(["userId", "userTestId", "category", "resultType"])
export class BigFiveResultEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  category!: string;

  @Column({ type: "integer" })
  score!: number;

  @Column({ type: "text", nullable: true })
  comment?: string;

  @Column({ type: "varchar", length: 50 })
  userTestId!: string;

  @Column({ type: "varchar", length: 36 })
  userId!: string;

  @Column({ type: "varchar", length: 20 })
  resultType!: string; // 'category' or 'subcategory'

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;
}