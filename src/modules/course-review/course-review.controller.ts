import { Body, Controller, Get, Patch, Post, Param, UseGuards, Query, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/app/decorators/public';
import { AllowAccess } from 'src/app/decorators/allow-access';
import { Roles } from 'src/app/enums/common.enum';
import { RoleGuard } from 'src/app/guards/role.guard';
import { CourseReviewService } from './course-review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ListReviewsDto } from './dto/get-list-reviews.dto';

@ApiBearerAuth()
@UseGuards(RoleGuard)
@AllowAccess(Roles.STUDENT)
@ApiTags('Course review')
@Controller('review')
export class CourseReviewController {
  constructor(private courseReviewService: CourseReviewService) {}

  @ApiOperation({ summary: 'Create course review' })
  @Post()
  async createReview(@Body() body: CreateReviewDto) {
    return this.courseReviewService.createReview(body);
  }

  @ApiOperation({ summary: 'Update course review' })
  @Patch('/:reviewId')
  async updateReview(@Body() body: UpdateReviewDto, @Param('reviewId') reviewId: number) {
    return this.courseReviewService.updateReview(body, reviewId);
  }

  @Public()
  @ApiOperation({ summary: 'Get list reviews' })
  @Get('/list')
  async getlistReviews(@Query() query: ListReviewsDto) {
    return this.courseReviewService.getListReviews(query);
  }
}
