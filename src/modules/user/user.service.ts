import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { BaseService } from '../base/base.service';
import { User } from 'src/entities/user.entity';
import { Role } from 'src/entities/role.entity';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
import { Roles } from 'src/app/enums/common.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeAvatarDto } from './dto/change-avatar.dto';
import { ChangeInstructorProfileDto } from './dto/change-instructor-profile.dto';
import { ChangeInstructorPictureDto } from './dto/change-instructor-picture.dto';

@Injectable()
export class UserService extends BaseService {
  constructor(
    private readonly trans: I18nService,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(InstructorProfile) private readonly instructorProfileRepo: Repository<InstructorProfile>,
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

  async getInstructorProfile(userId: number) {
    const instructorProfile = await this.instructorProfileRepo.findOneBy({ userId });
    return this.responseOk(instructorProfile);
  }

  async changeInstructorProfile(body: ChangeInstructorProfileDto, userId: number) {
    const slug = await this.generateSlug(body.displayName, this.instructorProfileRepo, 'slug');
    await this.instructorProfileRepo.update({ userId }, { ...body, slug });
    return this.responseOk();
  }

  async changeInstructorPicture(body: ChangeInstructorPictureDto, userId: number) {
    const { picture } = body;
    await this.instructorProfileRepo.update({ userId }, { picture });
    return this.responseOk();
  }

  async getInstructorInfo(slug: string) {
    const profile = await this.instructorProfileRepo
      .createQueryBuilder('IP')
      .innerJoin('IP.user', 'U')
      .where('IP.slug = :slug', { slug })
      .andWhere('U.isActive = :isActive', { isActive: true })
      .getOne();
    return this.responseOk(profile);
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
