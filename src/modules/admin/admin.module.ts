import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { Role } from 'src/entities/role.entity';
import { User } from 'src/entities/user.entity';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, InstructorProfile])],
  controllers: [AdminController],
  providers: [AdminService, UserService]
})
export class AdminModule {}
