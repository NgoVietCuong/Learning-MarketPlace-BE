import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorCourseController } from './instructor-course.controller';
import { InstructorCourseService } from './instructor-course.service';
import { Course } from 'src/entities/course.entity';
import { Category } from 'src/entities/category.entity';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
import { Section } from 'src/entities/section.entity';
import { Lesson } from 'src/entities/lesson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Category, InstructorProfile, Section, Lesson])],
  controllers: [InstructorCourseController],
  providers: [InstructorCourseService],
})
export class InstructorCourseModule {}
