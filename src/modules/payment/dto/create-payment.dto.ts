import { IsNumber, IsNotEmpty, Validate } from "class-validator";
import { Exist } from "src/app/decorators/custom-validator";
import { Course } from "src/entities/course.entity";

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  @Validate(Exist, [Course, 'id'])
  courseId: number;
}