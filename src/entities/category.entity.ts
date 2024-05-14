import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Course } from './course.entity';
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  slug: string;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column()
  isActive: boolean;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @ManyToMany(() => Course, (course) => course.categories)
  courses: Course[];
}
