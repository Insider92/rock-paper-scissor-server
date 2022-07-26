import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { truncate } from './helper/integrationTestHelper';
import { EntityManager } from 'typeorm';
import { ChoiceEntity } from 'src/module/choice/entity/choice.entity';

describe('Choice Controller (e2e)', () => {
  let app: INestApplication;
  let entityManager: EntityManager;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = testingModule.createNestApplication();
    entityManager = testingModule.get<EntityManager>(EntityManager);

    await app.init();
  });

  beforeEach(async () => {
    await truncate(entityManager);
  });

  describe('choice modul', () => {
    it('should return an empty array', async () => {
      return request(app.getHttpServer())
        .get(`/v1/choice`)
        .expect(200)
        .expect([]);
    });

    it('should return all choices', async () => {
      const rock = {
        id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
        name: 'Rock',
        getsBeatenBy: [{ id: '508c501e-8632-4aff-8d26-f20a85868e0b' }],
      };

      const paper = {
        id: '508c501e-8632-4aff-8d26-f20a85868e0b',
        name: 'Paper',
        getsBeatenBy: [{ id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d' }],
      };

      await entityManager.query('SET foreign_key_checks = 0');
      await entityManager.save(ChoiceEntity, rock);
      await entityManager.save(ChoiceEntity, paper);
      await entityManager.query('SET foreign_key_checks = 1');

      return request(app.getHttpServer())
        .get(`/v1/choice`)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual([
            {
              id: paper.id,
              deletedAt: null,
              updatedAt: expect.any(String),
              createdAt: expect.any(String),
              name: paper.name,
              getsBeatenBy: [
                {
                  id: paper.getsBeatenBy[0].id,
                  deletedAt: null,
                  updatedAt: expect.any(String),
                  createdAt: expect.any(String),
                  name: 'Rock',
                },
              ],
            },
            {
              id: rock.id,
              deletedAt: null,
              updatedAt: expect.any(String),
              createdAt: expect.any(String),
              name: rock.name,
              getsBeatenBy: [
                {
                  id: rock.getsBeatenBy[0].id,
                  deletedAt: null,
                  updatedAt: expect.any(String),
                  createdAt: expect.any(String),
                  name: 'Paper',
                },
              ],
            },
          ]);
        });
    });
  });
});
