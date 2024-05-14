import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService extends BaseService {
  constructor(@InjectRepository(Category) private readonly categoryRepo: Repository<Category>) {
    super();
  }
  async getCategoryList() {
    const categoryList = await this.categoryRepo.find();
    return this.responseOk(categoryList);
  }
}
