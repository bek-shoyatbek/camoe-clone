import { Prisma } from '@prisma/client';

export interface CacheUser {
  userData: Prisma.UserCreateInput;
  confirmationCode: number;
}
