import { IsString, IsNotEmpty } from "class-validator";

export class ExecutePaymentDto {
  @IsString()
  @IsNotEmpty()
  orderId: string; 
}