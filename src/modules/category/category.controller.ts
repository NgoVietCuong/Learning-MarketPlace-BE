import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAccess } from 'src/app/decorators/allow-access';
import { Roles } from 'src/app/enums/common.enum';
import { RoleGuard } from 'src/app/guards/role.guard';
import { User } from 'src/app/decorators/user';
import { Public } from 'src/app/decorators/public';
import { CategoryService } from './category.service';

@Public()
@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Get category list' })
  @Get('list')
  async getCategoryList() {
    return this.categoryService.getCategoryList();
  }
}
