import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

import { AuthGuard } from 'src/auth/auth.guard';
import { storage } from 'src/config/storage.config';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Post('profile-content')
  @UseInterceptors(FileInterceptor('video', { storage: storage }))
  async addProfileContent(
    @Req() req: Request,
    @Body() profileContent: Partial<Prisma.ProfileContentCreateInput>,
    @UploadedFile() video: Express.Multer.File,
  ) {
    const userId = (req.user as any)?.userId;

    profileContent.video = video.filename;

    profileContent.user = userId;

    return this.usersService.addProfileContent(
      userId,
      profileContent as Prisma.ProfileContentCreateInput,
    );
  }
  @Get('celebrities')
  async findAll() {
    const celebritiesWithTheirProfileContent =
      await this.usersService.findAllCelebrities();
    return celebritiesWithTheirProfileContent;
  }

  @Get('single/:id')
  async findOne(@Param('id') userId: string) {
    const user = await this.usersService.findOneById(userId);

    const userWithoutSensitiveData = this.usersService.exclude(
      user,
      'password',
      'refreshToken',
      'createdAt',
    );

    return userWithoutSensitiveData;
  }

  @UseGuards(AuthGuard)
  @Patch('update')
  @UseInterceptors(FileInterceptor('avatar', { storage: storage }))
  update(
    @Body() updateUserDto: Prisma.UserUpdateInput,
    @UploadedFile() avatar: Express.Multer.File,
    @Req() req: Request,
  ) {
    console.log('Avatar ', avatar);
    if (avatar) updateUserDto.avatar = avatar.filename;

    const userId = (req.user as any).userId;
    return this.usersService.updateProfile(userId, updateUserDto);
  }
}
