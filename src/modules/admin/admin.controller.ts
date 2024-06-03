import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAccess } from 'src/app/decorators/allow-access';
import { Roles } from 'src/app/enums/common.enum';
import { RoleGuard } from 'src/app/guards/role.guard';
import { AdminService } from './admin.service';
import { User } from 'src/app/decorators/user';
import { ListUsersDto } from './dto/list-users.dto';

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
}
