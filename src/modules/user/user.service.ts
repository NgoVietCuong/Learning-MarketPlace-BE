import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../base/base.service';
import { User } from 'src/entities/user.entity';

@Injectable()
export class UserService extends BaseService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {
    super();
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
