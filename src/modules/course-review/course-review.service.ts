import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Review } from 'src/entities/review.entity';
import { BaseService } from '../base/base.service';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ListReviewsDto } from './dto/get-list-reviews.dto';
import { Course } from 'src/entities/course.entity';

@Injectable()
export class CourseReviewService extends BaseService {
  constructor(
    private readonly trans: I18nService,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
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

  async getListReviews(query: ListReviewsDto) {
    const { page, limit, slug, rating } = query;
    const queryBuilder = this.reviewRepo
      .createQueryBuilder('R')
      .innerJoin('R.enrollment', 'E')
      .innerJoin('E.user', 'U')
      .innerJoin('E.course', 'C')
      .where('C.slug = :slug', { slug })
      .select(['R', 'E.id', 'U.username', 'U.avatar']);

    if (rating) queryBuilder.andWhere('R.rating = :rating', { rating });
    queryBuilder.orderBy('R.updatedAt', 'DESC');
    const reviews = await this.customPaginate<Review>(queryBuilder, page, limit);
    return this.responseOk(reviews);
  }

  async getAverageRating(courseIds: number[]) {
    const averageRating = await this.reviewRepo
      .createQueryBuilder('R')
      .innerJoin('R.enrollment', 'E')
      .innerJoin('E.course', 'C')
      .where('C.id IN (:...courseIds)', { courseIds })
      .select(
        `case
          when COUNT(R.id) = 0 then 0
          else ROUND((CAST(SUM(R.rating) AS FLOAT) / CAST(COUNT(R.id) AS FLOAT))::numeric, 1)
        end`,
        'rating'
      )
      .getRawOne();
    
    return averageRating;
  }

  async getTotalReviews(courseIds: number[]) {
    const totalRatings = await this.reviewRepo
      .createQueryBuilder('R')
      .innerJoin('R.enrollment', 'E')
      .innerJoin('E.course', 'C')
      .where('C.id IN (:...courseIds)', { courseIds })
      .getCount();

    return totalRatings;
  }
}
