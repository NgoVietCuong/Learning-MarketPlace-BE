import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './services/payment.service';
import { PaypalService } from './services/paypal.service';
import paypalConfiguration from 'src/config/paypal.config';

@Module({
  imports: [ConfigModule.forRoot({ load: [paypalConfiguration] })],
  controllers: [PaymentController],
  providers: [PaymentService, PaypalService],
})
export class PaymentModule {}
