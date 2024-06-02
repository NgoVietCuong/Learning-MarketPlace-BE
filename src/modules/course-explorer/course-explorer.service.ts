import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { BaseService } from '../base/base.service';
import { CourseReviewService } from '../course-review/course-review.service';
import { Course } from 'src/entities/course.entity';
import { Repository } from 'typeorm';
import { Enrollment } from 'src/entities/enrollment.entity';

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
      .leftJoin('S.lessons', 'L')
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
}
