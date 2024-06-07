import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Validate } from 'class-validator';
import { PaginationDtoConstant } from 'src/app/constants/pagination-dto.constant';
import { Category } from 'src/entities/category.entity';
import { Exist } from 'src/app/decorators/custom-validator';

export class SearchCourseDto extends PaginationDtoConstant {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Validate(Exist, [Category])
  @Type(() => Number)
  categoryId: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  level: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  price: string;
}
