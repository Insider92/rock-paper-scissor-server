import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { truncate } from './helper/integrationTestHelper';
import { EntityManager } from 'typeorm';
import { UserEntity } from 'src/module/user/entity/user.entity';
import { MatchEntity } from 'src/module/match/entity/match.entity';
import { ChoiceEntity } from 'src/module/choice/entity/choice.entity';
import { OpponentType } from 'src/module/match/enum/opponentType.enum';
import { Status } from 'src/module/match/enum/status.enum';
import { Result } from 'src/module/match/enum/result.enum';
import { ChoiceService } from 'src/module/choice/choice.service';

describe('Match Controller (e2e)', () => {
  let app: INestApplication;
  let entityManager: EntityManager;
  let choiceService: ChoiceService;
  let token1: string;
  let token2: string;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = testingModule.createNestApplication();
    entityManager = testingModule.get<EntityManager>(EntityManager);
    choiceService = testingModule.get<ChoiceService>(ChoiceService);

    await app.init();
    await truncate(entityManager);

    // Generate a token for three user so we can authorize within the request
    const authUser1 = {
      id: '037cf399-fb47-4437-b1a8-9ee21255f4cf',
      username: 'MatchUser1',
      password: 'Password1',
      email: 'user@mail.com',
      points: 20,
    };

    const authUser2 = {
      id: 'ce48326d-8015-428a-9fd1-da387b907ef7',
      username: 'MatchUser2',
      password: 'Password1',
      email: 'user@mail.com',
      points: 20,
    };

    const authUser3 = {
      id: 'c3b37ae2-c769-4c1b-a0ce-d790e83ebb6f',
      username: 'MatchUser3',
      password: 'Password1',
      email: 'user@mail.com',
      points: 20,
    };

    const loginUser1 = {
      username: 'MatchUser1',
      password: 'Password1',
    };

    const loginUser2 = {
      username: 'MatchUser2',
      password: 'Password1',
    };

    const userEntity1 = await entityManager.create(UserEntity, authUser1);
    const userEntity2 = await entityManager.create(UserEntity, authUser2);
    const userEntity3 = await entityManager.create(UserEntity, authUser3);
    await entityManager.save(userEntity1);
    await entityManager.save(userEntity2);
    await entityManager.save(userEntity3);

    const req1 = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send(loginUser1)
      .set('Accept', 'application/json');
    const req2 = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send(loginUser2)
      .set('Accept', 'application/json');

    token1 = req1.body.accessToken;
    token2 = req2.body.accessToken;

    // Setup Rock Paper Scissor Choices
    const rock = {
      id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
      name: 'Rock',
      getsBeatenBy: [{ id: '508c501e-8632-4aff-8d26-f20a85868e0b' }],
    };

    const paper = {
      id: '508c501e-8632-4aff-8d26-f20a85868e0b',
      name: 'Paper',
      getsBeatenBy: [{ id: '5b0c1dd0-4d96-43f0-b4c7-ddf30d2c5145' }],
    };

    const scissor = {
      id: '5b0c1dd0-4d96-43f0-b4c7-ddf30d2c5145',
      name: 'Scissor',
      getsBeatenBy: [{ id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d' }],
    };

    await entityManager.query('SET foreign_key_checks = 0');
    await entityManager.save(ChoiceEntity, rock);
    await entityManager.save(ChoiceEntity, paper);
    await entityManager.save(ChoiceEntity, scissor);
    await entityManager.query('SET foreign_key_checks = 1');
  });

  afterEach(() => jest.clearAllMocks());

  describe('match modul', () => {
    it('should return an empty array', async () => {
      return request(app.getHttpServer())
        .get(`/v1/match`)
        .expect(200)
        .expect([]);
    });

    it('should return all matches', async () => {
      const newFinishedMatch = {
        id: '4141e34b-8a62-4bc6-8ef3-2091c8892f94',
        status: Status.FINISHED,
        opponentType: OpponentType.HUMAN,
        result: Result.CHALLENGER_WIN,
        challengerUser: {
          id: '037cf399-fb47-4437-b1a8-9ee21255f4cf',
          username: 'MatchUser1',
        },
        challengedUser: {
          id: 'ce48326d-8015-428a-9fd1-da387b907ef7',
          username: 'MatchUser2',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          name: 'Rock',
        },
        challengedChoice: {
          id: '5b0c1dd0-4d96-43f0-b4c7-ddf30d2c5145',
          name: 'Scissor',
        },
      };

      const newOngoingMatch = {
        id: '28732c6d-869a-463d-a8b5-2aa781bba0e1',
        status: Status.ONGOING,
        opponentType: OpponentType.HUMAN,
        result: Result.TBD,
        challengerUser: {
          id: '037cf399-fb47-4437-b1a8-9ee21255f4cf',
          username: 'MatchUser1',
        },
        challengedUser: {
          id: 'ce48326d-8015-428a-9fd1-da387b907ef7',
          username: 'MatchUser2',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          name: 'Rock',
        },
        challengedChoice: null,
      };

      const expectedMatches = [newOngoingMatch, newFinishedMatch];

      const matchEntity1 = await entityManager.create(
        MatchEntity,
        newFinishedMatch,
      );
      const matchEntity2 = await entityManager.create(
        MatchEntity,
        newOngoingMatch,
      );
      await entityManager.save(matchEntity1);
      await entityManager.save(matchEntity2);

      return request(app.getHttpServer())
        .get(`/v1/match/`)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(expectedMatches);
        });
    });

    it('should return all finished matches for the user', async () => {
      const newFinishedMatch = {
        id: '4141e34b-8a62-4bc6-8ef3-2091c8892f94',
        status: Status.FINISHED,
        opponentType: OpponentType.HUMAN,
        result: Result.CHALLENGER_WIN,
        challengerUser: {
          id: '037cf399-fb47-4437-b1a8-9ee21255f4cf',
          username: 'MatchUser1',
        },
        challengedUser: {
          id: 'ce48326d-8015-428a-9fd1-da387b907ef7',
          username: 'MatchUser2',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          name: 'Rock',
        },
        challengedChoice: {
          id: '5b0c1dd0-4d96-43f0-b4c7-ddf30d2c5145',
          name: 'Scissor',
        },
      };

      const newFinishedMatchWithoutUser = {
        id: 'c924a041-fe69-423b-aa0e-fffdd3746629',
        status: Status.FINISHED,
        opponentType: OpponentType.HUMAN,
        result: Result.CHALLENGER_WIN,
        challengerUser: {
          id: 'c3b37ae2-c769-4c1b-a0ce-d790e83ebb6f',
          username: 'MatchUser3',
        },
        challengedUser: {
          id: 'ce48326d-8015-428a-9fd1-da387b907ef7',
          username: 'MatchUser2',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          name: 'Rock',
        },
        challengedChoice: {
          id: '5b0c1dd0-4d96-43f0-b4c7-ddf30d2c5145',
          name: 'Scissor',
        },
      };

      const newOngoingMatch = {
        id: '28732c6d-869a-463d-a8b5-2aa781bba0e1',
        status: Status.ONGOING,
        opponentType: OpponentType.HUMAN,
        result: Result.TBD,
        challengerUser: {
          id: '037cf399-fb47-4437-b1a8-9ee21255f4cf',
          username: 'MatchUser1',
        },
        challengedUser: {
          id: 'ce48326d-8015-428a-9fd1-da387b907ef7',
          username: 'MatchUser2',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          name: 'Rock',
        },
        challengedChoice: null,
      };

      const expectedMatches = [
        { ...newFinishedMatch, updatedAt: expect.any(String) },
      ];

      const matchEntity1 = await entityManager.create(
        MatchEntity,
        newFinishedMatch,
      );
      const matchEntity2 = await entityManager.create(
        MatchEntity,
        newOngoingMatch,
      );
      const matchEntity3 = await entityManager.create(
        MatchEntity,
        newFinishedMatchWithoutUser,
      );
      await entityManager.save(matchEntity1);
      await entityManager.save(matchEntity2);
      await entityManager.save(matchEntity3);

      // we use user1 here
      return request(app.getHttpServer())
        .get(`/v1/match/history`)
        .set('Authorization', 'bearer ' + token1)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(expectedMatches);
        });
    });

    it('should return all challenges for the user', async () => {
      const newFinishedMatch = {
        id: '4141e34b-8a62-4bc6-8ef3-2091c8892f94',
        status: Status.FINISHED,
        opponentType: OpponentType.HUMAN,
        result: Result.CHALLENGER_WIN,
        challengerUser: {
          id: '037cf399-fb47-4437-b1a8-9ee21255f4cf',
          username: 'MatchUser1',
        },
        challengedUser: {
          id: 'ce48326d-8015-428a-9fd1-da387b907ef7',
          username: 'MatchUser2',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          name: 'Rock',
        },
        challengedChoice: {
          id: '5b0c1dd0-4d96-43f0-b4c7-ddf30d2c5145',
          name: 'Scissor',
        },
      };

      const newFinishedMatchWithoutUser = {
        id: 'c924a041-fe69-423b-aa0e-fffdd3746629',
        status: Status.FINISHED,
        opponentType: OpponentType.HUMAN,
        result: Result.CHALLENGER_WIN,
        challengerUser: {
          id: 'c3b37ae2-c769-4c1b-a0ce-d790e83ebb6f',
          username: 'MatchUser3',
        },
        challengedUser: {
          id: 'ce48326d-8015-428a-9fd1-da387b907ef7',
          username: 'MatchUser2',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          name: 'Rock',
        },
        challengedChoice: {
          id: '5b0c1dd0-4d96-43f0-b4c7-ddf30d2c5145',
          name: 'Scissor',
        },
      };

      const newOngoingMatch = {
        id: '28732c6d-869a-463d-a8b5-2aa781bba0e1',
        status: Status.ONGOING,
        opponentType: OpponentType.HUMAN,
        result: Result.TBD,
        challengerUser: {
          id: '037cf399-fb47-4437-b1a8-9ee21255f4cf',
          username: 'MatchUser1',
        },
        challengedUser: {
          id: 'ce48326d-8015-428a-9fd1-da387b907ef7',
          username: 'MatchUser2',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          name: 'Rock',
        },
        challengedChoice: null,
      };

      const expectedChallenge = {
        id: '28732c6d-869a-463d-a8b5-2aa781bba0e1',
        status: Status.ONGOING,
        opponentType: OpponentType.HUMAN,
        result: Result.TBD,
        challengerUser: {
          id: '037cf399-fb47-4437-b1a8-9ee21255f4cf',
          username: 'MatchUser1',
        },
        challengedUser: {
          id: 'ce48326d-8015-428a-9fd1-da387b907ef7',
          username: 'MatchUser2',
        },
      };

      const expectedMatches = [expectedChallenge];

      const matchEntity1 = await entityManager.create(
        MatchEntity,
        newFinishedMatch,
      );
      const matchEntity2 = await entityManager.create(
        MatchEntity,
        newOngoingMatch,
      );
      const matchEntity3 = await entityManager.create(
        MatchEntity,
        newFinishedMatchWithoutUser,
      );
      await entityManager.save(matchEntity1);
      await entityManager.save(matchEntity2);
      await entityManager.save(matchEntity3);

      // We use user2 here
      return await request(app.getHttpServer())
        .get(`/v1/match/challenges`)
        .set('Authorization', 'bearer ' + token2)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(expectedMatches);
        });
    });

    it('should challenge another human user', async () => {
      const challenge = {
        challengedUser: 'ce48326d-8015-428a-9fd1-da387b907ef7', // user2
        choice: 'c907bbd9-f4f0-4344-a72a-ba58031e057d', // rock
      };

      const expectedChallengeRequest = {
        challengerUser: '037cf399-fb47-4437-b1a8-9ee21255f4cf',
        challengedUser: {
          id: 'ce48326d-8015-428a-9fd1-da387b907ef7',
          username: 'MatchUser2',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          name: 'Rock',
        },
        deletedAt: null,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        status: Status.ONGOING,
        opponentType: OpponentType.HUMAN,
        result: Result.TBD,
      };

      const expectedMatchEntity = {
        id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
        status: Status.ONGOING,
        opponentType: OpponentType.HUMAN,
        result: Result.TBD,
      };

      // we use user1 here
      const challengeRequest = await request(app.getHttpServer())
        .post(`/v1/match/human`)
        .set('Authorization', 'bearer ' + token1)
        .send(challenge)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual(expectedChallengeRequest);
        });

      const newChallenge = await entityManager.findOne(MatchEntity, {
        where: { id: challengeRequest.body.id },
      });
      return expect(newChallenge).toEqual(expectedMatchEntity);
    });

    it('should answer another human challenge - WIN', async () => {
      const newOngoingMatch = {
        id: '28732c6d-869a-463d-a8b5-2aa781bba0e1',
        status: Status.ONGOING,
        opponentType: OpponentType.HUMAN,
        result: Result.TBD,
        challengerUser: {
          id: '037cf399-fb47-4437-b1a8-9ee21255f4cf',
          username: 'MatchUser1',
        },
        challengedUser: {
          id: 'ce48326d-8015-428a-9fd1-da387b907ef7',
          username: 'MatchUser2',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          name: 'Rock',
        },
        challengedChoice: null,
      };

      const matchEntity = await entityManager.create(
        MatchEntity,
        newOngoingMatch,
      );
      await entityManager.save(matchEntity);

      const challengeAnswer = {
        choice: '508c501e-8632-4aff-8d26-f20a85868e0b', // paper
      };

      const expectedMatchRequest = {
        id: expect.any(String),
        result: 'challengedWin',
        challengedChoice: {
          id: '508c501e-8632-4aff-8d26-f20a85868e0b',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          name: 'Paper',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          name: 'Rock',
        },
      };

      const expectedMatchEntity = {
        id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
        status: Status.FINISHED,
        opponentType: OpponentType.HUMAN,
        result: Result.CHALLENGED_WIN,
      };

      // we use user2 here
      const challengeAnswerRequest = await request(app.getHttpServer())
        .put(`/v1/match/${newOngoingMatch.id}`)
        .set('Authorization', 'bearer ' + token2)
        .send(challengeAnswer)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(expectedMatchRequest);
        });

      const newChallenge = await entityManager.findOne(MatchEntity, {
        where: { id: challengeAnswerRequest.body.id },
      });
      expect(newChallenge).toEqual(expectedMatchEntity);

      const challengerUser = await entityManager.findOne(UserEntity, {
        where: { id: newOngoingMatch.challengerUser.id },
      });
      const challengedUser = await entityManager.findOne(UserEntity, {
        where: { id: newOngoingMatch.challengedUser.id },
      });

      // Both are initalized with 20 points
      expect(challengerUser.points).toBe(15);
      return expect(challengedUser.points).toBe(30);
    });

    it('should answer another human challenge - LOSE', async () => {
      const newOngoingMatch = {
        id: '28732c6d-869a-463d-a8b5-2aa781bba0e1',
        status: Status.ONGOING,
        opponentType: OpponentType.HUMAN,
        result: Result.TBD,
        challengerUser: {
          id: '037cf399-fb47-4437-b1a8-9ee21255f4cf',
          username: 'MatchUser1',
        },
        challengedUser: {
          id: 'ce48326d-8015-428a-9fd1-da387b907ef7',
          username: 'MatchUser2',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          name: 'Rock',
        },
        challengedChoice: null,
      };

      const matchEntity = await entityManager.create(
        MatchEntity,
        newOngoingMatch,
      );
      await entityManager.save(matchEntity);

      const challengeAnswer = {
        choice: '5b0c1dd0-4d96-43f0-b4c7-ddf30d2c5145', // scissor
      };

      const expectedMatchRequest = {
        id: expect.any(String),
        result: Result.CHALLENGER_WIN,
        challengedChoice: {
          id: '5b0c1dd0-4d96-43f0-b4c7-ddf30d2c5145',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          name: 'Scissor',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          name: 'Rock',
        },
      };

      const expectedMatchEntity = {
        id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
        status: Status.FINISHED,
        opponentType: OpponentType.HUMAN,
        result: Result.CHALLENGER_WIN,
      };

      // we use user2 here
      const challengeAnswerRequest = await request(app.getHttpServer())
        .put(`/v1/match/${newOngoingMatch.id}`)
        .set('Authorization', 'bearer ' + token2)
        .send(challengeAnswer)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(expectedMatchRequest);
        });

      const newChallenge = await entityManager.findOne(MatchEntity, {
        where: { id: challengeAnswerRequest.body.id },
      });
      expect(newChallenge).toEqual(expectedMatchEntity);

      const challengerUser = await entityManager.findOne(UserEntity, {
        where: { id: newOngoingMatch.challengerUser.id },
      });
      const challengedUser = await entityManager.findOne(UserEntity, {
        where: { id: newOngoingMatch.challengedUser.id },
      });

      // Both are initalized with 20 points
      expect(challengerUser.points).toBe(30);
      return expect(challengedUser.points).toBe(15);
    });

    it('should answer another human challenge - DRAW', async () => {
      const newOngoingMatch = {
        id: '28732c6d-869a-463d-a8b5-2aa781bba0e1',
        status: Status.ONGOING,
        opponentType: OpponentType.HUMAN,
        result: Result.TBD,
        challengerUser: {
          id: '037cf399-fb47-4437-b1a8-9ee21255f4cf',
          username: 'MatchUser1',
        },
        challengedUser: {
          id: 'ce48326d-8015-428a-9fd1-da387b907ef7',
          username: 'MatchUser2',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          name: 'Rock',
        },
        challengedChoice: null,
      };

      const matchEntity = await entityManager.create(
        MatchEntity,
        newOngoingMatch,
      );
      await entityManager.save(matchEntity);

      const challengeAnswer = {
        choice: 'c907bbd9-f4f0-4344-a72a-ba58031e057d', // rock
      };

      const expectedMatchRequest = {
        id: expect.any(String),
        result: Result.DRAW,
        challengedChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          name: 'Rock',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          name: 'Rock',
        },
      };

      const expectedMatchEntity = {
        id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
        status: Status.FINISHED,
        opponentType: OpponentType.HUMAN,
        result: Result.DRAW,
      };

      // we use user2 here
      const challengeAnswerRequest = await request(app.getHttpServer())
        .put(`/v1/match/${newOngoingMatch.id}`)
        .set('Authorization', 'bearer ' + token2)
        .send(challengeAnswer)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(expectedMatchRequest);
        });

      const newChallenge = await entityManager.findOne(MatchEntity, {
        where: { id: challengeAnswerRequest.body.id },
      });
      expect(newChallenge).toEqual(expectedMatchEntity);

      const challengerUser = await entityManager.findOne(UserEntity, {
        where: { id: newOngoingMatch.challengerUser.id },
      });
      const challengedUser = await entityManager.findOne(UserEntity, {
        where: { id: newOngoingMatch.challengedUser.id },
      });

      // Both are initalized with 20 points
      expect(challengerUser.points).toBe(20);
      return expect(challengedUser.points).toBe(20);
    });

    it('should return the result of the challenge of the computer - WIN', async () => {
      const scissorId = '5b0c1dd0-4d96-43f0-b4c7-ddf30d2c5145';
      jest
        .spyOn(choiceService, 'getRandomChoice')
        .mockImplementation(() => Promise.resolve(scissorId));

      const challenge = {
        choice: 'c907bbd9-f4f0-4344-a72a-ba58031e057d', // rock
      };

      const expectedChallengeRequest = {
        id: expect.any(String),
        result: Result.CHALLENGER_WIN,
        challengedChoice: {
          id: '5b0c1dd0-4d96-43f0-b4c7-ddf30d2c5145',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          name: 'Scissor',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          name: 'Rock',
        },
      };

      const expectedMatchEntity = {
        id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
        status: Status.FINISHED,
        opponentType: OpponentType.COMPUTER,
        result: Result.CHALLENGER_WIN,
      };

      // we use user1 here
      const challengeRequest = await request(app.getHttpServer())
        .post(`/v1/match/computer`)
        .set('Authorization', 'bearer ' + token1)
        .send(challenge)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual(expectedChallengeRequest);
        });

      const newChallenge = await entityManager.findOne(MatchEntity, {
        where: { id: challengeRequest.body.id },
      });
      return expect(newChallenge).toEqual(expectedMatchEntity);
    });

    it('should return the result of the challenge of the computer - LOSE', async () => {
      const paperId = '508c501e-8632-4aff-8d26-f20a85868e0b';
      jest
        .spyOn(choiceService, 'getRandomChoice')
        .mockImplementation(() => Promise.resolve(paperId));

      const challenge = {
        choice: 'c907bbd9-f4f0-4344-a72a-ba58031e057d', // rock
      };

      const expectedChallengeRequest = {
        id: expect.any(String),
        result: Result.CHALLENGED_WIN,
        challengedChoice: {
          id: '508c501e-8632-4aff-8d26-f20a85868e0b',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          name: 'Paper',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          name: 'Rock',
        },
      };

      const expectedMatchEntity = {
        id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
        status: Status.FINISHED,
        opponentType: OpponentType.COMPUTER,
        result: Result.CHALLENGED_WIN,
      };

      // we use user1 here
      const challengeRequest = await request(app.getHttpServer())
        .post(`/v1/match/computer`)
        .set('Authorization', 'bearer ' + token1)
        .send(challenge)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual(expectedChallengeRequest);
        });

      const newChallenge = await entityManager.findOne(MatchEntity, {
        where: { id: challengeRequest.body.id },
      });
      return expect(newChallenge).toEqual(expectedMatchEntity);
    });

    it('should return the result of the challenge of the computer - DRAW', async () => {
      const rockId = 'c907bbd9-f4f0-4344-a72a-ba58031e057d';
      jest
        .spyOn(choiceService, 'getRandomChoice')
        .mockImplementation(() => Promise.resolve(rockId));

      const challenge = {
        choice: 'c907bbd9-f4f0-4344-a72a-ba58031e057d', // rock
      };

      const expectedChallengeRequest = {
        id: expect.any(String),
        result: Result.DRAW,
        challengedChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          name: 'Rock',
        },
        challengerChoice: {
          id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          name: 'Rock',
        },
      };

      const expectedMatchEntity = {
        id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
        status: Status.FINISHED,
        opponentType: OpponentType.COMPUTER,
        result: Result.DRAW,
      };

      // we use user1 here
      const challengeRequest = await request(app.getHttpServer())
        .post(`/v1/match/computer`)
        .set('Authorization', 'bearer ' + token1)
        .send(challenge)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual(expectedChallengeRequest);
        });

      const newChallenge = await entityManager.findOne(MatchEntity, {
        where: { id: challengeRequest.body.id },
      });
      return expect(newChallenge).toEqual(expectedMatchEntity);
    });
  });
});
