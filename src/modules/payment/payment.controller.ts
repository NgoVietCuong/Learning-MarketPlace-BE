import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from 'src/app/decorators/user';
import { AllowAccess } from 'src/app/decorators/allow-access';
import { Roles } from 'src/app/enums/common.enum';
import { RoleGuard } from 'src/app/guards/role.guard';
import { PaymentService } from './services/payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ExecutePaymentDto } from './dto/execute-payment.dto';
import { OnboardMerchantDto } from './dto/onboard-merchant.dto';

@ApiBearerAuth()
@UseGuards(RoleGuard)
@AllowAccess(Roles.INSTRUCTOR)
@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @ApiOperation({ summary: 'Paypal merchant onboarding' })
  @Post('/onboard')
  async onboardMerchant(@Body() body: OnboardMerchantDto, @User('id') id: number) {
    return this.paymentService.onboardMerchant(body, id);
  }

  @ApiOperation({ summary: 'Create payment' })
  @Post('/create')
  async createPayment(@Body() body: CreatePaymentDto, @User('id') id: number) {
    return this.paymentService.createPayment(body, id);
  }

  @ApiOperation({ summary: 'Execute payment' })
  @Post('/execute')
  async executePayment(@Body() body: ExecutePaymentDto, @User('id') id: number) {
    return this.paymentService.executePayment(body, id);
  }
}
