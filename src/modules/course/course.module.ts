import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorCourseController } from './controllers/instructor-course.controller';
import { CourseService } from './course.service';
import { Course } from 'src/entities/course.entity';
import { Category } from 'src/entities/category.entity';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
import { Section } from 'src/entities/course-section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Category, InstructorProfile, Section])],
  controllers: [InstructorCourseController],
  providers: [CourseService]
})
export class CourseModule {}
