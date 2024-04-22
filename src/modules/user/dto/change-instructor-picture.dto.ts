import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeInstructorPictureDto {
  @IsNotEmpty()
  @IsString()
  picture: string;
}
