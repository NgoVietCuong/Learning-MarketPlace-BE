import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
import { Enrollment } from 'src/entities/enrollment.entity';
import { CourseReviewService } from '../course-review/course-review.service';
import { Review } from 'src/entities/review.entity';
import { Course } from 'src/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InstructorProfile, Enrollment, Review, Course])],
  controllers: [InstructorController],
  providers: [InstructorService, CourseReviewService]
})
export class InstructorModule {}
