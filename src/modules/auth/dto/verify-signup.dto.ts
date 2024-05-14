import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class VerifySignUpDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Transform((param) => param.value.toLowerCase())
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
