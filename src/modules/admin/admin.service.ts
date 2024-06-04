import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { ListUsersDto } from './dto/list-users.dto';
import { Role } from 'src/entities/role.entity';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
import { ChangeUserStatusDto } from './dto/change-user-status.dto';
import { NotFoundException } from '@nestjs/common';
@Injectable()
export class AdminService extends BaseService {
  constructor(
    private readonly trans: I18nService,
    private userService: UserService,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(InstructorProfile) private instructorProfileRepo: Repository<InstructorProfile>,
  ) {
    super();
  }

  async getListUsers(query: ListUsersDto) {
    const users = await this.userService.getListUsers(query);
    return this.responseOk(users);
  }

  async changeUserStatus(userId: number, body: ChangeUserStatusDto) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'User' } }));

    await this.userService.update(userId, body);
    return this.responseOk();
  }
}
