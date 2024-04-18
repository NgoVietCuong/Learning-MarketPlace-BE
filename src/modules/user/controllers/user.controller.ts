import { Body, Controller, Patch, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/app/guards/role.guard';
import { User } from 'src/app/decorators/user';
import { AllowAccess } from 'src/app/decorators/allow-access';
import { UserService } from '../user.service';
import { ChangeAvatarDto } from '../dto/change-avatar.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { Roles } from 'src/app/enums/common.enum';

@ApiBearerAuth()
@UseGuards(RoleGuard)
@AllowAccess(Roles.STUDENT, Roles.INSTRUCTOR)
@ApiTags('Account settings')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get user'})
  @Get()
  async getUser(@User('id') id: number) {
    return this.userService.getUser(id);
  }

  @ApiOperation({ summary: 'Change password' })
  @Patch('change-password')
  async changePassword(@Body() body: ChangePasswordDto, @User('id') id: number) {
    return this.userService.changePassword(body, id);
  }

  @ApiOperation({ summary: 'Change avatar' })
  @Patch('change-avatar')
  async changeAvatar(@Body() body: ChangeAvatarDto, @User('id') id: number) {
    return this.userService.changeAvatar(body, id);
  }
}
