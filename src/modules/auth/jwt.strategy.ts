import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { I18nService } from 'nestjs-i18n';
import { UserService } from '../user/user.service';
import jwtConfiguration from 'src/config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    private readonly trans: I18nService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(jwtConfiguration.KEY) private jwtConfig: ConfigType<typeof jwtConfiguration>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: any) {
    const { email, roles } = payload;
    if (!roles) throw new UnauthorizedException();

    const user = await this.userService.findOne(email);
    if (!user) throw new UnauthorizedException();
    if (!user.isActive) throw new UnauthorizedException(this.trans.t('messages.USER_DEACTIVATED'));

    const cacheRefreshToken = await this.cacheManager.get(`refresh_token_${user.id}`);
    if (!cacheRefreshToken) throw new UnauthorizedException();
    return user;
  }
}