import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { BaseService } from '../base/base.service';
import { PaymentService } from '../payment/services/payment.service';
import { CourseReviewService } from '../course-review/course-review.service';
import { CourseExplorerService } from '../course-explorer/course-explorer.service';
import { Enrollment } from 'src/entities/enrollment.entity';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
import { ChangeInstructorPictureDto } from './dto/change-instructor-picture.dto';
import { ChangeInstructorProfileDto } from './dto/change-instructor-profile.dto';

@Injectable()
export class InstructorService extends BaseService {
  constructor(
    private readonly trans: I18nService,
    private paymentService: PaymentService,
    private courseReviewService: CourseReviewService,
    private courseExplorerService: CourseExplorerService,
    @InjectRepository(Enrollment) private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(InstructorProfile) private instructorProfileRepo: Repository<InstructorProfile>,
  ) {
    super();
  }

  async getInstructorProfile(userId: number) {
    const instructorProfile = await this.instructorProfileRepo.findOneBy({ userId });
    return this.responseOk(instructorProfile);
  }

  async changeInstructorProfile(body: ChangeInstructorProfileDto, userId: number) {
    const profile = await this.instructorProfileRepo.findOneBy({ userId });
    const slug = await this.generateSlug(body.displayName, this.instructorProfileRepo, 'slug', profile.id);
    await this.instructorProfileRepo.update({ userId }, { ...body, slug });
    return this.responseOk();
  }

  async changeInstructorPicture(body: ChangeInstructorPictureDto, userId: number) {
    const { picture } = body;
    await this.instructorProfileRepo.update({ userId }, { picture });
    return this.responseOk();
  }

  async getInstructorInfo(slug: string) {
    const profile = await this.instructorProfileRepo
      .createQueryBuilder('IP')
      .innerJoin('IP.user', 'U')
      .leftJoinAndSelect('IP.courses', 'C')
      .where('IP.slug = :slug', { slug })
      .andWhere('U.isActive = :isActive', { isActive: true })
      .andWhere('C.isPublished = :isPublished', { isPublished: true })
      .getOne();

    if (!profile) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'Instructor' } }));

    const courses = profile.courses;
    const courseIds = courses.map((course) => course.id);

    let totalStudents = 0,
      averageRating = '0.0',
      totalReviews = 0;
    if (courseIds.length) {
      const totalStudents = await this.enrollmentRepo
        .createQueryBuilder('E')
        .leftJoin('E.course', 'C')
        .where('C.id IN (:...courseIds)', { courseIds })
        .getCount();

      const { totalReviews } = await this.courseReviewService.getTotalReviews(courseIds);
      const averageRating = await this.courseReviewService.getAverageRating(courseIds);
      const videoDuration = await this.courseExplorerService.getVideoDuration(courseIds);
      const numberArticles = await this.courseExplorerService.getNumberArticles(courseIds);
      const averageRatingEachCourse = await this.courseReviewService.getMultipleAvarageRatings(courseIds);
      const totalReviewsEachCourse = await this.courseReviewService.getMultipleTotalReviews(courseIds);

      profile.courses.map((course) => {
        let totalVideoDuration = '';
        const courseVideoDuration = videoDuration.find((item) => item.courseId === course.id);

        if (courseVideoDuration && courseVideoDuration.totalSeconds) {
          const hours = Math.floor(parseInt(courseVideoDuration.totalSeconds) / 3600);
          const minutes = Math.ceil((parseInt(courseVideoDuration.totalSeconds) % 3600) / 60);
          totalVideoDuration += hours ? `${hours} hours` : '';
          totalVideoDuration += minutes ? `${minutes} minutes` : '';
        }

        course['totalVideoDuration'] = totalVideoDuration;
        course['totalArticles'] =
          Number(numberArticles.find((item) => item.courseId === course.id)?.totalArticles) || 0;
        course['totalReviews'] =
          Number(totalReviewsEachCourse.find((item) => item.courseId === course.id)?.totalReviews) || 0;
        course['averageRating'] = averageRatingEachCourse.find((item) => item.courseId === course.id)?.rating || '0.0';

        return course;
      });

      return this.responseOk({ ...profile, totalStudents, totalReviews, averageRating: averageRating.rating || '0.0' });
    }

    return this.responseOk({ ...profile, totalStudents, totalReviews, averageRating });
  }

  async getInstructorDashboard(userId: number) {
    const instructorProfile = await this.instructorProfileRepo.findOne({ where: { userId }, relations: ['courses'] });
    if (!instructorProfile)
      throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'Instructor' } }));

    const courseIds = instructorProfile.courses.map((course) => course.id);
    let totalStudents = 0, averageRating = '0.0', totalReviews = 0, totalIncome = 0, paymentList = [], topIncomeCourses = [], incomeEachMonth = [];
    if (courseIds.length) {
      const numberOfPublishedCourses = await this.courseExplorerService.getNumberPublishedCourses(courseIds);
      const numberOfPaidCourses = await this.courseExplorerService.getNumberPaidCourses(courseIds);

      const totalStudents = await this.enrollmentRepo
        .createQueryBuilder('E')
        .leftJoin('E.course', 'C')
        .where('C.id IN (:...courseIds)', { courseIds })
        .getCount();

      const { totalReviews } = await this.courseReviewService.getTotalReviews(courseIds);
      const averageRating = await this.courseReviewService.getAverageRating(courseIds);
      if (instructorProfile.paypalEmail) {
        paymentList = await this.paymentService.getPaymentToInstructor(instructorProfile.paypalEmail);
        totalIncome = await this.paymentService.getInstructorTotalIncome(instructorProfile.paypalEmail);
        incomeEachMonth = await this.paymentService.getInstructorIncomeEachMonth(instructorProfile.paypalEmail);
        topIncomeCourses = await this.paymentService.getTopIncomeCourse(instructorProfile.paypalEmail);
      }

      return this.responseOk({
        totalStudents,
        totalReviews,
        averageRating: averageRating.rating || '0.0',
        totalIncome,
        totalCourses: courseIds.length,
        numberOfPaidCourses,
        numberOfPublishedCourses,
        paymentList,
        incomeEachMonth,
        topIncomeCourses
      });
    }

    return this.responseOk({
      totalStudents,
      totalReviews,
      averageRating,
      totalIncome,
      totalCourses: 0,
      numberOfPaidCourses: 0,
      numberOfPublishedCourses: 0,
      paymentList,
      incomeEachMonth,
      topIncomeCourses
    });
  }
}
