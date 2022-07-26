import { EntityManager } from 'typeorm';

export async function truncate(entityManager: EntityManager) {
  await entityManager.query('SET FOREIGN_KEY_CHECKS = 0;');
  const entities = entityManager.connection.entityMetadatas;
  for (const entity of entities) {
    await entityManager.query(`
    TRUNCATE TABLE \`${entity.tableName}\`;`);
  }
  await entityManager.query('SET FOREIGN_KEY_CHECKS = 1;');
}
