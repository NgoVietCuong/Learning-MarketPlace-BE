import { I18nService } from 'nestjs-i18n';
import { ConfigType } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as ejs from 'ejs';
import * as nodemailer from 'nodemailer';
import mailConfiguration from 'src/config/mail.config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly trans: I18nService,
    @Inject(mailConfiguration.KEY) private mailConfig: ConfigType<typeof mailConfiguration>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: mailConfig.host,
      port: 465,
      secure: true,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.pass,
      },
    });
  }

  async sendMail(receiver: string, subject: string, templatePath: string, data: { [key: string]: any }) {
    const renderedTemplate = await ejs.renderFile(templatePath, data);
    const mailData = {
      from: this.mailConfig.sender,
      to: receiver,
      subject,
      html: renderedTemplate,
    };
    try {
      await this.transporter.sendMail(mailData);
    } catch (e) {
      this.logger.error(e);
      throw new BadRequestException(this.trans.t('messages.BAD_REQUEST', { args: { action: 'send email' } }));
    }
  }
}
