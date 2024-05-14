import { IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdatePublishDto {
  @IsBoolean()
  @IsNotEmpty()
  isPublished: boolean;
}
