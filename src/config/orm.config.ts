import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { databaseConfig } from './index';

export const ormConfig: TypeOrmModuleOptions = {
  type: databaseConfig.type,
  database: databaseConfig.database,
  entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  synchronize: databaseConfig.synchronize,
};
