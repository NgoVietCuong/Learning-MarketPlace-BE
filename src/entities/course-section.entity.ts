import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  courseId: number;

  @Column()
  title: string;

  @Column()
  sortOrder: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @ManyToOne(() => Course, (course) => course.sections)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
