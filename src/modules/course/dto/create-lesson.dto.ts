import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from 'class-validator';
import { Exist } from 'src/app/decorators/custom-validator';
import { Section } from 'src/entities/course-section.entity';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  @Validate(Exist, [Section])
  sectionId: number;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty()
  content: string;
}
