import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { BaseService } from 'src/modules/base/base.service';
import { PaypalService } from './paypal.service';
import { Course } from 'src/entities/course.entity';
import { Payment } from 'src/entities/payment.entity';
import { Enrollment } from 'src/entities/enrollment.entity';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ExecutePaymentDto } from '../dto/execute-payment.dto';
import { OnboardMerchantDto } from '../dto/onboard-merchant.dto';
import { PaymentStatus } from 'src/app/enums/common.enum';

@Injectable()
export class PaymentService extends BaseService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private dataSource: DataSource,
    private paypalService: PaypalService,
    private readonly trans: I18nService,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
  ) {
    super();
  }

  async onboardMerchant(body: OnboardMerchantDto, userId: number) {
    const { paypalEmail } = body;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(InstructorProfile, { userId }, { paypalEmail });

      const partnerReferral = await this.paypalService.createPartnerReferral();
      const actionUrl = partnerReferral.links.find((referral) => referral.rel === 'action_url').href;
       await queryRunner.commitTransaction()
      return this.responseOk({ actionUrl });
    } catch (e) {
      this.logger.error(e);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(this.trans.t('messages.BAD_REQUEST', { args: { action: 'onboard merchant.' } }));
    } finally {
      await queryRunner.release();
    }
  }

  async createPayment(body: CreatePaymentDto, userId: number) {
    const { courseId } = body;
    const course = await this.courseRepo.findOne({ where: { id: courseId }, relations: ['profile'] });

    if (!course.price)
      throw new BadRequestException(
        this.trans.t('messages.BAD_REQUEST', { args: { action: 'create payment. This course is free' } }),
      );
    if (!course.profile)
      throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'Instructor Profile' } }));
    if (!course.profile.paypalEmail)
      throw new BadRequestException(
        this.trans.t('messages.BAD_REQUEST', {
          args: { action: 'create payment. This instructor is not onboarded with PayPal' },
        }),
      );

    const payment = await this.paymentRepo.findOneBy({ userId: userId, courseId: courseId });
    if (payment && payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('You have already purchased this course');
    } else if (payment && payment.status === PaymentStatus.CREATED) {
      return this.responseOk({ orderId: payment.paypalOrderId });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = await this.paypalService.createOrder(course.profile.paypalEmail, course.price);
      await queryRunner.manager.save(Payment, {
        userId,
        courseId,
        amount: course.price,
        paypalOrderId: order.id,
        payee: course.profile.paypalEmail,
        status: order.status,
      });

      await queryRunner.commitTransaction();
      return this.responseOk({ orderId: order.id });
    } catch (e) {
      this.logger.error(e);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(this.trans.t('messages.BAD_REQUEST', { args: { action: 'execute payment.' } }));
    } finally {
      await queryRunner.release();
    }
  }

  async executePayment(body: ExecutePaymentDto, userId: number) {
    const { orderId } = body;
    const payment = await this.paymentRepo.findOneBy({ paypalOrderId: orderId });
    if (!payment) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'Order' } }));

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = await this.paypalService.captureOrder(orderId);
      await queryRunner.manager.update(Payment, { paypalOrderId: orderId }, { status: order.status });
      await queryRunner.manager.save(Enrollment, { userId, courseId: payment.courseId });

      await queryRunner.commitTransaction();
      return this.responseOk();
    } catch (e) {
      this.logger.error(e);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(this.trans.t('messages.BAD_REQUEST', { args: { action: 'execute payment.' } }));
    } finally {
      await queryRunner.release();
    }
  }

  async getInstructorTotalIncome(paypalEmail: string) {
    const totalIncomeResult = await this.paymentRepo
      .createQueryBuilder('P')
      .where('P.payee = :payee', { payee: paypalEmail })
      .andWhere('P.status = :status', { status: PaymentStatus.COMPLETED })
      .select('SUM(P.amount)', 'totalIncome')
      .getRawOne();

    return totalIncomeResult.totalIncome;
  }

  async getPaymentToInstructor(paypalEmail: string) {
    const paymentList = await this.paymentRepo
      .createQueryBuilder('P')
      .innerJoinAndSelect('P.course', 'C')
      .where('P.payee = :payee', { payee: paypalEmail })
      .andWhere('P.status = :status', { status: PaymentStatus.COMPLETED })
      .getMany();

    return paymentList;
  }

  async getInstructorIncomeEachMonth(paypalEmail: string) {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const incomeList = await this.paymentRepo
      .createQueryBuilder('P')
      .where('P.payee = :payee', { payee: paypalEmail })
      .andWhere('P.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('P.updatedAt >= :sixMonthsAgo', { sixMonthsAgo })
      .groupBy("date_trunc('month', P.updatedAt)")
      .select("TO_CHAR(date_trunc('month', P.updatedAt), 'MM-YYYY') as month")
      .addSelect('SUM(P.amount) as income')
      .orderBy('month', 'ASC')
      .getRawMany();

    const incomeEachMonth = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthString = `${('0' + (month.getMonth() + 1)).slice(-2)}-${month.getFullYear()}`;
      const data = incomeList.find(payment => payment.month === monthString);

      incomeEachMonth.push({
        month: monthString,
        income: data ? data.income : 0,
      })
    }

    return incomeEachMonth;
  }

  async getTopIncomeCourse(paypalEmail: string) {
    const topIncomeCourses = await this.paymentRepo
      .createQueryBuilder('P')
      .innerJoin('P.course', 'C')
      .where('P.payee = :payee', { payee: paypalEmail })
      .andWhere('P.status = :status', { status: PaymentStatus.COMPLETED })
      .groupBy('C.id')
      .select(['C.id as id', 'C.title as title', 'SUM(P.amount) as amount'])
      .orderBy('amount', 'DESC')
      .getRawMany()

    return topIncomeCourses;
  }
}
