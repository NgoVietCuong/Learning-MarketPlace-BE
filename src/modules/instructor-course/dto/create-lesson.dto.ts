import { IsNotEmpty, IsNumber, IsString, Validate } from 'class-validator';
import { Exist } from 'src/app/decorators/custom-validator';
import { Section } from 'src/entities/section.entity';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  @Validate(Exist, [Section])
  sectionId: number;
}
