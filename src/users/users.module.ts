import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { GeneratorsService } from 'src/generators/generators.service';
import { MailService } from 'src/mail/mail.service';
import { AuthService } from 'src/auth/auth.service';
import { FsService } from 'src/fs/fs.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './uploads',
      }),
    }),
    ConfigModule,
  ],
  controllers: [UsersController],
  providers: [
    JwtModule,
    UsersService,
    PrismaService,
    GeneratorsService,
    MailService,
    AuthService,
    FsService,
    AuthGuard,
    JwtService,
  ],
})
export class UsersModule {}
