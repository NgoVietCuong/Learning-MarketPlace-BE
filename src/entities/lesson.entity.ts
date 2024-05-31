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
import { Section } from './section.entity';
import { LessonProgress } from './lesson-progress.entity';
import { LessonContentType } from 'src/app/enums/common.enum';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  sectionId: number;

  @Column()
  title: string;

  @Column()
  contentType: LessonContentType;

  @Column()
  content: string;

  @Column()
  fileName: string;

  @Column()
  duration: number;

  @Column()
  sortOrder: number;

  @Column()
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @ManyToOne(() => Section, (section) => section.lessons)
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @OneToOne(() => LessonProgress, (LessonProgress) => LessonProgress.lesson)
  lessonProgress: LessonProgress;
}
