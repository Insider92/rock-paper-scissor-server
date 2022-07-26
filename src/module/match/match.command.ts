import { Command, Option } from 'nestjs-command';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MatchService } from './match.service';
import { UserService } from '../user/user.service';
import { ChoiceService } from '../choice/choice.service';
import { Status } from './enum/status.enum';

@Injectable()
export class MatchCommand {
  constructor(
    private readonly matchService: MatchService,
    private readonly userService: UserService,
    private readonly choiceService: ChoiceService,
  ) {}

  @Command({
    command: 'all:match',
    describe: 'delievers all finished matches',
  })
  async GetAllFinishedMatches() {
    console.table(await this.matchService.GetAllMatches());
  }

  @Command({
    command: 'history:match',
    describe: 'delivers all finished matches for the user',
  })
  async GetUsersFinishedMatches(
    @Option({
      name: 'userId',
      describe: 'your userId',
      type: 'string',
      alias: 'u',
      required: true,
    })
    userId: string,
  ) {
    const userObject = { id: userId };
    const user = await this.userService.getOne(userId);
    if (!user) {
      throw new HttpException(
        `There is no valid user with id ${userId}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    console.table(await this.matchService.GetUsersFinishedMachtes(userObject));
  }

  @Command({
    command: 'challenges:match',
    describe: 'delivers all matches where the user is challenged',
  })
  async GetUsersChallenges(
    @Option({
      name: 'userId',
      describe: 'your userId',
      type: 'string',
      alias: 'u',
      required: true,
    })
    userId: string,
  ) {
    const userObject = { id: userId };
    const user = await this.userService.getOne(userId);
    if (!user) {
      throw new HttpException(
        `There is no valid user with id ${userId}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    console.table(await this.matchService.GetUsersChallenges(userObject));
  }

  @Command({
    command: 'computer:match',
    describe: 'challenges a computer to a match',
  })
  async challengeComputer(
    @Option({
      name: 'userId',
      describe: 'your userId',
      type: 'string',
      alias: 'u',
      required: true,
    })
    userId: string,

    @Option({
      name: 'choiceId',
      describe: 'the id of the choice you want to give',
      type: 'string',
      alias: 'c',
      required: true,
    })
    choiceId: string,
  ) {
    const userObject = { id: userId };
    const matchObject = { choice: choiceId };
    const user = await this.userService.getOne(userId);
    if (!user) {
      throw new HttpException(
        `There is no valid user with id ${userId}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    const choice = await this.choiceService.getOne(choiceId);
    if (!choice) {
      throw new HttpException(
        `There is no valid choice with id ${choiceId}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    console.table(
      await this.matchService.challengeComputer(matchObject, userObject),
    );
  }

  @Command({
    command: 'human:match',
    describe: 'challenges a human to a match',
  })
  async challengeHuman(
    @Option({
      name: 'userId',
      describe: 'your userId',
      type: 'string',
      alias: 'u',
      required: true,
    })
    userId: string,

    @Option({
      name: 'challengedUserId',
      describe: 'the id of the user you want to challenge',
      type: 'string',
      alias: 'cu',
      required: true,
    })
    challengedUserId: string,

    @Option({
      name: 'choiceId',
      describe: 'the id of the choice you want to give',
      type: 'string',
      alias: 'c',
      required: true,
    })
    choiceId: string,
  ) {
    const userObject = { id: userId };
    const matchObject = { challengedUser: challengedUserId, choice: choiceId };
    const user = await this.userService.getOne(userId);
    if (!user) {
      throw new HttpException(
        `There is no valid user with id ${userId}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    const challengeUser = await this.userService.getOne(challengedUserId);
    if (!challengeUser) {
      throw new HttpException(
        `There is no valid user to challenge with id ${challengedUserId}`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const choice = await this.choiceService.getOne(choiceId);
    if (!choice) {
      throw new HttpException(
        `There is no valid choice with id ${choiceId}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    console.table(
      await this.matchService.challengeHuman(matchObject, userObject),
    );
  }

  @Command({
    command: 'answer:match',
    describe: 'answers a challenge from another user',
  })
  async answerChallenge(
    @Option({
      name: 'userId',
      describe: 'your userId',
      type: 'string',
      alias: 'u',
      required: true,
    })
    userId: string,

    @Option({
      name: 'matchId',
      describe: 'the id of the match you want to answer',
      type: 'string',
      alias: 'm',
      required: true,
    })
    matchId: string,

    @Option({
      name: 'choiceId',
      describe: 'the id of the choice you want to give',
      type: 'string',
      alias: 'c',
      required: true,
    })
    choiceId: string,
  ) {
    const userObject = { id: userId };
    const matchObject = { choice: choiceId };
    const user = await this.userService.getOne(userId);
    if (!user) {
      throw new HttpException(
        `There is no valid user with id ${userId}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    const exsitingMatch = await this.matchService.getOneWithRelations(matchId);

    if (!exsitingMatch.status)
      throw new HttpException(
        `There is no valid match with id ${matchId}`,
        HttpStatus.NOT_FOUND,
      );

    if (exsitingMatch.status === Status.FINISHED)
      throw new HttpException(
        `The match with id ${matchId} is already finished - you can't update your choice anymore`,
        HttpStatus.NOT_FOUND,
      );

    if (exsitingMatch.challengedUser.id !== userId)
      throw new HttpException(
        `You are not authorized to play this match`,
        HttpStatus.UNAUTHORIZED,
      );

    const choice = await this.choiceService.getOne(choiceId);
    if (!choice) {
      throw new HttpException(
        `There is no valid choice with id ${choiceId}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    console.table(
      await this.matchService.answerChallenge(matchId, matchObject, userObject),
    );
  }
}
