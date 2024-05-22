import { Module } from '@nestjs/common';
import { CourseReviewService } from './course-review.service';
import { CourseReviewController } from './course-review.controller';
import { Review } from 'src/entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Review])],
  providers: [CourseReviewService],
  controllers: [CourseReviewController],
})
export class CourseReviewModule {}
