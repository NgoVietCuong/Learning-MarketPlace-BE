import { Module } from '@nestjs/common';
import { CourseExplorerService } from './course-explorer.service';
import { CourseExplorerController } from './course-explorer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { Enrollment } from 'src/entities/enrollment.entity';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseExplorerService, Course, Enrollment, InstructorProfile])],
  providers: [CourseExplorerService],
  controllers: [CourseExplorerController]
})
export class CourseExplorerModule {}
