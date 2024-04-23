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

  @IsString()
  @IsOptional()
  twitterLink: string;

  @IsString()
  @IsOptional()
  linkedinLink: string;

  @IsString()
  @IsOptional()
  youtubeLink: string;
}
