import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { Lesson } from './lesson.entity';

@Entity('lesson_progress')
export class LessonProgress {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  enrollmentId: number;

  @Column()
  lessonId: number;

  @Column()
  isCompleted: boolean;

  @Column()
  contentProgress: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.lessonProgresses)
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  @OneToOne(() => Lesson, (lesson) => lesson.lessonProgress)
  @JoinColumn()
  lesson: Lesson;
}
