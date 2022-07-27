import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const ormConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_ENV === 'docker' ? 'mysql' : 'localhost',
  port: process.env.DB_ENV === 'docker' ? 3306 : 3307,
  username: 'root',
  password: 'password',
  database: process.env.DB_ENV === 'test' ? 'test_aerq' : 'aerq',
  synchronize: true,
  name: 'default',
  entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
};
