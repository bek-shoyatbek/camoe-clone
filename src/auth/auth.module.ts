import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma.service';
import { GeneratorsService } from 'src/generators/generators.service';
import { MailService } from 'src/mail/mail.service';
import { FsService } from 'src/fs/fs.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { GoogleAuthService } from './google-auth/google-auth.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '6000s' },
    }),
  ],
  providers: [
    JwtService,
    AuthService,
    UsersService,
    PrismaService,
    GeneratorsService,
    MailService,
    FsService,
    JwtStrategy,
    GoogleAuthService,
  ],
  controllers: [AuthController],
  exports: [PassportModule, JwtStrategy],
})
export class AuthModule {}
