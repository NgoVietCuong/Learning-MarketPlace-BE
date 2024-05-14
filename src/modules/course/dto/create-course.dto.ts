import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString, Validate } from 'class-validator';
import { Exist } from 'src/app/decorators/custom-validator';
import { Category } from 'src/entities/category.entity';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ArrayNotEmpty()	
  @IsNumber({}, { each: true })
  @Validate(Exist, [Category], { each: true })
  categoryIds: number[];
}
