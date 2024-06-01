import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../base/base.service';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
import { ChangeInstructorPictureDto } from './dto/change-instructor-picture.dto';
import { ChangeInstructorProfileDto } from './dto/change-instructor-profile.dto';
import { Enrollment } from 'src/entities/enrollment.entity';
import { CourseReviewService } from '../course-review/course-review.service';

@Injectable()
export class InstructorService extends BaseService {
  constructor(
    private courseReviewService: CourseReviewService,
    @InjectRepository(InstructorProfile) private instructorProfileRepo: Repository<InstructorProfile>,
    @InjectRepository(Enrollment) private enrollmentRepo: Repository<Enrollment>,
  ) {
    super();
  }

  async getInstructorProfile(userId: number) {
    const instructorProfile = await this.instructorProfileRepo.findOneBy({ userId });
    return this.responseOk(instructorProfile);
  }

  async changeInstructorProfile(body: ChangeInstructorProfileDto, userId: number) {
    const slug = await this.generateSlug(body.displayName, this.instructorProfileRepo, 'slug');
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

    const courses = profile.courses;
    const courseIds = courses.map((c) => c.id);

    const totalStudents = await this.enrollmentRepo
      .createQueryBuilder('E')
      .leftJoin('E.course', 'C')
      .where('C.id IN (:...courseIds)', { courseIds })
      .getCount();
    const totalReviews = await this.courseReviewService.getTotalReviews(courseIds);
    const averageRating = await this.courseReviewService.getAverageRating(courseIds);
    return this.responseOk({ profile, totalStudents, totalReviews, averageRating: averageRating.rating });
  }
}
