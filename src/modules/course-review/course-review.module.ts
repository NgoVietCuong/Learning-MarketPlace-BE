import { Module } from '@nestjs/common';
import { CourseReviewService } from './course-review.service';
import { CourseReviewController } from './course-review.controller';
import { Review } from 'src/entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Course])],
  providers: [CourseReviewService],
  controllers: [CourseReviewController],
  exports: [CourseReviewService]
})
export class CourseReviewModule {}
