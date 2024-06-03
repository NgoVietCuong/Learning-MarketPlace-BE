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
    const users = await this.userService.getListUsers(query)
    return this.responseOk(users)
  }
}
