import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModule } from '../payment/payment.module';
import { CourseReviewModule } from '../course-review/course-review.module';
import { CourseExplorerModule } from '../course-explorer/course-explorer.module';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
import { Enrollment } from 'src/entities/enrollment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InstructorProfile, Enrollment]),
    PaymentModule,
    CourseReviewModule,
    CourseExplorerModule,
  ],
  controllers: [InstructorController],
  providers: [InstructorService],
})
export class InstructorModule {}
