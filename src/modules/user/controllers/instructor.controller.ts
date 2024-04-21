import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAccess } from 'src/app/decorators/allow-access';
import { Roles } from 'src/app/enums/common.enum';
import { RoleGuard } from 'src/app/guards/role.guard';
import { UserService } from '../user.service';
import { User } from 'src/app/decorators/user';

@ApiBearerAuth()
@UseGuards(RoleGuard)
@AllowAccess(Roles.INSTRUCTOR)
@ApiTags('Instructor profile')
@Controller('instructor')
export class InstructorController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get instructor profile' })
  @Get('profile')
  async getInstructorProfile(@User('id') id: number) {
    return this.userService.getInstructorProfile(id);
  }
}
