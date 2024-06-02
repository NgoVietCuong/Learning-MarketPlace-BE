import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from 'class-validator';
import { PaginationDtoConstant } from 'src/app/constants/pagination-dto.constant';
import { Exist } from 'src/app/decorators/custom-validator';
import { Course } from 'src/entities/course.entity';

export class ListReviewsDto extends PaginationDtoConstant {
  @IsString()
  @IsNotEmpty()
  @Validate(Exist, [Course, 'slug'])
  slug: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional()
  rating: number;
}
