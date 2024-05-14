import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
