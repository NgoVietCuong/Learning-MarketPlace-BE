import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAccess } from 'src/app/decorators/allow-access';
import { Roles } from 'src/app/enums/common.enum';
import { RoleGuard } from 'src/app/guards/role.guard';
import { PaymentService } from './services/payment.service';
import { ExecutePaymentDto } from './dto/execute-payment.dto';
import { Public } from 'src/app/decorators/public';

@ApiBearerAuth()
@UseGuards(RoleGuard)
@AllowAccess(Roles.STUDENT)
@Public()
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @ApiOperation({ summary: 'Create payment' })
  @Post('/create')
  async createPayment() {
    return this.paymentService.createPayment();
  }

  @ApiOperation({ summary: 'Execute payment' })
  @Post('/execute')
  async executePayment(@Body() body: ExecutePaymentDto) {
    return this.paymentService.executePayment(body);
  }
}
