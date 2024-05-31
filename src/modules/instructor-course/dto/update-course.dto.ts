import { ApiPropertyOptional } from '@nestjs/swagger';
import { MinLength, MaxLength, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateCourseDto } from './create-course.dto';

export class UpdateCourseDto extends CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  level: string;

  @IsString()
  @IsNotEmpty()
  imagePreview: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  videoPreview: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  overview: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}
