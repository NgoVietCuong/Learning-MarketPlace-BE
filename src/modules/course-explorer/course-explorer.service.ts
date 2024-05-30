import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
import { Enrollment } from 'src/entities/enrollment.entity';

@Injectable()
export class CourseExplorerService extends BaseService {
  constructor(
    private readonly trans: I18nService,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(InstructorProfile) private instructorProfileRepo: Repository<InstructorProfile>,
    @InjectRepository(Enrollment) private enrollmentRepo: Repository<Enrollment>,
  ) {
    super();
  }

  async getCourse(userId: number, slug: string) {
    // const course = await this.courseRepo.findOneBy({ slug });
    // if (!course) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'Course' } }));

    // const instructor = await this.instructorProfileRepo
    //   .createQueryBuilder('I')
    //   .innerJoin('I.courses', 'C')
    //   .where('C.id = :id', { id: course.id })
    //   .getOne();

    // const totalStudent = await this.courseRepo
    //   .createQueryBuilder('C')
    //   .leftJoin('C.enrollments', 'E')
    //   .where('C.id = :id', { id: course.id });

    // const course = await this.courseRepo
    //   .createQueryBuilder('C')
    //   .innerJoin('C.profile', 'P')
    //   .leftJoin('C.enrollments', 'E')
    //   .where('C.slug = :slug', { slug })
    //   .groupBy('P.id')
    //   .addGroupBy('C.id')
    //   .select(['C', 'P'])
    //   .addSelect('COUNT(E.id)', 'test')
    //   .getRawOne();

    const queryBuilder = this.courseRepo
    .createQueryBuilder('C')
    .innerJoin('C.profile', 'P')
    .andWhere('C.slug = :slug', { slug })
    .where('C.isPublished = :isPublished', { isPublished: true })
    .select(["C", "P"])
    const course = await queryBuilder.getOne();

    console.log(course);
  }
}
