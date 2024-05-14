import { Transform } from "class-transformer";
import { IsEmail, IsString, IsNotEmpty } from "class-validator";

export class SendResetEmailDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Transform((param) => param.value.toLowerCase())
  email: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}