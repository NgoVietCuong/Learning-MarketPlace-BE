import {IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdatePublishCourseDto {
  @IsBoolean()
  @IsNotEmpty()
  isPublished: boolean;
}