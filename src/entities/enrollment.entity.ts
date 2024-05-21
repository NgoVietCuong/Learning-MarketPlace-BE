import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';
import { LessonProgress } from './lesson-progress.entity';
import { Review } from './review.entity';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  userId: number;

  @Column()
  courseId: number;

  @Column()
  progressStatus: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @ManyToOne(() => User, (user) => user.enrollments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, (course) => course.enrollments)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => LessonProgress, (lessonProgress) => lessonProgress.enrollment)
  lessonProgresses: LessonProgress[];

  @OneToOne(() => Review, (review) => review.enrollment)
  review: Review;
}
