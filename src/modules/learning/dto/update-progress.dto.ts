import { IsNotEmpty, IsNumber, Max, Min, Validate } from 'class-validator';
import { Exist } from 'src/app/decorators/custom-validator';
import { Enrollment } from 'src/entities/enrollment.entity';
import { Lesson } from 'src/entities/lesson.entity';

export class UpdateProgressDto {
  @IsNumber()
  @IsNotEmpty()
  @Validate(Exist, [Enrollment])
  enrollmentId: number;

  @IsNumber()
  @IsNotEmpty()
  @Validate(Exist, [Lesson])
  lessonId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  contentProgress: number;
}
