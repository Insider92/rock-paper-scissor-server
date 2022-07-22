import { sqlite3 } from 'sqlite3';

interface IDatebaseConfig {
  type: sqlite3;
  database: string;
  synchronize: boolean;
}

export const databaseConfig: IDatebaseConfig = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
};
