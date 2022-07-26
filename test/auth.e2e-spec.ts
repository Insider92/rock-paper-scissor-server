import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { truncate } from './helper/integrationTestHelper';
import { EntityManager } from 'typeorm';
import { UserEntity } from 'src/module/user/entity/user.entity';
import { comparePasswords } from 'src/helper/utils';

describe('Auth Controller (e2e)', () => {
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

  describe('authentication flow', () => {
    it('should create a new user', async () => {
      const newUser = {
        username: 'TestAuth10',
        password: 'Password1',
        email: 'user@mail.com',
      };

      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(newUser)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual({
            success: true,
            message: 'user registered',
          });
        });

      const user = await entityManager.findOne(UserEntity, {
        where: { username: newUser.username },
        select: ['username', 'password', 'email', 'points'],
      });
      expect(user).toEqual({
        username: newUser.username,
        email: newUser.email,
        password: user.password,
        points: 0,
      });
      return expect(
        await comparePasswords(user.password, newUser.password),
      ).toBe(true);
    });

    it('should create a new login token', async () => {
      const testUser = await entityManager.create(UserEntity, {
        username: 'TestAuth10',
        password: 'Password2',
        email: 'user@mail.com',
      });
      await entityManager.save(testUser);

      const loginUser = {
        username: 'TestAuth10',
        password: 'Password2',
      };

      return await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(loginUser)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual({
            username: loginUser.username,
            jwtExpiresIn: '3600s',
            accessToken: expect.any(String),
          });
        });
    });

    it('should return unauthorized a new login token', async () => {
      const loginUser = {
        username: 'NotRegisterUser1',
        password: 'Password2',
      };

      return await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(loginUser)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });
});
