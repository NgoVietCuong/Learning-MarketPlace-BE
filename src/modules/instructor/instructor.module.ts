import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { InstructorProfile } from 'src/entities/instructor-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InstructorProfile])],
  controllers: [InstructorController],
  providers: [InstructorService]
})
export class InstructorModule {}
