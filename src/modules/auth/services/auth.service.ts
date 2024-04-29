import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { BaseService } from '../../base/base.service';
import { MailService } from '../../mail/mail.service';
import { UserService } from '../../user/user.service';
import { GoogleAuthService } from './google-auth.service';
import { LoginDto } from '../dto/login.dto';
import { SignUpDto } from '../dto/sign-up.dto';
import { GoogleLoginDto } from '../dto/google-login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { VerifySignUpDto } from '../dto/verify-signup.dto';
import { SendResetEmailDto } from '../dto/send-reset-email.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { ResendVerifyEmailDto } from '../dto/resend-verify-email.dto';
import { VerifyResetPasswordDto } from '../dto/verify-reset-password.dto';
import { Role } from 'src/entities/role.entity';
import { constants } from 'src/app/constants/common.constant';
import { Roles, AccountConfirmationType } from 'src/app/enums/common.enum';

@Injectable()
export class AuthService extends BaseService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private mailService: MailService,
    private userService: UserService,
    private googleAuthService: GoogleAuthService,
    private readonly trans: I18nService,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super();
  }

  async signUp(body: SignUpDto) {
    const { username, email, password } = body;
    const user = await this.userService.findOne(email);
    if (user) throw new BadRequestException(this.trans.t('messages.EXIST', { args: { object: 'Account' } }));

    const studentRole = await this.roleRepo.findOneBy({ code: Roles.STUDENT });
    if (!studentRole) throw new BadRequestException('Role not found');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const userData = {
      username,
      email,
      password: hashedPassword,
      emailVerified: false,
      roles: [studentRole],
    };

    const newUser = await this.userService.create(userData);
    const verifyCode = await this.generateVerifyCode(newUser.id, AccountConfirmationType.VERIFY_SIGNUP);
    await this.mailService.sendMail(
      email,
      'Verify Your Email',
      path.join(__dirname, '..', '..', '..', '..', 'resources', 'templates', 'verify-signup.ejs'),
      { username, verifyCode },
    );
    return this.responseOk({}, this.trans.t('messages.SIGNUP_SUCCESS'));
  }

  async verifySignUp(body: VerifySignUpDto) {
    const { email, code } = body;
    const user = await this.userService.findOne(email);
    if (!user) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'User' } }));
    if (user.emailVerified) throw new BadRequestException(this.trans.t('messages.SIGNUP_EMAIL_VERIFIED'));

    const verifyCode: string = await this.cacheManager.get(`${AccountConfirmationType.VERIFY_SIGNUP}_${user.id}`);
    if (!verifyCode) throw new BadRequestException(this.trans.t('messages.VERIFY_CODE_EXPIRED'));
    if (verifyCode && code !== verifyCode) throw new BadRequestException(this.trans.t('messages.VERIFY_CODE_INVALID'));

    await this.userService.update(user.id, { emailVerified: true });
    return this.responseOk({}, this.trans.t('messages.VERIFY_SUCCESS'));
  }

  async resendVerifyEmail(body: ResendVerifyEmailDto) {
    const { email } = body;
    const user = await this.userService.findOne(email);
    if (!user) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'User' } }));
    if (user.emailVerified) throw new BadRequestException(this.trans.t('messages.SIGNUP_EMAIL_VERIFIED'));

    const verifyCode = await this.generateVerifyCode(user.id, AccountConfirmationType.VERIFY_SIGNUP);
    await this.mailService.sendMail(
      email,
      'Verify Your Email',
      path.join(__dirname, '..', '..', '..', '..', 'resources', 'templates', 'verify-signup.ejs'),
      { username: user.username, verifyCode },
    );
    return this.responseOk();
  }

  async login(body: LoginDto) {
    const { email, password } = body;
    const user = await this.userService.findOne(email);
    if (!user) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'User' } }));
    if (!user.emailVerified) throw new UnauthorizedException(this.trans.t('messages.EMAIL_NOT_VERIFIED'));
    if (!user.isActive) throw new UnauthorizedException(this.trans.t('messages.USER_DEACTIVATED'));
    if (!user.password) throw new UnauthorizedException(this.trans.t('messages.PASSWORD_INCORRECT'));

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) throw new UnauthorizedException(this.trans.t('messages.PASSWORD_INCORRECT'));

    const accessPayload = { id: user.id, email: user.email, roles: user.roles };
    const refreshPayload = { id: user.id, email: user.email };
    const accessToken = this.jwtService.sign(accessPayload, { expiresIn: constants.ACCESS_TOKEN.EXPIRES_IN });
    const refreshToken = this.jwtService.sign(refreshPayload, { expiresIn: constants.REFRESH_TOKEN.EXPIRES_IN });
    await this.cacheManager.set(`refresh_token_${user.id}`, refreshToken, { ttl: constants.REFRESH_TOKEN.TLL });
    return this.responseOk({
      accessToken,
      refreshToken,
    });
  }

  async loginByGoogle(body: GoogleLoginDto) {
    const { idToken } = body;
    const googlePayload = await this.googleAuthService.verifyToken(idToken);
    if (!googlePayload) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'User' } }));
    if (!googlePayload['email']) throw new BadRequestException(this.trans.t('messages.GOOGLE_AUTH_EMAIL_SCOPE'));

    const { name, email, email_verified, picture } = googlePayload;
    let user = await this.userService.findOne(email);
    if (!user) {
      const studentRole = await this.roleRepo.findOneBy({ code: Roles.STUDENT });
      if (!studentRole) throw new BadRequestException('Role not found');

      const userData = {
        username: name,
        email,
        emailVerified: email_verified,
        isActive: true,
        avatar: picture,
        roles: [studentRole],
      };
      user = await this.userService.create(userData);
    }
    if (user && !user.isActive) throw new UnauthorizedException(this.trans.t('messages.USER_DEACTIVATED'));
    let avatar = user.avatar ? user.avatar : picture;
    await this.userService.update(user.id, { avatar });

    const accessPayload = { id: user.id, email: user.email, roles: user.roles };
    const refreshPayload = { id: user.id, email: user.email };
    const accessToken = this.jwtService.sign(accessPayload, { expiresIn: constants.ACCESS_TOKEN.EXPIRES_IN });
    const refreshToken = this.jwtService.sign(refreshPayload, { expiresIn: constants.REFRESH_TOKEN.EXPIRES_IN });
    await this.cacheManager.set(`refresh_token_${user.id}`, refreshToken, { ttl: constants.REFRESH_TOKEN.TLL });
    return this.responseOk({
      accessToken,
      refreshToken,
    });
  }

  async sendResetEmail(body: SendResetEmailDto) {
    const { email, url } = body;
    const user = await this.userService.findOne(email);
    if (!user) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'User' } }));
    if (!user.emailVerified) throw new UnauthorizedException(this.trans.t('messages.EMAIL_NOT_VERIFIED'));
    if (!user.isActive) throw new UnauthorizedException(this.trans.t('messages.USER_DEACTIVATED'));

    const verifyCode = await this.generateVerifyCode(user.id, AccountConfirmationType.RESET_PASSWORD);
    const redirectUrl = url + '?email=' + encodeURIComponent(user.email) + '&code=' + verifyCode;
    await this.mailService.sendMail(
      email,
      'Reset Your Password',
      path.join(__dirname, '..', '..', '..', '..', 'resources', 'templates', 'reset-password.ejs'),
      { username: user.username, redirectUrl },
    );
    return this.responseOk();
  }

  async verifyResetPassword(body: VerifyResetPasswordDto) {
    const { email, code } = body;
    const user = await this.userService.findOne(email);
    if (!user) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'User' } }));

    const verifyCode: string = await this.cacheManager.get(`${AccountConfirmationType.RESET_PASSWORD}_${user.id}`);
    return this.responseOk({ isValid: verifyCode && code === verifyCode });
  }

  async updatePassword(body: UpdatePasswordDto) {
    const { email, code, password } = body;
    const user = await this.userService.findOne(email);
    if (!user) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'User' } }));
    if (!user.emailVerified) throw new UnauthorizedException(this.trans.t('messages.EMAIL_NOT_VERIFIED'));
    if (!user.isActive) throw new UnauthorizedException(this.trans.t('messages.USER_DEACTIVATED'));

    const verifyCode: string = await this.cacheManager.get(`${AccountConfirmationType.RESET_PASSWORD}_${user.id}`);
    if (!verifyCode) throw new BadRequestException(this.trans.t('messages.VERIFY_CODE_EXPIRED'));
    if (verifyCode && code !== verifyCode) throw new BadRequestException(this.trans.t('messages.VERIFY_CODE_INVALID'));

    if (user.password) {
      const matchPassword = await bcrypt.compare(password, user.password);
      if (matchPassword) throw new BadRequestException(this.trans.t('messages.SAME_PASSWORD'));
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    await this.userService.update(user.id, { password: hashedPassword });
    return this.responseOk();
  }

  async refreshToken(body: RefreshTokenDto) {
    const { refreshToken } = body;
    try {
      const refreshPayload = this.jwtService.verify(refreshToken);
      const { id, email } = refreshPayload;

      const cacheRefreshToken = await this.cacheManager.get(`refresh_token_${id}`);
      if (!cacheRefreshToken) throw new UnauthorizedException(this.trans.t('messages.REFRESH_TOKEN_EXPIRED'));
      if (refreshToken !== cacheRefreshToken)
        throw new UnauthorizedException(this.trans.t('messages.REFRESH_TOKEN_INVALID'));

      const user = await this.userService.findOne(email);
      if (!user) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'User' } }));

      const accessPayload = { id, email, roles: user.roles };
      const accessToken = this.jwtService.sign(accessPayload, { expiresIn: constants.ACCESS_TOKEN.EXPIRES_IN });
      return this.responseOk({ accessToken });
    } catch (e) {
      this.logger.error(e);
      throw new BadRequestException(this.trans.t('messages.REFRESH_TOKEN_INVALID'));
    }
  }

  async logout(userId: number) {
    await this.cacheManager.del(`refresh_token_${userId}`);
    return this.responseOk();
  }

  async generateVerifyCode(userId: number, type: AccountConfirmationType) {
    let codeLength: number;
    let codeTTL: number;
    if (type === AccountConfirmationType.VERIFY_SIGNUP) {
      ({ LENGTH: codeLength, TTL: codeTTL } = constants.VERIFY_SIGNUP_CODE);
    } else {
      ({ LENGTH: codeLength, TTL: codeTTL } = constants.RESET_PASSWORD_CODE);
    }
    const verifyCode = this.generateRandomCode(codeLength);
    await this.cacheManager.set(`${type}_${userId}`, verifyCode, { ttl: codeTTL });
    return verifyCode;
  }
}
