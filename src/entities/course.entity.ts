import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { InstructorProfile } from './instructor-profile.entity';
import { Category } from './category.entity';
import { Section } from './course-section.entity';
import { Enrollment } from './enrollment.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  instructorId: number;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column()
  level: string;

  @Column()
  imagePreview: string;

  @Column()
  videoPreview: string;

  @Column()
  overview: string;

  @Column()
  description: string;

  @Column()
  isPublished: boolean;

  @Column()
  price: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];

  @OneToMany(() => Section, (section) => section.course)
  sections: Section[];

  @ManyToOne(() => InstructorProfile, (profile) => profile.courses)
  @JoinColumn({ name: 'instructor_id' })
  profile: InstructorProfile;

  @ManyToMany(() => Category, (category) => category.courses)
  @JoinTable({
    name: 'course_category',
    joinColumn: {
      name: 'course_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];
}
