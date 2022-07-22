import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import configuration from '../config/configuration';

import { AppController } from './app.controller';

import { loggerConfig, ormConfig } from './config';


@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    LoggerModule.forRoot(loggerConfig),
    TypeOrmModule.forRoot(ormConfig),
    TerminusModule,
    HttpModule
  ],
  controllers: [AppController],
})
export class AppModule {}
