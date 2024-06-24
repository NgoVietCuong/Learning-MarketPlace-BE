import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import axios from 'axios';
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

  async createPartnerReferral() {
    const accessToken = await this.getAccessToken();

    const response = await axios.post(
      `https://api-m.sandbox.paypal.com/v2/customer/partner-referrals`,
      {
        operations: [
          {
            operation: 'API_INTEGRATION',
            api_integration_preference: {
              rest_api_integration: {
                integration_method: 'PAYPAL',
                integration_type: 'THIRD_PARTY',
                third_party_details: {
                  features: ['PAYMENT', 'REFUND'],
                },
              },
            },
          },
        ],
        partner_config_override: {
          return_url: 'https://4ce9-101-96-127-140.ngrok-free.app/',
          action_renewal_url: 'https://4ce9-101-96-127-140.ngrok-free.app/',
        },
        products: ['PPCP'],
        legal_consents: [
          {
            type: 'SHARE_DATA_CONSENT',
            granted: true,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  }

  async getAccessToken() {
    const response = await axios.post(
      `https://api-m.sandbox.paypal.com/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        auth: {
          username: this.paypalConfig.clientId,
          password: this.paypalConfig.clientSecret,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return response.data.access_token;
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
            email_address: 'sb-vssbu31273313@business.example.com',
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
