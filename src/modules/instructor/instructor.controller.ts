import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/app/decorators/public';
import { AllowAccess } from 'src/app/decorators/allow-access';
import { Roles } from 'src/app/enums/common.enum';
import { RoleGuard } from 'src/app/guards/role.guard';
import { InstructorService } from './instructor.service';
import { User } from 'src/app/decorators/user';
import { ChangeInstructorPictureDto } from './dto/change-instructor-picture.dto';
import { ChangeInstructorProfileDto } from './dto/change-instructor-profile.dto';

@ApiBearerAuth()
@UseGuards(RoleGuard)
@AllowAccess(Roles.INSTRUCTOR)
@ApiTags('Instructor profile')
@Controller('instructor')
export class InstructorController {
  constructor(private instructorService: InstructorService) {}

  @ApiOperation({ summary: 'Get instructor profile' })
  @Get('profile')
  async getInstructorProfile(@User('id') id: number) {
    return this.instructorService.getInstructorProfile(id);
  }

  @ApiOperation({ summary: 'Change intructor profile' })
  @Patch('profile/change-information')
  async changeInstructorProfile(@Body() body:ChangeInstructorProfileDto, @User('id') id: number) {
    return this.instructorService.changeInstructorProfile(body, id);
  }

  @ApiOperation({ summary: 'Change intructor picture' })
  @Patch('profile/change-picture')
  async changeInstructorPicture(@Body() body:ChangeInstructorPictureDto, @User('id') id: number) {
    return this.instructorService.changeInstructorPicture(body, id);
  }
  
  @Public()
  @ApiOperation({ summary: 'Get public instructor information' })
  @Get('profile/:slug')
  async getInstructorInfo( @Param('slug') slug: string) {
    return this.instructorService.getInstructorInfo(slug);
  }
}
