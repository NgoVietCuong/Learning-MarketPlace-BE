import { I18nService } from 'nestjs-i18n';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from 'src/entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource, MoreThan } from 'typeorm';
import { BaseService } from '../base/base.service';
import { Category } from 'src/entities/category.entity';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdatePublishCourseDto } from './dto/update-publish.dto';
import { ListCoursesDto } from './dto/list-courses.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { Section } from 'src/entities/course-section.entity';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class CourseService extends BaseService {
  constructor(
    private dataSource: DataSource,
    private readonly trans: I18nService,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(Section) private readonly sectionRepo: Repository<Section>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(InstructorProfile) private readonly instructorProfileRepo: Repository<InstructorProfile>,
  ) {
    super();
  }

  // Instructor course management
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
    const sections = course.sections;
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.courseRepo.remove(course);
      await queryRunner.manager.remove(sections);
      await queryRunner.commitTransaction();
      return this.responseOk();
    } catch (e) {
      console.log('\nFailed to delete course', e);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(this.trans.t('messages.BAD_REQUEST', { args: { action: 'delete course' } }));
    } finally {
      await queryRunner.release();
    }
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

  async getListCourses(query: ListCoursesDto, userId: number) {
    const { page, limit, search, categoryId } = query;
    const queryBuilder = this.courseRepo
      .createQueryBuilder('C')
      .innerJoin('C.profile', 'P')
      .leftJoinAndSelect('C.categories', 'CTG')
      .where('P.userId = :userId', { userId });
    if (categoryId) queryBuilder.andWhere('CTG.id = :categoryId', { categoryId: categoryId });
    if (search) queryBuilder.andWhere(this.searchCaseInsensitive('C.title'), { keyword: `%${search}%` });
    queryBuilder.orderBy('C.createdAt', 'DESC');
    const courses = await this.customPaginate<Course>(queryBuilder, page, limit);
    return this.responseOk(courses);
  }

  async getCourse(courseId: number, userId: number) {
    const course = await this.courseRepo
      .createQueryBuilder('C')
      .innerJoin('C.profile', 'P')
      .leftJoinAndSelect('C.categories', 'CTG')
      .leftJoinAndSelect('C.sections', 'S')
      .where('C.id = :id', { id: courseId })
      .andWhere('P.userId = :userId', { userId })
      .orderBy('S.sortOrder', 'ASC')
      .getOne();

    return course;
  }

  // Section management
  async createSection(body: CreateSectionDto) {
    const { title, courseId } = body;
    const lastSection = await this.sectionRepo.findOne({ where: { courseId }, order: { sortOrder: 'DESC' } });

    const section = await this.sectionRepo.save({
      title,
      courseId,
      sortOrder: lastSection ? lastSection.sortOrder + 1 : 1,
    });
    return this.responseOk({ id: section.id });
  }

  async updateSection(sectionId: number, body: UpdateSectionDto) {
    const { title } = body;
    const section = await this.sectionRepo.findOneBy({ id: sectionId });
    if (!section) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'Section' } }));
    await this.sectionRepo.update({ id: sectionId }, { title });
    return this.responseOk();
  }

  async deleteSection(sectionId: number) {
    const section = await this.sectionRepo.findOneBy({ id: sectionId });

    if (!section) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'Section' } }));

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const afterSections = await queryRunner.manager.find(Section, {
        where: { courseId: section.courseId, sortOrder: MoreThan(section.sortOrder) },
      });
      afterSections.forEach((section) => {
        section.sortOrder -= 1;
      });

      await queryRunner.manager.remove(section);
      await queryRunner.manager.save(Section, afterSections);
      await queryRunner.commitTransaction();
      return this.responseOk();
    } catch (e) {
      console.log('\nFailed to delete section', e);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(this.trans.t('messages.BAD_REQUEST', { args: { action: 'delete section' } }));
    } finally {
      await queryRunner.release();
    }
  }
}
