import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { BaseService } from '../base/base.service';
import { CourseReviewService } from '../course-review/course-review.service';
import { Lesson } from 'src/entities/lesson.entity';
import { Course } from 'src/entities/course.entity';
import { Repository } from 'typeorm';
import { Enrollment } from 'src/entities/enrollment.entity';
import { LessonContentType } from 'src/app/enums/common.enum';
import { SearchCourseDto } from './dto/search-course.dto';

@Injectable()
export class CourseExplorerService extends BaseService {
  constructor(
    private readonly trans: I18nService,
    private courseReviewService: CourseReviewService,
    @InjectRepository(Lesson) private lessonRepo: Repository<Lesson>,
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

    let currentLesson = await this.lessonRepo
      .createQueryBuilder('L')
      .leftJoin('L.lessonProgress', 'LP')
      .leftJoin('LP.enrollment', 'E')
      .where('E.courseId = :courseId AND E.userId = :userId', { courseId: course.id, userId })
      .andWhere('L.isPublished = :isPublished', { isPublished: true })
      .orderBy('LP.updatedAt', 'DESC')
      .select(['L.id'])
      .getOne();

    if (!currentLesson) {
      currentLesson = await this.lessonRepo
        .createQueryBuilder('L')
        .leftJoin('L.section', 'S')
        .leftJoin('S.course', 'C')
        .where('C.id = :courseId', { courseId: course.id })
        .andWhere('L.isPublished = :isPublished', { isPublished: true })
        .orderBy('S.sortOrder', 'ASC')
        .addOrderBy('L.sortOrder', 'ASC')
        .select(['L.id'])
        .getOne();
    }

    const totalStudents = await this.enrollmentRepo.countBy({ courseId: course.id });
    const { totalReviews, numberEachRatings } = await this.courseReviewService.getTotalReviews([course.id]);
    const averageRating = await this.courseReviewService.getAverageRating([course.id]);

    let hasEnrolled = false;
    if (userId) {
      const enrollment = await this.enrollmentRepo.findOneBy({ userId, courseId: course.id });
      hasEnrolled = !!enrollment;
    }

    const videoDuration = await this.getVideoDuration([course.id]);
    const numberArticles = await this.getNumberArticles([course.id]);

    let totalVideoDuration = '';
    if (videoDuration.length && videoDuration[0].totalSeconds) {
      const hours = Math.floor(parseInt(videoDuration[0].totalSeconds) / 3600);
      const minutes = Math.ceil((parseInt(videoDuration[0].totalSeconds) % 3600) / 60);
      totalVideoDuration += hours ? `${hours} hours` : '';
      totalVideoDuration += minutes ? `${minutes} minutes` : '';
    }

    return this.responseOk({
      ...course,
      hasEnrolled,
      totalStudents,
      totalReviews,
      totalVideoDuration,
      totalArticles: numberArticles.length ? Number(numberArticles[0].totalArticles) : 0,
      numberEachRatings,
      averageRating: Number(averageRating.rating) || 0,
      currentLesson,
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

    if (courses.items.length) {
      const courseIds = courses.items.map((course) => course.id);
      const videoDuration = await this.getVideoDuration(courseIds);
      const numberArticles = await this.getNumberArticles(courseIds);
      const totalReviewsEachCourse = await this.courseReviewService.getMultipleTotalReviews(courseIds);
      const averageRatingEachCourse = await this.courseReviewService.getMultipleAvarageRatings(courseIds);

      courses.items.map((course) => {
        let totalVideoDuration = '';
        const courseVideoDuration = videoDuration.find((item) => item.courseId === course.id);

        if (courseVideoDuration && courseVideoDuration.totalSeconds) {
          const hours = Math.floor(parseInt(courseVideoDuration.totalSeconds) / 3600);
          const minutes = Math.ceil((parseInt(courseVideoDuration.totalSeconds) % 3600) / 60);
          totalVideoDuration += hours ? `${hours} hours` : '';
          totalVideoDuration += minutes ? `${minutes} minutes` : '';
        }

        course['totalVideoDuration'] = totalVideoDuration;
        course['totalArticles'] = Number(numberArticles.find((item) => item.courseId === course.id)?.totalArticles) || 0;
        course['averageRating'] = Number(averageRatingEachCourse.find((item) => item.courseId === course.id)?.rating) || 0;
        course['totalReviews'] = Number(totalReviewsEachCourse.find((item) => item.courseId === course.id)?.totalReviews) || 0;

        return course;
      })
    }

    return this.responseOk(courses);
  }

  async getVideoDuration(courseIds: number[]) {
    const videoDuration = await this.courseRepo
      .createQueryBuilder('C')
      .leftJoin('C.sections', 'S')
      .leftJoin('S.lessons', 'L', 'L.isPublished = :isPublished', { isPublished: true })
      .where('C.id IN (:...courseIds)', { courseIds })
      .andWhere('C.isPublished = :isPublished', { isPublished: true })
      .groupBy('C.id')
      .select('C.id', 'courseId')
      .addSelect('SUM(COALESCE(L.duration, 0))', 'totalSeconds')
      .getRawMany();

    return videoDuration;
  }

  async getNumberArticles(courseIds: number[]) {
    const numberArticles = await this.courseRepo
      .createQueryBuilder('C')
      .leftJoin('C.sections', 'S')
      .leftJoin('S.lessons', 'L', 'L.isPublished = :isPublished', { isPublished: true })
      .where('C.id IN (:...courseIds)', { courseIds })
      .andWhere('C.isPublished = :isPublished', { isPublished: true })
      .andWhere('L.contentType IN (:...contentTypes)', { contentTypes: [LessonContentType.DOCUMENT] })
      .groupBy('C.id')
      .select('C.id', 'courseId')
      .addSelect('COUNT(L.id)', 'totalArticles')
      .getRawMany();
    
    return numberArticles;
  }
}
