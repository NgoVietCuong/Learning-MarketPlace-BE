import { I18nService } from 'nestjs-i18n';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from 'src/entities/enrollment.entity';
import { DataSource, Repository } from 'typeorm';
import { EnrollCourseDto } from './dto/enroll.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { LessonProgress } from 'src/entities/lesson-progress.entity';
import { Lesson } from 'src/entities/lesson.entity';
import { LessonContentType } from 'src/app/enums/common.enum';
import { Course } from 'src/entities/course.entity';
import { Section } from 'src/entities/section.entity';

@Injectable()
export class LearningService extends BaseService {
  constructor(
    private dataSource: DataSource,
    private readonly trans: I18nService,
    @InjectRepository(Enrollment) private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Lesson) private lessonRepo: Repository<Lesson>,
    @InjectRepository(LessonProgress) private lessonProgressRepo: Repository<LessonProgress>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(Section) private sectionRepo: Repository<Section>,
  ) {
    super();
  }

  async enrollCourse(body: EnrollCourseDto, userId: number) {
    const { courseId } = body;
    const enrollment = await this.enrollmentRepo.findOneBy({ courseId, userId });
    if (enrollment) throw new BadRequestException(this.trans.t('messages.EXIST', { args: { object: 'Enrollment' } }));
    await this.enrollmentRepo.save({
      courseId,
      userId,
    });
    return this.responseOk();
  }

  async getMyCourseList(userId: number) {
    const myCourses = await this.enrollmentRepo
      .createQueryBuilder('E')
      .leftJoin('E.course', 'C')
      .leftJoin('E.review', 'R')
      .leftJoin('C.profile', 'P')
      .where('E.userId = :userId', { userId })
      .orderBy('E.updatedAt', 'DESC')
      .select(['E', 'C', 'P.displayName', 'R'])
      .getMany();

    const inProgressCourses = myCourses.filter((course) => course.progressStatus < 100);
    const completedCourses = myCourses.filter((course) => course.progressStatus === 100);

    return this.responseOk({ inProgressCourses, completedCourses });
  }

  async updateProgress(body: UpdateProgressDto) {
    const { enrollmentId, lessonId, contentProgress } = body;
    let lessonProgress = await this.lessonProgressRepo.findOneBy({ enrollmentId, lessonId });
    const totalLessons = await this.lessonRepo
      .createQueryBuilder('L')
      .innerJoin('L.section', 'S')
      .innerJoin('S.course', 'C')
      .innerJoin('C.enrollments', 'E')
      .where('E.id = :id', { id: enrollmentId })
      .andWhere('L.isPublished = :isPublished', { isPublished: true })
      .getCount();

    let isCompleted = false;
    if (contentProgress > 80) isCompleted = true;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (!lessonProgress) {
        await queryRunner.manager.save(LessonProgress, { enrollmentId, lessonId, contentProgress, isCompleted });
      } else {
        lessonProgress = Object.assign(lessonProgress, {
          contentProgress,
          isCompleted: lessonProgress.isCompleted ? lessonProgress.isCompleted : isCompleted,
        });
        await queryRunner.manager.save(LessonProgress, lessonProgress);
      }

      const totalCompletedLessons = await queryRunner.manager.findAndCount(LessonProgress, {
        where: { enrollmentId, isCompleted: true },
      });
      const [data, completedLessons] = totalCompletedLessons;
      const progressStatus = Math.round((completedLessons / totalLessons) * 100);
      await queryRunner.manager.update(Enrollment, { id: enrollmentId }, { progressStatus });

      await queryRunner.commitTransaction();
      return this.responseOk();
    } catch (e) {
      console.log('\nFailed to update progress', e);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(this.trans.t('messages.BAD_REQUEST', { args: { action: 'update progress' } }));
    } finally {
      await queryRunner.release();
    }
  }

  async getLessonProgress(lessonId: number, userId: number) {
    const lessonProgress = await this.lessonRepo
      .createQueryBuilder('L')
      .leftJoin('L.lessonProgress', 'LP')
      .leftJoin('LP.enrollment', 'E', 'E.userId = :userId', { userId })
      .where('L.id = :lessonId', { lessonId })
      .andWhere('L.isPublished = :isPublished', { isPublished: true })
      .select(['L', 'LP'])
      .getOne();

    return this.responseOk(lessonProgress);
  }

  async getCourseProgress(slug: string, userId: number) {
    const enrollment = await this.enrollmentRepo
      .createQueryBuilder('E')
      .innerJoin('E.course', 'C')
      .leftJoin('C.sections', 'S')
      .leftJoin('S.lessons', 'L')
      .leftJoin('L.lessonProgress', 'LP')
      .leftJoin('E.review', 'R')
      .where('C.slug = :slug', { slug })
      .andWhere('E.userId = :userId', { userId })
      .andWhere('C.isPublished = :isPublished', { isPublished: true })
      .andWhere('L.isPublished = :isPublished', { isPublished: true })
      .orderBy('S.sortOrder', 'ASC')
      .addOrderBy('L.sortOrder', 'ASC')
      .select(['E', 'C', 'S', 'L', 'LP', 'R'])
      .getOne();

    if (!enrollment)
      throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'Enrollment' } }));

    return this.responseOk(enrollment);
  }
}
