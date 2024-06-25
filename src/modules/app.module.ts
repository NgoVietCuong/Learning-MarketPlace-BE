import { Module, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { I18nModule, AcceptLanguageResolver, QueryResolver } from 'nestjs-i18n';
import { BaseModule } from './base/base.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { UserModule } from './user/user.module';
import dataSourceDefaultOptions from 'ormconfig';
import * as path from 'path';
import * as redisStore from 'cache-manager-redis-store';
import { JwtAuthGuard } from 'src/app/guards/jwt.guard';
import { InstructorCourseModule } from './instructor-course/instructor-course.module';
import { LearningModule } from './learning/learning.module';
import { InstructorModule } from './instructor/instructor.module';
import { CategoryModule } from './category/category.module';
import { CourseReviewModule } from './course-review/course-review.module';
import { CourseExplorerModule } from './course-explorer/course-explorer.module';
import { AdminModule } from './admin/admin.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
      loaderOptions: {
        path: path.join(__dirname, '..', '..', 'resources', '/lang/'),
        watch: true,
      },
    }),
    TypeOrmModule.forRoot(dataSourceDefaultOptions),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [],
    }),
    BaseModule,
    AuthModule,
    MailModule,
    UserModule,
    InstructorCourseModule,
    LearningModule,
    InstructorModule,
    CategoryModule,
    CourseReviewModule,
    CourseExplorerModule,
    AdminModule,
    PaymentModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
