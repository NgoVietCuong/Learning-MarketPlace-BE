import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { BaseService } from '../base/base.service';
import { User } from 'src/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeAvatarDto } from './dto/change-avatar.dto';

@Injectable()
export class UserService extends BaseService {
  constructor(
    private readonly trans: I18nService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {
    super();
  }

  async changePassword(body: ChangePasswordDto, userId: number) {
    const { currentPassword, newPassword } = body;
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user.isActive) throw new UnauthorizedException(this.trans.t('messages.USER_DEACTIVATED'));
    if (!user.password) throw new UnauthorizedException(this.trans.t('messages.PASSWORD_INCORRECT'));

    const matchPassword = await bcrypt.compare(currentPassword, user.password);
    if (!matchPassword) throw new UnauthorizedException(this.trans.t('messages.PASSWORD_INCORRECT'));

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await this.userRepo.update({ id: userId }, { password: hashedPassword });
    return this.responseOk();
  }

  async changeAvatar(body: ChangeAvatarDto, userId: number) {
    const { avatar } = body;
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user.isActive) throw new UnauthorizedException(this.trans.t('messages.USER_DEACTIVATED'));
    await this.userRepo.update({ id: userId }, { avatar });
    return this.responseOk();
  }

  async create(data) {
    return await this.userRepo.save(data);
  }

  async update(userId, data) {
    return await this.userRepo.update({ id: userId }, data);
  }

  async findOne(email: string) {
    return await this.userRepo.findOne({ where: { email }, relations: ['roles'] });
  }
}
