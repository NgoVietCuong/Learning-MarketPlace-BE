import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Section } from './section.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  sectionId: number;

  @Column()
  title: string;

  @Column()
  contentType: string;

  @Column()
  content: string;

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
}
