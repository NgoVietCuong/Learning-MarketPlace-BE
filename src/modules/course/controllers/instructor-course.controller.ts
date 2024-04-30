import { Body, Controller, Patch, Get, UseGuards, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/app/guards/role.guard';
import { AllowAccess } from 'src/app/decorators/allow-access';
import { Roles } from 'src/app/enums/common.enum';
import { CreateCourseDto } from '../dto/create-course.dto';
import { CourseService } from '../course.service';
import { User } from 'src/app/decorators/user';

@ApiBearerAuth()
@UseGuards(RoleGuard)
@AllowAccess(Roles.INSTRUCTOR)
@ApiTags('Course')
@Controller('instructor-course')
export class InstructorCourseController {
  constructor(private courseService: CourseService) {}
  @ApiOperation({ summary: 'Create course' })
  @Post('')
  async createCourse(@Body() body: CreateCourseDto, @User('id') id: number) {
    return this.courseService.createCourse(body, id);
  }
}
