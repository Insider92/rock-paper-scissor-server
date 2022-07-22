import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.flushLogs();

  // not required but always nice to have
  app.setGlobalPrefix(configService.get('prefix'));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const options = new DocumentBuilder()
    .setTitle('Rock paper sisscor API')
    .setDescription('Rock paper sisscor API AERQ')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(configService.get('prefix') + '/api', app, document);

  await app.listen(configService.get('port'));
  logger.log(`Application listening on port ${configService.get('port')}`);
  logger.log(`Node Version: '${process.version}'`);
  logger.log(`NODE_ENV: '${configService.get('NODE_ENV')}'`);
}
bootstrap();
