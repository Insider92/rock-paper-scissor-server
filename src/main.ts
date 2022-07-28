import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as config from 'config';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { initChoices } from './helper/initData';
import { EntityManager } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { serverPort, serverPrefix, nodeEnv } = config.get('server');
  const entityManager = app.get(EntityManager);

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.flushLogs();

  // not required but always nice to have
  app.setGlobalPrefix(serverPrefix);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const options = new DocumentBuilder()
    .setTitle('Rock paper sisscor API')
    .setDescription('Rock paper sisscor API AERQ')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(serverPrefix + '/api', app, document);

  await app.listen(serverPort);
  logger.log(`Application listening on port ${serverPort}`);
  logger.log(`Node Version: '${process.version}'`);
  logger.log(`NODE_ENV: '${nodeEnv}'`);

  if (process.env.DB_ENV !== 'test') {
    const choices = new initChoices(logger);
    await choices.up(entityManager);
  }
}
bootstrap();
