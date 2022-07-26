import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ChoiceService } from '../choice/choice.service';
import { ChoiceNameDto } from '../choice/dto/choiceName.dto';
import { UserDto } from '../user/dto/user.dto';
import { UserService } from '../user/user.service';
import { ChallengeChoiceDto } from './dto/challengeChoiceDto';
import { ChallengeHumanDto } from './dto/challengeHuman.dto';
import { FinishedMatchDto } from './dto/finishedMatch.dto';
import { MatchDto } from './dto/match.dto';
import { MatchEntity } from './entity/match.entity';
import { OpponentType } from './enum/opponentType.enum';
import { Result } from './enum/result.enum';
import { Status } from './enum/status.enum';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepository: Repository<MatchEntity>,
    private readonly choiceService: ChoiceService,
    private readonly userService: UserService,
  ) {}

  async getOneWithRelations(id: string): Promise<MatchDto> {
    return await this.matchRepository.findOne({
      where: { id: id },
      relations: [
        'challengerUser',
        'challengerChoice',
        'challengedUser',
        'challengedChoice',
      ],
    });
  }

  async GetAllMatches(): Promise<MatchDto[]> {
    return await this.matchRepository.find({
      relations: [
        'challengerUser',
        'challengedUser',
        'challengerChoice',
        'challengedChoice',
      ],
      select: {
        id: true,
        result: true,
        status: true,
        opponentType: true,
        challengerChoice: {
          id: true,
          name: true,
        },
        challengedChoice: {
          id: true,
          name: true,
        },
        challengerUser: {
          id: true,
          username: true,
        },
        challengedUser: {
          id: true,
          username: true,
        },
      },
    });
  }

  async GetUsersFinishedMachtes(user: any): Promise<MatchDto[]> {
    return await this.matchRepository
      .createQueryBuilder('match')
      .innerJoin('match.challengerUser', 'challengerUser')
      .leftJoin('match.challengedUser', 'challengedUser')
      .innerJoin('match.challengerChoice', 'challengerChoice')
      .innerJoin('match.challengedChoice', 'challengedChoice')
      .where('match.status = :status', { status: Status.FINISHED })
      .andWhere(
        new Brackets((qb) => {
          qb.where('match.challengerUser.id = :id', {
            id: user.id,
          }).orWhere('match.challengedUser.id = :id', { id: user.id });
        }),
      )
      .select([
        'match.id',
        'match.updatedAt',
        'match.status',
        'match.result',
        'match.opponentType',
      ])
      .addSelect([
        'challengerUser.id',
        'challengerUser.username',
        'challengedUser.id',
        'challengedUser.username',
        'challengerChoice.id',
        'challengerChoice.name',
        'challengedChoice.id',
        'challengedChoice.name',
      ])
      .getMany();
  }

  async GetUsersChallenges(user: any): Promise<MatchDto[]> {
    return await this.matchRepository.find({
      where: {
        status: Status.ONGOING,
        challengedUser: {
          id: user.id,
        },
      },
      relations: ['challengerUser', 'challengedUser'],
      select: {
        id: true,
        result: true,
        status: true,
        opponentType: true,
        challengerUser: {
          id: true,
          username: true,
        },
        challengedUser: {
          id: true,
          username: true,
        },
      },
    });
  }

  async choiceExists(choiceId: string): Promise<ChoiceNameDto> {
    return await this.choiceService.getOne(choiceId);
  }

  async userExists(userId: string): Promise<UserDto> {
    return await this.userService.getOne(userId);
  }

  async challengeComputer(
    match: ChallengeChoiceDto,
    user: any,
  ): Promise<FinishedMatchDto> {
    const humanChoiceEntity = await this.choiceService.getOne(match.choice);

    const matchObject = {
      challengerUser: user.id,
      challengerChoice: humanChoiceEntity,
      opponentType: OpponentType.COMPUTER,
    };

    const computersChoice = await this._getComputersChoice();
    const matchResult = await this._getMatchResult(
      match.choice,
      computersChoice,
    );
    matchObject['challengedChoice'] = computersChoice;
    matchObject['result'] = matchResult;
    matchObject['status'] = Status.FINISHED;

    const computerChoiceEntity = await this.choiceService.getOne(
      computersChoice,
    );

    const matchToBeCreated = await this.matchRepository.create(matchObject);
    const savedMatch = await this.matchRepository.save(matchToBeCreated);

    const finishedMatchObject: FinishedMatchDto = {
      id: savedMatch.id,
      result: matchResult,
      challengedChoice: computerChoiceEntity,
      challengerChoice: humanChoiceEntity,
    };

    return finishedMatchObject;
  }

  async challengeHuman(match: ChallengeHumanDto, user: any): Promise<MatchDto> {
    const challengedUserEntity = await this.userService.getOne(
      match.challengedUser,
    );

    const challengerChoiceEntity = await this.choiceService.getOne(
      match.choice,
    );

    const matchObject = {
      challengerUser: user.id,
      challengerChoice: challengerChoiceEntity,
      challengedUser: challengedUserEntity,
      opponentType: OpponentType.HUMAN,
    };

    const matchToBeCreated = await this.matchRepository.create(matchObject);
    return await this.matchRepository.save(matchToBeCreated);
  }

  async answerChallenge(
    id: string,
    match: ChallengeChoiceDto,
    user: any,
  ): Promise<FinishedMatchDto> {
    const ongoingMatch = await this.matchRepository.findOne({
      where: { id: id },
      relations: ['challengerUser', 'challengerChoice'],
    });

    const challengedChoiceEntity = await this.choiceService.getOne(
      match.choice,
    );

    const matchObject = {
      id: id,
      challengerUser: ongoingMatch.challengerUser,
      challengedUser: user.id,
      challengerChoice: ongoingMatch.challengerChoice,
      challengedChoice: challengedChoiceEntity,
      opponentType: ongoingMatch.opponentType,
      status: ongoingMatch.status,
    };

    const matchResult = await this._getMatchResult(
      matchObject.challengerChoice.id,
      matchObject.challengedChoice.id,
    );

    matchObject['result'] = matchResult;
    matchObject['status'] = Status.FINISHED;

    const challengerChoiceEntity = await this.choiceService.getOne(
      matchObject.challengerChoice.id,
    );

    await this.userService.updatePoints(
      matchObject.challengerUser.id.toString(),
      matchObject.challengedUser,
      matchResult,
    );

    const matchToBeUpdated = await this.matchRepository.create(matchObject);
    await this.matchRepository.save(matchToBeUpdated);

    const finishedMatchObject: FinishedMatchDto = {
      id: id,
      result: matchResult,
      challengedChoice: challengedChoiceEntity,
      challengerChoice: challengerChoiceEntity,
    };

    return finishedMatchObject;
  }

  //-------------------------------------------------------------------------------------------------
  // Private Functions
  //-------------------------------------------------------------------------------------------------

  async _getComputersChoice(): Promise<string> {
    return await this.choiceService.getRandomChoice();
  }

  // UNIT TEST
  async _getMatchResult(
    challengerChoice: string,
    challengedChoice: string,
  ): Promise<Result> {
    if (challengerChoice === challengedChoice) return Result.DRAW;

    const choice = await this.choiceService.getOneWithRelations(
      challengerChoice,
    );
    const getsBeatenBy = choice.getsBeatenBy.find(
      (choice) => choice.id === challengedChoice,
    );

    if (!getsBeatenBy) {
      return Result.CHALLENGER_WIN;
    }

    return Result.CHALLENGED_WIN;
  }
}
