import { Body, Controller, Patch, Get, UseGuards, Post, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/app/guards/role.guard';
import { AllowAccess } from 'src/app/decorators/allow-access';
import { Roles } from 'src/app/enums/common.enum';
import { CreateCourseDto } from '../dto/create-course.dto';
import { CourseService } from '../course.service';
import { User } from 'src/app/decorators/user';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { UpdatePublishCourseDto } from '../dto/update-publish.dto';
import { ListCoursesDto } from '../dto/list-courses.dto';

@ApiBearerAuth()
@UseGuards(RoleGuard)
@AllowAccess(Roles.INSTRUCTOR)
@ApiTags('Instructor Course')
@Controller('instructor/course')
export class InstructorCourseController {
  constructor(private courseService: CourseService) {}

  @ApiOperation({ summary: 'Create course' })
  @Post('')
  async createCourse(@Body() body: CreateCourseDto, @User('id') id: number) {
    return this.courseService.createCourse(body, id);
  }

  @ApiOperation({ summary: 'Get list courses' })
  @Get('list')
  async getListCourses(@Query() query: ListCoursesDto, @User('id') id: number) {
    return this.courseService.getListCourses(query, id);
  }

  @ApiOperation({ summary: 'Get course information' })
  @Get(':courseId')
  async getCourseInfo(@Param('courseId') courseId: number, @User('id') id: number) {
    return this.courseService.getCourseInfo(courseId, id);
  }

  @ApiOperation({ summary: 'Delete course' })
  @Delete(':courseId')
  async deleteCourse(@Param('courseId') courseId: number, @User('id') id: number) {
    return this.courseService.deleteCourse(courseId, id);
  }

  @ApiOperation({ summary: 'Update course' })
  @Patch(':courseId')
  async updateCourse(@Param('courseId') courseId: number, @User('id') id: number, @Body() body: UpdateCourseDto) {
    return this.courseService.updateCourse(courseId, id, body);
  }

  @ApiOperation({ summary: 'Update publish course' })
  @Patch(':courseId/publish')
  async updatePublishCourse(
    @Param('courseId') courseId: number,
    @User('id') id: number,
    @Body() body: UpdatePublishCourseDto,
  ) {
    return this.courseService.updatePublishCourse(courseId, id, body);
  }

  
}
