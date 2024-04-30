import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from 'src/entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../base/base.service';
import { Category } from 'src/entities/category.entity';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';

@Injectable()
export class CourseService extends BaseService {
  constructor(
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(InstructorProfile) private readonly instructorProfileRepo: Repository<InstructorProfile>,
  ) {
    super();
  }
  async createCourse(body: CreateCourseDto, userId: number) {
    const { title, category } = body;
    const intructorProfile = await this.instructorProfileRepo.findOneBy({ userId });
    const courseCategory = await this.categoryRepo.findOneBy({ name: category });
    const course = await this.courseRepo.save({ title, categories: [courseCategory], profile: intructorProfile });
    return this.responseOk(course.id);
  }
}
