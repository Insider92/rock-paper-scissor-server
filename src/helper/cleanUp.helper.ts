import { databaseConfig } from 'src/config';
import { DataSource } from 'typeorm';

const tableNames = [];

// This only works for sqlite - only for this example app
export async function dropTables() {
  const dataSource = new DataSource({
    type: databaseConfig.type,
    database: databaseConfig.database,
  });

  const connection = await dataSource.initialize();

  await connection.manager.query('PRAGMA foreign_keys = OFF');
  for (const tableName of tableNames) {
    await connection.query(`DROP TABLE IF EXISTS ${tableName};`);
  }

  await connection.destroy();
}
