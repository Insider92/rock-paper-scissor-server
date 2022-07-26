import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { truncate } from './helper/integrationTestHelper';
import { EntityManager } from 'typeorm';
import { UserEntity } from 'src/module/user/entity/user.entity';

describe('User Controller (e2e)', () => {
  let app: INestApplication;
  let entityManager: EntityManager;
  let token: string;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = testingModule.createNestApplication();
    entityManager = testingModule.get<EntityManager>(EntityManager);

    await app.init();
    await truncate(entityManager);

    // Generate a token for a user so we can authorize within the request
    const authUser = {
      id: '037cf399-fb47-4437-b1a8-9ee21255f4cf',
      username: 'TestUser10',
      password: 'Password2',
      email: 'user@mail.com',
    };

    const loginUser = {
      username: 'TestUser10',
      password: 'Password2',
    };

    const userEntity = await entityManager.create(UserEntity, authUser);
    await entityManager.save(userEntity);

    const req = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send(loginUser)
      .set('Accept', 'application/json');

    token = req.body.accessToken;
  });

  describe('user modul', () => {
    it('should return all user', async () => {
      await entityManager.save(UserEntity, {
        id: 'faa15478-6287-4ab2-b7bf-4a3b9c954302',
        username: 'TestUser30',
        password: 'Password3',
        email: 'user3@mail.com',
      });

      const expectedUser = [
        {
          id: '037cf399-fb47-4437-b1a8-9ee21255f4cf',
          username: 'TestUser10',
          points: 0,
        },
        {
          id: 'faa15478-6287-4ab2-b7bf-4a3b9c954302',
          username: 'TestUser30',
          points: 0,
        },
      ];

      return request(app.getHttpServer())
        .get(`/v1/user/`)
        .set('Authorization', 'bearer ' + token)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(expectedUser);
        });
    });

    it('should return all user without own user', async () => {
      await entityManager.save(UserEntity, {
        id: 'faa15478-6287-4ab2-b7bf-4a3b9c954302',
        username: 'TestUser30',
        password: 'Password3',
        email: 'user3@mail.com',
      });

      const expectedUser = [
        {
          id: 'faa15478-6287-4ab2-b7bf-4a3b9c954302',
          username: 'TestUser30',
          points: 0,
        },
      ];

      return request(app.getHttpServer())
        .get(`/v1/user/others`)
        .set('Authorization', 'bearer ' + token)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(expectedUser);
        });
    });

    it('should return own user', async () => {
      const expectedUser = {
        id: '037cf399-fb47-4437-b1a8-9ee21255f4cf',
        createdAt: expect.any(String),
        username: 'TestUser10',
        email: 'user@mail.com',
        points: 0,
      };

      return request(app.getHttpServer())
        .get(`/v1/user/whoami`)
        .set('Authorization', 'bearer ' + token)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(expectedUser);
        });
    });
  });
});
