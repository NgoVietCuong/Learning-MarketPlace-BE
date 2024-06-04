import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAccess } from 'src/app/decorators/allow-access';
import { Roles } from 'src/app/enums/common.enum';
import { RoleGuard } from 'src/app/guards/role.guard';
import { AdminService } from './admin.service';
import { User } from 'src/app/decorators/user';
import { ListUsersDto } from './dto/list-users.dto';
import { ChangeUserStatusDto } from './dto/change-user-status.dto';

@ApiBearerAuth()
@UseGuards(RoleGuard)
@AllowAccess(Roles.ADMIN)
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @ApiOperation({ summary: 'Get list users' })
  @Get('/user/list')
  async getListUser(@Query() query: ListUsersDto) {
    return this.adminService.getListUsers(query);
  }

  
  @ApiOperation({ summary: 'Change user status' })
  @Patch('/users/:userId/status')
  async changeUserStatus(@Param('userId') userId: number, @Body() body: ChangeUserStatusDto ) {
    return this.adminService.changeUserStatus(userId, body);
  }
}
