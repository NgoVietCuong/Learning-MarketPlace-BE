import { IsNotEmpty, IsNumber, IsString, Validate } from 'class-validator';
import { Exist } from 'src/app/decorators/custom-validator';
import { Course } from 'src/entities/course.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Validate(Exist, [Course])
  courseId: number;
}
