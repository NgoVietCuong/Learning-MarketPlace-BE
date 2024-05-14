import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAccess } from 'src/app/decorators/allow-access';
import { Roles } from 'src/app/enums/common.enum';
import { RoleGuard } from 'src/app/guards/role.guard';
import { LearningService } from './learning.service';
import { User } from 'src/app/decorators/user';
import { EnrollCourseDto } from './dto/enroll.dto';

@ApiBearerAuth()
@UseGuards(RoleGuard)
@AllowAccess(Roles.STUDENT)
@ApiTags('Learning')
@Controller('learning')
export class LearningController {
  constructor(private learningService: LearningService) {}

  @ApiOperation({ summary: 'Enroll course' })
  @Post('enrollment')
  async enrollCourse(@Body() body: EnrollCourseDto, @User('id') id: number) {
    return this.learningService.enrollCourse(body, id);
  }

  @ApiOperation({ summary: 'Get my course list' })
  @Get('my-courses')
  async getMyCourseList(@User('id') id: number) {
    return this.learningService.getMyCourseList(id);
  }
}
