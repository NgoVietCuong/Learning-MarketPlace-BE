import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { BaseService } from '../base/base.service';
import { User } from 'src/entities/user.entity';
import { Role } from 'src/entities/role.entity';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
import { Roles } from 'src/app/enums/common.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeAvatarDto } from './dto/change-avatar.dto';
import { ListUsersDto } from '../admin/dto/list-users.dto';

@Injectable()
export class UserService extends BaseService {
  constructor(
    private readonly trans: I18nService,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(InstructorProfile) private instructorProfileRepo: Repository<InstructorProfile>,
  ) {
    super();
  }

  async getUser(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId, emailVerified: true, isActive: true },
      relations: ['roles'],
    });
    return this.responseOk(user);
  }

  async changePassword(body: ChangePasswordDto, userId: number) {
    const { currentPassword, newPassword } = body;
    const user = await this.userRepo.findOneBy({ id: userId });

    if (user.password) {
      const matchPassword = await bcrypt.compare(currentPassword, user.password);
      if (!matchPassword) throw new UnauthorizedException(this.trans.t('messages.PASSWORD_INCORRECT'));
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await this.userRepo.update({ id: userId }, { password: hashedPassword });
    return this.responseOk();
  }

  async changeAvatar(body: ChangeAvatarDto, userId: number) {
    const { avatar } = body;
    await this.userRepo.update({ id: userId }, { avatar });
    return this.responseOk();
  }

  async becomeInstructor(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['roles'] });
    const instructorRole = await this.roleRepo.findOneBy({ code: Roles.INSTRUCTOR });
    if (!instructorRole) throw new BadRequestException('Role not found');

    const isIntructor = user.roles.find((role) => role.code === Roles.INSTRUCTOR);
    if (!isIntructor) {
      user.roles.push(instructorRole);
      await this.userRepo.save(user);
      await this.instructorProfileRepo.save({ userId });
    }
    return this.responseOk();
  }

  async getListUsers(query: ListUsersDto) {
    const { page, limit, search, isActive, role } = query;
    const queryBuilder = this.userRepo
      .createQueryBuilder('U')
      .leftJoinAndSelect('U.roles', 'R')
      .where('R.code <> :code', { code: Roles.ADMIN });
      
    if (role) queryBuilder.andWhere('R.code = :role', { role });
    if (isActive !== undefined) queryBuilder.andWhere('U.isActive = :isActive', { isActive });
    if (search)
      queryBuilder.andWhere(
        new Brackets((subQ) => {
          subQ
            .where(this.searchCaseInsensitive('U.username'), { keyword: `%${search}%` })
            .orWhere(this.searchCaseInsensitive('U.email'), { keyword: `%${search}%` });
        }),
      );

    queryBuilder.orderBy('U.updatedAt', 'DESC');
    const users = await this.customPaginate<User>(queryBuilder, page, limit);
    return users;
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
