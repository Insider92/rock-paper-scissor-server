import { EntityManager } from 'typeorm';

// only works in sqlite
export async function truncate(entityManager: EntityManager) {
  await entityManager.query('PRAGMA foreign_keys = OFF');

  const entities = entityManager.connection.entityMetadatas;
  for (const entity of entities) {
    await entityManager.query(`DELETE FROM ${entity.tableName};`);
  }

  await entityManager.query('PRAGMA foreign_keys = ON');
}
