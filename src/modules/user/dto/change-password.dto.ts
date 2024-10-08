import { IsNotEmpty, IsString } from 'class-validator';
import { IsDifferentFrom } from 'src/app/decorators/custom-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsDifferentFrom('currentPassword')
  newPassword: string;
}
