import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { BaseService } from '../base/base.service';
import { CourseReviewService } from '../course-review/course-review.service';
import { Course } from 'src/entities/course.entity';
import { Repository } from 'typeorm';
import { Enrollment } from 'src/entities/enrollment.entity';
import { LessonContentType } from 'src/app/enums/common.enum';

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

    const videoDuration = await this.courseRepo
      .createQueryBuilder('C')
      .leftJoin('C.sections', 'S')
      .leftJoin('S.lessons', 'L', 'L.isPublished = :isPublished', { isPublished: true })
      .where('C.slug = :slug', { slug })
      .andWhere('C.isPublished = :isPublished', { isPublished: true })
      .select('SUM(COALESCE(L.duration, 0))', 'totalSeconds')
      .getRawOne();

    const lessonArticles = await this.courseRepo
      .createQueryBuilder('C')
      .leftJoin('C.sections', 'S')
      .leftJoin('S.lessons', 'L', 'L.isPublished = :isPublished', { isPublished: true })
      .where('C.slug = :slug', { slug })
      .andWhere('C.isPublished = :isPublished', { isPublished: true })
      .andWhere('L.contentType IN (:...contentTypes)', { contentTypes: [LessonContentType.DOCUMENT, LessonContentType.TEXT]})
      .select('COUNT(L.id)', 'totalArticles')
      .getRawOne();

    const totalStudents = await this.enrollmentRepo.countBy({ courseId: course.id });
    const { totalReviews, numberEachRatings } = await this.courseReviewService.getTotalReviews([course.id]);
    const averageRating = await this.courseReviewService.getAverageRating([course.id]);

    let hasEnrolled = false;
    if (userId) {
      const enrollment = await this.enrollmentRepo.findOneBy({ userId, courseId: course.id });
      hasEnrolled = !!enrollment;
    }

    let totalVideoDuration = '';
    if (videoDuration && videoDuration.totalSeconds) {
      const hours = Math.floor(parseInt(videoDuration.totalSeconds) / 3600);
      const minutes = Math.ceil((parseInt(videoDuration.totalSeconds) % 3600) / 60);
      totalVideoDuration += hours ? `${hours} hours`: '';
      totalVideoDuration += minutes ? `${minutes} minutes` : '';
    }

    return this.responseOk({
      ...course,
      hasEnrolled,
      totalStudents,
      totalReviews,
      totalVideoDuration,
      totalArticles: lessonArticles ? lessonArticles.totalArticles : 0,
      numberEachRatings,
      averageRating: averageRating.rating,
    });
  }
}
