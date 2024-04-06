import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { GoogleAuthService } from './services/google-auth.service';
import { JwtStrategy } from './jwt.strategy';
import { Role } from 'src/entities/role.entity';
import { AuthUserModule } from './auth-user/auth-user.module';
import jwtConfiguration from 'src/config/jwt.config';
import googleConfiguration from 'src/config/google.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [jwtConfiguration, googleConfiguration],
    }),
    TypeOrmModule.forFeature([Role]),
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: {
          algorithm: config.get('jwt.algorithm'),
        },
      }),
      inject: [ConfigService],
    }),
    MailModule,
    UserModule,
    AuthUserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleAuthService, JwtStrategy],
})
export class AuthModule {}
