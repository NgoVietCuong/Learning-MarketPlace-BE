import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { constants } from './common.constant';

export class PaginationDtoConstant {
  @ApiPropertyOptional({ default: constants.PAGINATION.LIMIT_DEFAULT })
  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsOptional()
  limit: number = constants.PAGINATION.LIMIT_DEFAULT;

  @ApiPropertyOptional({ default: constants.PAGINATION.PAGE_DEFAULT })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page: number = constants.PAGINATION.PAGE_DEFAULT;
}
