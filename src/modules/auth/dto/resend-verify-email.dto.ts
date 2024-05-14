import { PickType } from '@nestjs/swagger';
import { VerifySignUpDto } from './verify-signup.dto';

export class ResendVerifyEmailDto extends PickType(VerifySignUpDto, ['email'] as const) {}
