import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const ormConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3307,
  username: 'root',
  password: 'password',
  database: process.env.DB_ENV === 'test' ? 'test_aerq' : 'aerq',
  synchronize: true,
  name: 'default',
  entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  migrations: ['dist/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations_typeorm',
  migrationsRun: process.env.DB_ENV === 'test' ? false : true,
};
