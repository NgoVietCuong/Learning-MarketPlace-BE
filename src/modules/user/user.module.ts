import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from 'src/entities/user.entity';
import { Role } from 'src/entities/role.entity';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, Role, InstructorProfile])],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
