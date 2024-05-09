import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDtoConstant } from 'src/app/constants/pagination-dto.constant';

export class ListCoursesDto extends PaginationDtoConstant {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  categoryId: number;
}
