
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationDtoConstant } from 'src/app/constants/pagination-dto.constant';

const optionalBooleanMapper = new Map([
  ['undefined', undefined],
  ['true', true],
  ['false', false],
]);

export class ListUsersDto extends PaginationDtoConstant {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({value}) => optionalBooleanMapper.get(value))
  isActive: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  role: string;
}
