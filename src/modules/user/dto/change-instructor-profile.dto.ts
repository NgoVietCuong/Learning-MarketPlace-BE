import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength, IsOptional } from 'class-validator';

export class ChangeInstructorProfileDto {
  @IsNotEmpty()
  @IsString()
  displayName: string;

  @IsNotEmpty()
  @IsString()
  introduction: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(50)
  @MaxLength(1000)
  biography: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  twitterLink: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  linkedinLink: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  youtubeLink: string;
}
