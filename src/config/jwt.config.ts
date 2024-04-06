import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  algorithm: process.env.JWT_ALGORITHM
}));
