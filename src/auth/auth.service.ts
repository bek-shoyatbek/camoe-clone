import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { Cache } from 'cache-manager';
import { GeneratorsService } from 'src/generators/generators.service';
import { CacheUser } from 'src/interfaces/cache-user.interface';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private generator: GeneratorsService,
    private mailService: MailService,
  ) {}

  async signUp(userData: Prisma.UserCreateInput): Promise<string> {
    const sessionId = this.generator.getUUID();
    const confirmationCode = this.generator.getNumber();

    const emailExists = await this.prisma.user.findFirst({
      where: { email: userData.email },
    });

    if (emailExists) {
      throw new BadRequestException('Email already in use');
    }

    const cachedUser = { userData, confirmationCode };
    await this.cacheManager.set(sessionId, cachedUser);
    const email = {
      to: userData.email,
      subject: 'Cameo - Email Confirmation',
      html: this.generator.getConfirmationMessage(
        userData.email,
        confirmationCode,
      ),
    };

    await this.mailService.sendConfirmationCode(email);

    return sessionId;
  }

  async signIn(loginDto: LoginDto) {
    const user = await this.userService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new BadRequestException('Invalid  password or email');
    }
    const isValidPassword = user.password === loginDto.password;
    if (!isValidPassword) {
      throw new BadRequestException('Invalid  password or email');
    }
    const jwtPayload: JwtPayload = {
      userId: user.id,
      role: user.role,
    };
    const accessToken = this.createAccessToken(jwtPayload);
    const refreshToken = this.createRefreshToken(jwtPayload);

    await this.cacheManager.set(
      `refreshToken_${user.id}`,
      refreshToken,
      1209600, // 14 days in seconds
    );

    return { accessToken, refreshToken };
  }

  async confirmEmailAndCreate(
    sessionId: string,
    confirmationCode: number,
  ): Promise<User> {
    const cachedUser: CacheUser = await this.cacheManager.get(sessionId);
    if (!cachedUser || cachedUser?.confirmationCode !== +confirmationCode) {
      throw new HttpException(
        'Invalid code or sessionId',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.prisma.user.create({ data: cachedUser.userData });

    return user;
  }

  createAccessToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
  }

  createRefreshToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
  }

  async validateUser(userId: string): Promise<boolean> {
    const user = await this.userService.findOneById(userId);

    return user ? true : false;
  }

  private authenticateRequest(request: any): Observable<any> {
    // Implement Passport authentication logic here
    // This might involve using Passport's authenticate method
    // and returning the authenticated user object
    return new Observable((subscriber) => subscriber.next(undefined)); // Placeholder
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const accessToken = this.createAccessToken(payload as JwtPayload);
      return accessToken;
    } catch (error) {
      console.log('Error', error);
      throw new BadRequestException('Invalid refresh token');
    }
  }
}
