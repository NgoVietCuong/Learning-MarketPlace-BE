import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Enrollment } from './enrollment.entity';

@Entity('course_reviews')
export class Review {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  enrollmentId: number;

  @Column()
  rating: number;

  @Column()
  comment: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @OneToOne(() => Enrollment, (enrollment) => enrollment.review)
  @JoinColumn()
  enrollment: Enrollment;
}
