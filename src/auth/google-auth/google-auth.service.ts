import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GoogleAuthService {
  constructor(private usersService: UsersService) {}

  async signIn(signInDto: Prisma.UserCreateInput) {
    try {
      const user = await this.usersService.findOneByGoogleId(
        signInDto.googleId,
      );

      if (user) {
        return user;
      } else {
        const newUser = await this.usersService.create(signInDto);
        return newUser;
      }
    } catch (error) {
      console.error('Error verifying Google token:', error);
      throw new BadRequestException('Invalid Google token');
    }
  }
}
