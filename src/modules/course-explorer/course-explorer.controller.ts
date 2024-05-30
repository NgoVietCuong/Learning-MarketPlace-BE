import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/app/guards/role.guard';
import { Public } from 'src/app/decorators/public';
import { CourseExplorerService } from './course-explorer.service';
import { User } from 'src/app/decorators/user';

@Public()
@ApiTags('Course explorer')
@Controller('course')
export class CourseExplorerController {
  constructor(private courseExplorerService: CourseExplorerService) {}

  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Get course by slug' })
  @Get('/:slug')
  async getCourse(@User('id') id: number, @Param('slug') slug: string) {
    return this.courseExplorerService.getCourse(id, slug);
  }
}
