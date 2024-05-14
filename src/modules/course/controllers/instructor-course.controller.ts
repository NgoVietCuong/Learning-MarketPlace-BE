import { Body, Controller, Patch, Get, UseGuards, Post, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/app/guards/role.guard';
import { AllowAccess } from 'src/app/decorators/allow-access';
import { Roles } from 'src/app/enums/common.enum';
import { CreateCourseDto } from '../dto/create-course.dto';
import { CourseService } from '../course.service';
import { User } from 'src/app/decorators/user';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { UpdatePublishDto } from '../dto/update-publish.dto';
import { ListCoursesDto } from '../dto/list-courses.dto';
import { CreateSectionDto } from '../dto/create-section.dto';
import { UpdateSectionDto } from '../dto/update-section.dto';
import { CreateLessonDto } from '../dto/create-lesson.dto';
import { UpdateLessonDto } from '../dto/update-lesson.dto';

@ApiBearerAuth()
@UseGuards(RoleGuard)
@AllowAccess(Roles.INSTRUCTOR)
@ApiTags('Instructor Course')
@Controller('instructor/course')
export class InstructorCourseController {
  constructor(private courseService: CourseService) {}

  @ApiOperation({ summary: 'Create course' })
  @Post()
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
    @Body() body: UpdatePublishDto,
  ) {
    return this.courseService.updatePublishCourse(courseId, id, body);
  }

  @ApiOperation({ summary: 'Create new section' })
  @Post('section')
  async createSection(@Body() body: CreateSectionDto) {
    return this.courseService.createSection(body);
  }

  @ApiOperation({ summary: 'Update section' })
  @Patch('section/:sectionId')
  async updateSection(@Param('sectionId') sectionId: number, @Body() body: UpdateSectionDto) {
    return this.courseService.updateSection(sectionId, body);
  }

  @ApiOperation({ summary: 'Delete section' })
  @Delete('section/:sectionId')
  async deleteSection(@Param('sectionId') sectionId: number) {
    return this.courseService.deleteSection(sectionId);
  }

  @ApiOperation({ summary: 'Create new lesson' })
  @Post('lesson')
  async createLesson(@Body() body: CreateLessonDto) {
    return this.courseService.createLesson(body);
  }

  @ApiOperation({ summary: 'Update lesson' })
  @Patch('lesson/:lessonId')
  async updateLesson(@Param('lessonId') lessonId: number, @Body() body: UpdateLessonDto) {
    return this.courseService.updateLesson(lessonId, body);
  }

  @ApiOperation({ summary: 'Update publish lesson' })
  @Patch('lesson/:lessonId/publish')
  async updatePublishLesson(@Param('lessonId') lessonId: number, @Body() body: UpdatePublishDto) {
    return this.courseService.updatePublishLesson(lessonId, body);
  }

  @ApiOperation({ summary: 'Delete lesson' })
  @Delete('lesson/:lessonId')
  async deleteLesson(@Param('lessonId') lessonId: number) {
    return this.courseService.deleteLesson(lessonId);
  }
}
