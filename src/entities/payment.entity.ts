import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  userId: number;

  @Column()
  courseId: number;

  @Column()
  paypalOrderId: string;

  @Column()
  payee: string;

  @Column()
  status: string;

  @Column()
  amount: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @ManyToOne(() => Course, (course) => course.payments)
  course: Course;
}
