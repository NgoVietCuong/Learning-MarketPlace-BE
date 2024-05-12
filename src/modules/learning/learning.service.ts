import { I18nService } from 'nestjs-i18n';
import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from 'src/entities/enrollment.entity';
import { Course } from 'src/entities/course.entity';
import { Repository } from 'typeorm';
import { EnrollCourseDto } from './dto/enroll.dto';

@Injectable()
export class LearningService extends BaseService {
  constructor(
    private readonly trans: I18nService,
    @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
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
}
