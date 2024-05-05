import { I18nService } from 'nestjs-i18n';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from 'src/entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BaseService } from '../base/base.service';
import { Category } from 'src/entities/category.entity';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdatePublishCourseDto } from './dto/update-publish.dto';

@Injectable()
export class CourseService extends BaseService {
  constructor(
    private readonly trans: I18nService,
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
    return this.responseOk({ id: course.id });
  }

  async getCourseInfo(courseId: number, userId: number) {
    const courseInfo = await this.getCourse(courseId, userId);
    return this.responseOk(courseInfo);
  }

  async deleteCourse(courseId: number, userId: number) {
    const course = await this.getCourse(courseId, userId);
    if (!course) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'Course' } }));
    await this.courseRepo.remove(course);
    return this.responseOk();
  }

  async updateCourse(courseId: number, userId: number, body: UpdateCourseDto) {
    const { categoryIds, ...properties } = body;
    let course = await this.getCourse(courseId, userId);
    if (!course) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'Course' } }));

    const slug = await this.generateSlug(body.title, this.courseRepo, 'slug');
    const categories = await this.categoryRepo.findBy({ id: In(categoryIds) });
    course = Object.assign(course, { ...properties, slug, categories });
    await this.courseRepo.save(course);
    return this.responseOk();
  }

  async updatePublishCourse(courseId: number, userId: number, body: UpdatePublishCourseDto) {
    const { isPublished } = body;
    let course = await this.getCourse(courseId, userId);
    if (!course) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'Course' } }));

    await this.courseRepo.update({ id: courseId }, { isPublished });
    return this.responseOk();
  }

  async getCourse(courseId: number, userId: number) {
    const course = await this.courseRepo
      .createQueryBuilder('C')
      .innerJoin('C.profile', 'P')
      .leftJoinAndSelect('C.categories', 'CTG')
      .where('C.id = :id', { id: courseId })
      .andWhere('P.userId = :userId', { userId })
      .getOne();

    return course;
  }
}
