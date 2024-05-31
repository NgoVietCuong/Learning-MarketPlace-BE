import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseReviewModule } from '../course-review/course-review.module';
import { CourseExplorerController } from './course-explorer.controller';
import { CourseExplorerService } from './course-explorer.service';
import { Course } from 'src/entities/course.entity';
import { Enrollment } from 'src/entities/enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseExplorerService, Course, Enrollment]), CourseReviewModule],
  providers: [CourseExplorerService],
  controllers: [CourseExplorerController],
})
export class CourseExplorerModule {}
