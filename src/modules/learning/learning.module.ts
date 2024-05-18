import { Module } from '@nestjs/common';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';
import { Enrollment } from 'src/entities/enrollment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { Lesson } from 'src/entities/lesson.entity';
import { LessonProgress } from 'src/entities/lesson-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Enrollment, Lesson, LessonProgress])],
  controllers: [LearningController],
  providers: [LearningService],
})
export class LearningModule {}
