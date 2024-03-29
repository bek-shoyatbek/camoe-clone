import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Response } from 'express';
import { Cache } from 'cache-manager';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post('sign-up')
  async signUp(@Body() createUserDto: Prisma.UserCreateInput) {
    const sessionId = await this.authService.signUp(createUserDto);
    return { sessionId: sessionId };
  }

  @Post('sign-in')
  async signIn(@Body() loginDto: LoginDto) {
    if (!loginDto.email || !loginDto.password) throw new BadRequestException();
    // Get the user by email and password
    const tokens = await this.authService.signIn(loginDto);

    return tokens;
  }

  @Post('confirm-email')
  async confirmEmailAndCreate(
    @Body('sessionId') sessionId: string,
    @Body('confirmationCode') confirmationCode: number,
    @Res() res: Response,
  ) {
    if (!sessionId || !confirmationCode) {
      throw new Error('Missing sessionId or confirmationCode');
    }
    const user = await this.authService.confirmEmailAndCreate(
      sessionId,
      confirmationCode,
    );
    const jwtPayload = {
      userId: user.id,
      role: user.role,
    } as JwtPayload;

    const accessToken = await this.authService.createAccessToken(jwtPayload);

    const refreshToken = await this.authService.createRefreshToken(jwtPayload);

    await this.cacheManager.set(
      `refreshToken_${user.id}`,
      refreshToken,
      1209600, // 14 days in seconds
    );

    res.send({ accessToken, refreshToken });
    return;
  }

  @Post('refresh')
  async refreshToken(@Body('refresh') refreshToken: string) {
    if (!refreshToken) throw new HttpException('No token provided', 400);

    const accessToken = await this.authService.refreshToken(refreshToken);

    return { accessToken: accessToken };
  }
}
