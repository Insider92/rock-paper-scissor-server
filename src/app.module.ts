import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from 'nestjs-pino';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';

import { loggerConfig, ormConfig } from './config';
import { UserModule } from './module/user/user.module';
import { AuthModule } from './module/auth/auth.module';
import { MatchModule } from './module/match/match.module';
import { ChoiceModule } from './module/choice/choice.module';

@Module({
  imports: [
    LoggerModule.forRoot(loggerConfig),
    TypeOrmModule.forRoot(ormConfig),
    TerminusModule,
    HttpModule,
    UserModule,
    AuthModule,
    MatchModule,
    ChoiceModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
