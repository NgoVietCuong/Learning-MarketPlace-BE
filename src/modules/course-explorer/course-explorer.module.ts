import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseReviewModule } from '../course-review/course-review.module';
import { CourseExplorerController } from './course-explorer.controller';
import { CourseExplorerService } from './course-explorer.service';
import { Lesson } from 'src/entities/lesson.entity';
import { Course } from 'src/entities/course.entity';
import { Enrollment } from 'src/entities/enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, Course, Enrollment]), CourseReviewModule],
  providers: [CourseExplorerService],
  controllers: [CourseExplorerController],
  exports: [CourseExplorerService],
})
export class CourseExplorerModule {}
