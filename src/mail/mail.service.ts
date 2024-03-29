import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { Email } from './entities/email.entity';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendConfirmationCode(email: Email) {
    const sentEmailResult = await this.mailerService.sendMail({
      to: email.to,
      subject: email.subject,
      html: email.html,
    });
    console.log('sentEmailResult', sentEmailResult);
    return sentEmailResult;
  }
}
