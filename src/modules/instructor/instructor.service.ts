import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../base/base.service';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';
import { ChangeInstructorPictureDto } from './dto/change-instructor-picture.dto';
import { ChangeInstructorProfileDto } from './dto/change-instructor-profile.dto';

@Injectable()
export class InstructorService extends BaseService {
  constructor(@InjectRepository(InstructorProfile) private instructorProfileRepo: Repository<InstructorProfile>,) {
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
      .where('IP.slug = :slug', { slug })
      .andWhere('U.isActive = :isActive', { isActive: true })
      .getOne();
    return this.responseOk(profile);
  }
}
