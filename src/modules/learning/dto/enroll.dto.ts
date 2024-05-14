import { IsNotEmpty, IsNumber, Validate } from 'class-validator';
import { Exist } from 'src/app/decorators/custom-validator';
import { Course } from 'src/entities/course.entity';

export class EnrollCourseDto {
  @IsNumber()
  @IsNotEmpty()
  @Validate(Exist, [Course])
  courseId: number;
}
