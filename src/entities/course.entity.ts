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
} from 'typeorm';
import { InstructorProfile } from './instructor-profile.entity';
import { Category } from './category.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  instructorId: number

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

  @ManyToOne(() => InstructorProfile, (profile) => profile.courses)
  @JoinColumn({name: 'instructor_id'})
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