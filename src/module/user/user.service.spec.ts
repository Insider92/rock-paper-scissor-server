import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockType } from 'src/helper/mockType';
import { Repository } from 'typeorm';
import { Result } from '../match/enum/result.enum';
import { UserEntity } from './entity/user.entity';
import { Points } from './enum/points.enum';
import { repositoryMockFactory } from '../../factory/repo.factory';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let repositoryMock: MockType<Repository<UserEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    repositoryMock = module.get(getRepositoryToken(UserEntity));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('updatePoints', () => {
    it('should call update function when challenger wins', async () => {
      const challengerUserId = '58bd6161-8de7-4b8a-b820-3a64e0e09e99';
      const challengedUserId = '4828bf13-f398-423b-9d97-72537c35376b';
      const result = Result.CHALLENGER_WIN;
      jest
        .spyOn(userService, '_update')
        .mockImplementationOnce(() => Promise.resolve());

      await userService.updatePoints(
        challengerUserId,
        challengedUserId,
        result,
      );
      expect(userService._update).toHaveBeenCalledTimes(2);
      expect(userService._update).toHaveBeenNthCalledWith(
        1,
        Points.WIN_POINTS,
        challengerUserId,
      );
      expect(userService._update).toHaveBeenNthCalledWith(
        2,
        Points.LOSE_POINTS,
        challengedUserId,
      );
    });

    it('should call update function when challenged wins', async () => {
      const challengerUserId = '58bd6161-8de7-4b8a-b820-3a64e0e09e99';
      const challengedUserId = '4828bf13-f398-423b-9d97-72537c35376b';
      const result = Result.CHALLENGED_WIN;
      jest.spyOn(userService, '_update');

      await userService.updatePoints(
        challengerUserId,
        challengedUserId,
        result,
      );
      expect(userService._update).toHaveBeenCalledTimes(2);
      expect(userService._update).toHaveBeenNthCalledWith(
        1,
        Points.WIN_POINTS,
        challengedUserId,
      );
      expect(userService._update).toHaveBeenNthCalledWith(
        2,
        Points.LOSE_POINTS,
        challengerUserId,
      );
    });

    it('should call update function when draw', async () => {
      const challengerUserId = '58bd6161-8de7-4b8a-b820-3a64e0e09e99';
      const challengedUserId = '4828bf13-f398-423b-9d97-72537c35376b';
      const result = Result.DRAW;
      jest
        .spyOn(userService, '_update')
        .mockImplementation(() => Promise.resolve());

      await userService.updatePoints(
        challengerUserId,
        challengedUserId,
        result,
      );
      expect(userService._update).toHaveBeenCalledTimes(0);
    });

    it('should call update function when tbd', async () => {
      const challengerUserId = '58bd6161-8de7-4b8a-b820-3a64e0e09e99';
      const challengedUserId = '4828bf13-f398-423b-9d97-72537c35376b';
      const result = Result.TBD;
      jest
        .spyOn(userService, '_update')
        .mockImplementation(() => Promise.resolve());

      await userService.updatePoints(
        challengerUserId,
        challengedUserId,
        result,
      );
      expect(userService._update).toHaveBeenCalledTimes(0);
    });
  });
  describe('_update', () => {
    it('should save user with updated points if he wins points', async () => {
      const userObject = {
        id: '58bd6161-8de7-4b8a-b820-3a64e0e09e99',
        points: 0,
      };
      const points = Points.WIN_POINTS;
      const toBeUpdatedPoints = 10;

      jest
        .spyOn(repositoryMock, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(userObject));
      jest
        .spyOn(repositoryMock, 'create')
        .mockImplementationOnce(() => Promise.resolve());
      jest
        .spyOn(repositoryMock, 'save')
        .mockImplementationOnce(() => Promise.resolve());

      await userService._update(points, userObject.id);

      expect(repositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: userObject.id },
      });
      expect(repositoryMock.create).toHaveBeenCalledTimes(1);
      expect(repositoryMock.create).toHaveBeenCalledWith({
        id: userObject.id,
        points: toBeUpdatedPoints,
      });
      expect(repositoryMock.save).toHaveBeenCalledTimes(1);
    });

    it('should save user with updated points if he lose points', async () => {
      const userObject = {
        id: '58bd6161-8de7-4b8a-b820-3a64e0e09e99',
        points: 10,
      };
      const points = Points.LOSE_POINTS;
      const toBeUpdatedPoints = 5;

      jest
        .spyOn(repositoryMock, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(userObject));
      jest
        .spyOn(repositoryMock, 'create')
        .mockImplementationOnce(() => Promise.resolve());
      jest
        .spyOn(repositoryMock, 'save')
        .mockImplementationOnce(() => Promise.resolve());

      await userService._update(points, userObject.id);

      expect(repositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: userObject.id },
      });
      expect(repositoryMock.create).toHaveBeenCalledTimes(1);
      expect(repositoryMock.create).toHaveBeenCalledWith({
        id: userObject.id,
        points: toBeUpdatedPoints,
      });
      expect(repositoryMock.save).toHaveBeenCalledTimes(1);
    });

    it('should save user with updated points if he lose points but would be below zero', async () => {
      const userObject = {
        id: '58bd6161-8de7-4b8a-b820-3a64e0e09e99',
        points: 0,
      };
      const points = Points.LOSE_POINTS;
      const toBeUpdatedPoints = 0;

      jest
        .spyOn(repositoryMock, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(userObject));
      jest
        .spyOn(repositoryMock, 'create')
        .mockImplementationOnce(() => Promise.resolve());
      jest
        .spyOn(repositoryMock, 'save')
        .mockImplementationOnce(() => Promise.resolve());

      await userService._update(points, userObject.id);

      expect(repositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: userObject.id },
      });
      expect(repositoryMock.create).toHaveBeenCalledTimes(1);
      expect(repositoryMock.create).toHaveBeenCalledWith({
        id: userObject.id,
        points: toBeUpdatedPoints,
      });
      expect(repositoryMock.save).toHaveBeenCalledTimes(1);
    });
  });
});
