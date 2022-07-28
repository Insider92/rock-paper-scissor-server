import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from 'src/factory/repo.factory';
import { ChoiceService } from '../choice/choice.service';
import { ChoiceEntity } from '../choice/entity/choice.entity';
import { UserEntity } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';
import { MatchEntity } from './entity/match.entity';
import { Result } from './enum/result.enum';
import { MatchService } from './match.service';

describe('MatchService', () => {
  let matchService: MatchService;
  let choiceService: ChoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        ChoiceService,
        UserService,
        {
          provide: getRepositoryToken(MatchEntity),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChoiceEntity),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    matchService = module.get<MatchService>(MatchService);
    choiceService = module.get<ChoiceService>(ChoiceService);
  });

  /**
   * _getMatchResult will be tested with the possible choices:
   *
   * Rock - gets beaten by Paper
   * Paper - gets beaten by Scissor
   * Scissor - get beaten by Rock
   *
   * This could extended with other choices as well
   */

  // Create Choice

  const rock = new ChoiceEntity();
  rock.id = '7fc0b48c-4e22-4172-a80c-b92fb3a646e3';

  const paper = new ChoiceEntity();
  paper.id = '4381ace9-98ac-4cc4-9463-5072a68565bf';

  const scissor = new ChoiceEntity();
  scissor.id = '67ab4f98-aac1-4024-adda-cf3fac13999c';

  // Set BeatenBy
  rock.getsBeatenBy = [paper];
  paper.getsBeatenBy = [scissor];
  scissor.getsBeatenBy = [rock];

  describe('rock', () => {
    it('should return challenger win if rock vs scissor', async () => {
      jest
        .spyOn(choiceService, 'getOneWithRelations')
        .mockImplementationOnce(() => Promise.resolve(rock));

      return expect(
        await matchService._getMatchResult(rock.id, scissor.id),
      ).toBe(Result.CHALLENGER_WIN);
    });

    it('should return challenged win if rock vs paper', async () => {
      jest
        .spyOn(choiceService, 'getOneWithRelations')
        .mockImplementationOnce(() => Promise.resolve(rock));

      return expect(await matchService._getMatchResult(rock.id, paper.id)).toBe(
        Result.CHALLENGED_WIN,
      );
    });

    it('should return draw if rock vs rock', async () => {
      jest
        .spyOn(choiceService, 'getOneWithRelations')
        .mockImplementationOnce(() => Promise.resolve(rock));

      return expect(await matchService._getMatchResult(rock.id, rock.id)).toBe(
        Result.DRAW,
      );
    });
  });

  describe('paper', () => {
    it('should return challenger win if paper vs rock', async () => {
      jest
        .spyOn(choiceService, 'getOneWithRelations')
        .mockImplementationOnce(() => Promise.resolve(paper));

      return expect(await matchService._getMatchResult(paper.id, rock.id)).toBe(
        Result.CHALLENGER_WIN,
      );
    });

    it('should return challenged win if paper vs scissor', async () => {
      jest
        .spyOn(choiceService, 'getOneWithRelations')
        .mockImplementationOnce(() => Promise.resolve(paper));

      return expect(
        await matchService._getMatchResult(paper.id, scissor.id),
      ).toBe(Result.CHALLENGED_WIN);
    });

    it('should return draw if paper vs paper', async () => {
      jest
        .spyOn(choiceService, 'getOneWithRelations')
        .mockImplementationOnce(() => Promise.resolve(paper));

      return expect(
        await matchService._getMatchResult(paper.id, paper.id),
      ).toBe(Result.DRAW);
    });
  });

  describe('scissor', () => {
    it('should return challenger win if scissor vs paper', async () => {
      jest
        .spyOn(choiceService, 'getOneWithRelations')
        .mockImplementationOnce(() => Promise.resolve(scissor));

      return expect(
        await matchService._getMatchResult(scissor.id, paper.id),
      ).toBe(Result.CHALLENGER_WIN);
    });

    it('should return challenged win if scissor vs rock', async () => {
      jest
        .spyOn(choiceService, 'getOneWithRelations')
        .mockImplementationOnce(() => Promise.resolve(scissor));

      return expect(
        await matchService._getMatchResult(scissor.id, rock.id),
      ).toBe(Result.CHALLENGED_WIN);
    });

    it('should return draw if scissor vs scissor', async () => {
      jest
        .spyOn(choiceService, 'getOneWithRelations')
        .mockImplementationOnce(() => Promise.resolve(scissor));

      return expect(
        await matchService._getMatchResult(scissor.id, scissor.id),
      ).toBe(Result.DRAW);
    });
  });
});
