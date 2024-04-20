import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, NotContains } from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  @NotContains(' ')
  username: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Transform((param) => param.value.toLowerCase())
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
