import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import mailConfiguration from 'src/config/mail.config';

@Module({
  imports: [ConfigModule.forFeature(mailConfiguration)],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
