import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Review } from 'src/entities/review.entity';
import { BaseService } from '../base/base.service';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from 'src/entities/enrollment.entity';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class CourseReviewService extends BaseService {
  constructor(
    private readonly trans: I18nService,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
  ) {
    super();
  }

  async createReview(body: CreateReviewDto) {
    const { enrollmentId, rating, comment } = body;
    const review = await this.reviewRepo.findOneBy({ enrollmentId });
    if (review) throw new BadRequestException(this.trans.t('messages.EXIST', { args: { object: 'Review' } }));
    await this.reviewRepo.save({
      enrollmentId,
      rating,
      comment,
    });
    return this.responseOk();
  }

  async updateReview(body: UpdateReviewDto, reviewId: number) {
    const review = await this.reviewRepo.findOneBy({ id: reviewId });
    if (!review) throw new NotFoundException(this.trans.t('messages.NOT_FOUND', { args: { object: 'Review' } }));
    await this.reviewRepo.update({ id: reviewId }, { ...body });
    return this.responseOk();
  }
}
