import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ChangeUserStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: string;
}
