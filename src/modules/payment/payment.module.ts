import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './services/payment.service';
import { PaypalService } from './services/paypal.service';
import { Course } from 'src/entities/course.entity';
import { Payment } from 'src/entities/payment.entity';
import { Enrollment } from 'src/entities/enrollment.entity';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
import paypalConfiguration from 'src/config/paypal.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Payment, Enrollment, InstructorProfile]),
    ConfigModule.forRoot({ load: [paypalConfiguration] }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaypalService],
  exports: [PaymentService],
})
export class PaymentModule {}
