import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from 'src/modules/base/base.service';
import { PaypalService } from './paypal.service';
import { ExecutePaymentDto } from '../dto/execute-payment.dto';


@Injectable()
export class PaymentService extends BaseService {
  constructor(
    private paypalService: PaypalService
  ) {
    super();
  }

  async createPayment() {
    const order = await this.paypalService.createOrder();
    console.log('order', order)
    return this.responseOk({ orderId: order.id }); 
  }

  async executePayment(body: ExecutePaymentDto) {
    const { orderId } = body;
    const order = await this.paypalService.captureOrder(orderId);
    return this.responseOk({ order });
  }
}
