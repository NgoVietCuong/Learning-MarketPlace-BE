import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from 'src/entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
    const { title, categoryIds } = body;
    const instructorProfile = await this.instructorProfileRepo.findOneBy({ userId });
    const courseCategories = await this.categoryRepo.findBy({ id: In(categoryIds) });
    const slug = await this.generateSlug(title, this.courseRepo, 'slug');
    const course = await this.courseRepo.save({
      title,
      slug,
      categories: courseCategories,
      instructorId: instructorProfile.id,
    });
    return this.responseOk(course.id);
  }

  async getCourseInfo(courseId: number, userId: number) {
    const courseInfo = await this.courseRepo
      .createQueryBuilder('C')
      .innerJoin('C.profile', 'P')
      .leftJoinAndSelect('C.categories', 'CTG')
      .where('C.id = :id', { id: courseId })
      .andWhere('P.userId = :userId', { userId })
      .getOne();
    return this.responseOk(courseInfo);
  }
}
