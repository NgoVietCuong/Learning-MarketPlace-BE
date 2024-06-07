import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { BaseService } from '../base/base.service';
import { CourseReviewService } from '../course-review/course-review.service';
import { Course } from 'src/entities/course.entity';
import { Repository } from 'typeorm';
import { Enrollment } from 'src/entities/enrollment.entity';
import { SearchCourseDto } from './dto/search-course.dto';

@Injectable()
export class CourseExplorerService extends BaseService {
  constructor(
    private readonly trans: I18nService,
    private courseReviewService: CourseReviewService,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(Enrollment) private enrollmentRepo: Repository<Enrollment>,
  ) {
    super();
  }

  async getCourse(userId: number, slug: string) {
    const queryBuilder = this.courseRepo
      .createQueryBuilder('C')
      .innerJoin('C.profile', 'P')
      .leftJoin('C.sections', 'S')
      .leftJoin('S.lessons', 'L', 'L.isPublished = :isPublished', { isPublished: true })
      .where('C.slug = :slug', { slug })
      .andWhere('C.isPublished = :isPublished', { isPublished: true })
      .orderBy('S.sortOrder', 'ASC')
      .addOrderBy('L.sortOrder', 'ASC')
      .select(['C', 'P', 'S', 'L.id', 'L.title', 'L.contentType', 'L.duration']);

    const course = await queryBuilder.getOne();
    if (!course) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'Course' } }));

    const totalStudents = await this.enrollmentRepo.countBy({ courseId: course.id });
    const totalReviews = await this.courseReviewService.getTotalReviews([course.id]);
    const averageRating = await this.courseReviewService.getAverageRating([course.id]);

    let hasEnrolled = false;
    if (userId) {
      const enrollment = await this.enrollmentRepo.findOneBy({ userId, courseId: course.id });
      hasEnrolled = !!enrollment;
    }

    return this.responseOk({
      ...course,
      hasEnrolled,
      totalStudents,
      totalReviews,
      averageRating: averageRating.rating,
    });
  }

  async searchCourse(query: SearchCourseDto) {
    const { page, limit, search, categoryId, level, price } = query;
    const queryBuilder = this.courseRepo
      .createQueryBuilder('C')
      .where('C.isPublished = :isPublished', { isPublished: true });
    if (categoryId) queryBuilder.leftJoin('C.categories', 'CTG').andWhere('CTG.id = :id', { id: categoryId });
    if (level) queryBuilder.andWhere('C.level = :level', { level });
    if (price === 'Free') queryBuilder.andWhere('C.price = :price', { price: 0 });
    if (price === 'Paid') queryBuilder.andWhere('C.price > :price', { price: 0 });
    if (search) queryBuilder.andWhere(this.searchCaseInsensitive('C.title'), { keyword: `%${search}%` });
    queryBuilder.orderBy('C.updatedAt', 'DESC');
    const courses = await this.customPaginate<Course>(queryBuilder, page, limit);
    return this.responseOk(courses);
  }
}
