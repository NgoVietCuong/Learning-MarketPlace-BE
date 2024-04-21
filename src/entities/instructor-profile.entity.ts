import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('instructor_profiles')
export class InstructorProfile {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  userId: number;

  @Column()
  slug: string;

  @Column()
  displayName: string;

  @Column()
  picture: string;

  @Column()
  introduction: string;

  @Column()
  biography: string;

  @Column()
  twitterLink: string;

  @Column()
  linkedinLink: string;

  @Column()
  youtubeLink: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: User;
}
