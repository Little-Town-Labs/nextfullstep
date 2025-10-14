import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  name?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  passwordHash?: string; // For future auth implementation

  @Column({ type: "varchar", length: 100, nullable: true })
  selectedRoleId?: string; // ai-prompt-engineer, ai-content-creator, ai-coach

  @Column({ type: "varchar", length: 255, nullable: true })
  currentLocation?: string; // City/region for salary calibration

  @Column({ type: "varchar", length: 50, default: "active" })
  status!: string; // active, inactive, completed

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
