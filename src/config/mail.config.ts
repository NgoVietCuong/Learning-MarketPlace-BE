import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST,
  sender: process.env.MAIL_SENDER,
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,
}));
