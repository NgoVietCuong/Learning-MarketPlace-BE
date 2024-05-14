import { IsNotEmpty, IsNumber, IsString, Validate } from 'class-validator';
import { Exist } from 'src/app/decorators/custom-validator';
import { Course } from 'src/entities/course.entity';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  @Validate(Exist, [Course])
  courseId: number;
}
