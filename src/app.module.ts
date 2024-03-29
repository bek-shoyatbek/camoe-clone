import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { GeneratorsModule } from './generators/generators.module';
import * as redisStore from 'cache-manager-redis-store';

import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MailService } from './mail/mail.service';
import { GeneratorsService } from './generators/generators.service';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { config } from './config/config';
import { FsService } from './fs/fs.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    MailModule,
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      url: process.env.REDIS_URL,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    GeneratorsModule,

    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService, GeneratorsService, FsService],
})
export class AppModule {}
