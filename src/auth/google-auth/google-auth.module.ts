import { Module } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma.service';
import { FsService } from 'src/fs/fs.service';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UsersModule, ConfigModule],
  controllers: [],
  providers: [GoogleAuthService, UsersService, PrismaService, FsService],
  exports: [GoogleAuthService],
})
export class GoogleAuthModule {}
