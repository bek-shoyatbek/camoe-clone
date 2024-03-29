import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GeneratorsService {
  getNumber() {
    return Math.floor(10000 + Math.random() * 90000);
  }
  getUUID() {
    return uuid();
  }
  getConfirmationMessage(email: string, code: number) {
    return `<p>Hey ${email},</p>
    <p>Please enter below confirmation code to confirm your email.</p>
    <p>
        Code : ${code}
    </p>
    
    <p>If you did not request this email you can safely ignore it.</p>`;
  }
}
