import { registerAs } from '@nestjs/config';

export default registerAs('google', () => ({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
}));
