import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAccess } from 'src/app/decorators/allow-access';
import { Roles } from 'src/app/enums/common.enum';
import { RoleGuard } from 'src/app/guards/role.guard';
import { LearningService } from './learning.service';
import { User } from 'src/app/decorators/user';
import { EnrollCourseDto } from './dto/enroll.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@ApiBearerAuth()
@UseGuards(RoleGuard)
@AllowAccess(Roles.STUDENT)
@ApiTags('Learning')
@Controller('learning')
export class LearningController {
  constructor(private learningService: LearningService) {}

  @ApiOperation({ summary: 'Enroll course' })
  @Post('enroll')
  async enrollCourse(@Body() body: EnrollCourseDto, @User('id') id: number) {
    return this.learningService.enrollCourse(body, id);
  }

  @ApiOperation({ summary: 'Get my course list' })
  @Get('my-courses')
  async getMyCourseList(@User('id') id: number) {
    return this.learningService.getMyCourseList(id);
  }

  @ApiOperation({ summary: 'Update progress' })
  @Put('update-progress')
  async updateProgress(@Body() body: UpdateProgressDto) {
    return this.learningService.updateProgress(body);
  }

  @ApiOperation({ summary: 'Get lesson progress' })
  @Get('lesson/:lessonId')
  async getLessonProgress(@Param('lessonId') lessonId: number, @User('id') id: number) {
    return this.learningService.getLessonProgress(lessonId, id)
  }

  @ApiOperation({ summary: 'Get course learning progress' })
  @Get('course/:slug')
  async getCourseProgress(@Param('slug') slug: string, @User('id') id: number) {
    return this.learningService.getCourseProgress(slug, id);
  }


}
