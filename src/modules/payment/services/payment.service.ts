import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/modules/base/base.service';
import { PaypalService } from './paypal.service';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
import { ExecutePaymentDto } from '../dto/execute-payment.dto';
import { OnboardMerchantDto } from '../dto/onboard-merchant.dto';

@Injectable()
export class PaymentService extends BaseService {
  constructor(
    private paypalService: PaypalService,
    @InjectRepository(InstructorProfile) private instructorProfileRepo: Repository<InstructorProfile>,
  ) {
    super();
  }

  async onboardMerchant(body: OnboardMerchantDto, userId: number) {
    const { paypalEmail } = body;
    await this.instructorProfileRepo.update({ userId }, { paypalEmail });
    const partnerReferral = await this.paypalService.createPartnerReferral();
    const actionUrl = partnerReferral.links.find((referral) => referral.rel === 'action_url').href;
    return this.responseOk({ actionUrl });
  }

  async createPayment() {
    const order = await this.paypalService.createOrder();
    return this.responseOk({ orderId: order.id }); 
  }

  async executePayment(body: ExecutePaymentDto) {
    const { orderId } = body;
    const order = await this.paypalService.captureOrder(orderId);
    return this.responseOk({ order });
  }
}
