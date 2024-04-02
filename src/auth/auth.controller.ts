import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Request, Response } from 'express';
import { Cache } from 'cache-manager';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post('email/sign-up')
  async signUp(@Body() createUserDto: Prisma.UserCreateInput) {
    const sessionId = await this.authService.signUpWithEmail(createUserDto);
    return { sessionId: sessionId };
  }

  @Post('email/sign-in')
  async signIn(@Body() loginDto: LoginDto) {
    if (!loginDto.email || !loginDto.password) throw new BadRequestException();
    // Get the user by email and password
    const tokens = await this.authService.signIn(loginDto);

    return tokens;
  }

  @Post('email/confirm')
  async confirmEmailAndCreate(
    @Body('sessionId') sessionId: string,
    @Body('confirmationCode') confirmationCode: number,
    @Res() res: Response,
  ) {
    if (!sessionId || !confirmationCode) {
      throw new BadRequestException('Missing sessionId or confirmationCode');
    }
    const user = await this.authService.confirmEmailAndCreate(
      sessionId,
      confirmationCode,
    );
    const jwtPayload = {
      userId: user.id,
      role: user.role,
    } as JwtPayload;

    const accessToken = this.authService.createAccessToken(jwtPayload);

    const refreshToken = this.authService.createRefreshToken(jwtPayload);

    await this.cacheManager.set(
      `refreshToken_${user.id}`,
      refreshToken,
      1209600, // 14 days in seconds
    );

    res.send({ accessToken, refreshToken });
    return;
  }

  @Post('google/sign-in')
  async signInWithGoogle(@Body() signInWithGoogleDto: Prisma.UserCreateInput) {
    const tokens = await this.authService.signInWithGoogle(signInWithGoogleDto);
    return tokens;
  }

  @Post('refresh')
  async refreshToken(@Body('refresh') refreshToken: string) {
    if (!refreshToken) throw new HttpException('No token provided', 400);

    const accessToken = await this.authService.refreshToken(refreshToken);

    return { accessToken: accessToken };
  }

  @UseGuards(AuthGuard)
  @Get('logout')
  async logout(@Req() req: Request) {
    const user = req.user;

    return await this.authService.logout((user as any)?.userId);
  }

  @UseGuards(AuthGuard)
  @Post('remove')
  async remove(@Req() req: Request) {
    const user = req.user;
    const userId = (user as any).userId;
    return await this.authService.deleteUserProfile(userId);
  }
}
