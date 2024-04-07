import { Module, Global, Scope } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { constants } from 'src/app/constants/common.constant';

const authUserProvider = {
  provide: constants.INJECT_TOKEN.AUTH_USER,
  scope: Scope.REQUEST,
  useFactory: (request: Request, jwtService: JwtService, configService: ConfigService) => {
    try {
      let token = request.headers.authorization.split(' ')[1];
      const payload = jwtService.verify(token, { secret: configService.get('jwt.secret') });
      if (!payload) return null;
      return payload.id || null;
    } catch (e) {
      return null;
    }
  },
  inject: [REQUEST, JwtService, ConfigService],
};

@Global()
@Module({
  providers: [authUserProvider, JwtService, ConfigService],
  exports: [constants.INJECT_TOKEN.AUTH_USER],
})
export class AuthUserModule {}
