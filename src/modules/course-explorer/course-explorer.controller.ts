import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/app/guards/role.guard';
import { Public } from 'src/app/decorators/public';
import { CourseExplorerService } from './course-explorer.service';
import { User } from 'src/app/decorators/user';
import { SearchCourseDto } from './dto/search-course.dto';

@Public()
@ApiTags('Course explorer')
@Controller('course')
export class CourseExplorerController {
  constructor(private courseExplorerService: CourseExplorerService) {}

  @ApiOperation({ summary: 'Search course' })
  @Get('/list')
  async searchCourse(@Query() query: SearchCourseDto) {
    return this.courseExplorerService.searchCourse(query);
  }

  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Get course by slug' })
  @Get('/:slug')
  async getCourse(@User('id') id: number, @Param('slug') slug: string) {
    return this.courseExplorerService.getCourse(id, slug);
  }
}
