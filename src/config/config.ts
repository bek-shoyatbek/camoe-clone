import { ConfigProps } from 'src/interfaces/config.interface';

export const config = (): ConfigProps => ({
  port: parseInt(process.env.PORT),
  jwtSecret: process.env.JWT_SECRET,
  redisURL: process.env.REDIS_URL,
});
