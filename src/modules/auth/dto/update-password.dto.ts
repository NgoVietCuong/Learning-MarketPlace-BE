import { IsNotEmpty, IsString } from "class-validator";
import { VerifySignUpDto } from "./verify-signup.dto";

export class UpdatePasswordDto extends VerifySignUpDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}