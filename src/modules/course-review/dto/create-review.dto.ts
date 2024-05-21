import { IsNotEmpty, IsNumber, IsString, Max, Min, Validate } from 'class-validator';
import { Exist } from 'src/app/decorators/custom-validator';
import { Enrollment } from 'src/entities/enrollment.entity';

export class CreateReviewDto {
  @IsNumber()
  @IsNotEmpty()
  @Validate(Exist, [Enrollment])
  enrollmentId: number;

  @Min(1)
  @Max(5)
  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;
}
