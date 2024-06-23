import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as paypal from '@paypal/checkout-server-sdk';
import paypalConfiguration from 'src/config/paypal.config';

@Injectable()
export class PaypalService {
  private readonly logger = new Logger(PaypalService.name);
  private client;

  constructor(@Inject(paypalConfiguration.KEY) private paypalConfig: ConfigType<typeof paypalConfiguration>) {
    const environment = new paypal.core.SandboxEnvironment(paypalConfig.clientId, paypalConfig.clientSecret);
    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  async createOrder() {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '100.00',
          },
          payee: {
            merchant_id: 'GGC7K5C5EP89Y',
          }
        },
      ],
    });

    try {
      const order = await this.client.execute(request);
      return order.result;
    } catch (error) {
      throw new Error(error);
    }
  }

  async captureOrder(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const capture = await this.client.execute(request);
      return capture.result;
    } catch (error) {
      throw new Error(error);
    }
  }
}
