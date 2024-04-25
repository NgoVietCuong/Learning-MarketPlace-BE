import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/app/decorators/public';
import { AllowAccess } from 'src/app/decorators/allow-access';
import { Roles } from 'src/app/enums/common.enum';
import { RoleGuard } from 'src/app/guards/role.guard';
import { UserService } from '../user.service';
import { User } from 'src/app/decorators/user';
import { ChangeInstructorProfileDto } from '../dto/change-instructor-profile.dto';
import { ChangeInstructorPictureDto } from '../dto/change-instructor-picture.dto';

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

  @ApiOperation({ summary: 'Change intructor profile' })
  @Patch('profile/change-information')
  async changeInstructorProfile(@Body() body:ChangeInstructorProfileDto, @User('id') id: number) {
    return this.userService.changeInstructorProfile(body, id);
  }

  @ApiOperation({ summary: 'Change intructor picture' })
  @Patch('profile/change-picture')
  async changeInstructorPicture(@Body() body:ChangeInstructorPictureDto, @User('id') id: number) {
    return this.userService.changeInstructorPicture(body, id);
  }
  
  @Public()
  @ApiOperation({ summary: 'Get public instructor information' })
  @Get('profile/:slug')
  async getInstructorInfo( @Param('slug') slug: string) {
    return this.userService.getInstructorInfo(slug);
  }
}
