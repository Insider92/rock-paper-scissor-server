import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/module/auth/jwt-auth.guard';
import { AnswerChallengeDto } from '../dto/answerChallenge.dto';
import { ChallengeComputerDto } from '../dto/challengeComputer.dto';
import { ChallengeHumanDto } from '../dto/challengeHuman.dto';
import { FinishedMatchDto } from '../dto/finishedMatch.dto';
import { MatchDto } from '../dto/match.dto';
import { Status } from '../enum/status.enum';
import { MatchService } from '../match.service';

@Controller('v1/match')
@ApiTags('match')
export class MatchController {
  constructor(private matchService: MatchService) {}

  @ApiOperation({
    description: 'Delivers an array of finished matches',
  })
  @ApiResponse({
    status: 200,
    type: MatchDto,
    isArray: true,
  })
  @Get()
  async GetAllFinishedMatches(): Promise<MatchDto[]> {
    return await this.matchService.GetAllMatches();
  }

  @ApiOperation({
    description: 'Delivers an array of for all finished matches for the user',
  })
  @ApiResponse({
    status: 200,
    type: MatchDto,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @UseGuards(JwtAuthGuard)
  @Get('/history')
  async GetUsersFinishedMatches(@Req() req: any): Promise<MatchDto[]> {
    return await this.matchService.GetUsersFinishedMachtes(req.user);
  }

  @ApiOperation({
    description:
      'Delivers an array of all matches where the user is challenged',
  })
  @ApiResponse({
    status: 200,
    type: MatchDto,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @UseGuards(JwtAuthGuard)
  @Get('/challenges')
  async GetUsersChallenges(@Req() req: any): Promise<MatchDto[]> {
    return await this.matchService.GetUsersChallenges(req.user);
  }

  @ApiOperation({
    description: 'Challenges a computer to a match',
  })
  @ApiResponse({
    status: 404,
    description: 'There is no valid choice for the given choice',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @UseGuards(JwtAuthGuard)
  @Post('/computer')
  async challengeComputer(
    @Body() match: ChallengeComputerDto,
    @Req() req: any,
  ): Promise<FinishedMatchDto> {
    const choiceExists = await this.matchService.choiceExists(
      match.choice.toString(),
    );
    if (!choiceExists)
      throw new HttpException(
        `There is no valid choice with id ${match.choice}`,
        404,
      );

    return await this.matchService.challengeComputer(match, req.user);
  }

  @ApiOperation({
    description: 'Challenges a human user to a match',
  })
  @ApiResponse({
    status: 404,
    description: 'There is no valid choice for the given choice',
  })
  @ApiResponse({
    status: 404,
    description: 'There is no valid user for the challenged user',
  })
  @ApiResponse({
    status: 404,
    description: 'There should be a valid user id not an empty user id string',
  })
  @ApiResponse({
    status: 404,
    description: "You can't challenge yourself",
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @UseGuards(JwtAuthGuard)
  @Post('/human')
  async challengeHuman(
    @Body() match: ChallengeHumanDto,
    @Req() req: any,
  ): Promise<MatchDto> {
    if (match.challengedUser.toString() === '') {
      throw new HttpException(
        `There should be a valid user id not an empty user id string`,
        404,
      );
    }

    if (match.challengedUser.toString() === req.user.id.toString()) {
      throw new HttpException(`You can't challenge yourself`, 404);
    }

    const choiceExists = await this.matchService.choiceExists(
      match.choice.toString(),
    );
    if (!choiceExists)
      throw new HttpException(
        `There is no valid choice with id ${match.choice}`,
        404,
      );

    if (match.challengedUser) {
      const userExists = await this.matchService.userExists(
        match.challengedUser.toString(),
      );
      if (!userExists)
        throw new HttpException(
          `There is no valid user with id ${match.challengedUser}`,
          404,
        );
    }
    return await this.matchService.challengeHuman(match, req.user);
  }

  @ApiOperation({
    description:
      'Creates a match vs human user or computer if no challenged user is given',
  })
  @ApiResponse({
    status: 404,
    description: 'There is no valid choice for the given choice',
  })
  @ApiResponse({
    status: 404,
    description: 'There is no valid user for the challenged user',
  })
  @ApiResponse({
    status: 404,
    description: 'There should be a valid user id not an empty user id string',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async AnswerChallenge(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() match: AnswerChallengeDto,
    @Req() req: any,
  ): Promise<FinishedMatchDto> {
    const choiceExists = await this.matchService.choiceExists(
      match.choice.toString(),
    );
    if (!choiceExists)
      throw new HttpException(
        `There is no valid choice with id ${match.choice}`,
        404,
      );
    const exsitingMatch = await this.matchService.getOneWithRelations(id);

    if (exsitingMatch.status === Status.FINISHED)
      throw new HttpException(
        `The match with id ${id} is already finished - you can't update your choice anymore`,
        404,
      );

    if (exsitingMatch.challengedUser.id !== req.user.id)
      throw new HttpException(`You are not authorized to play this match`, 401);

    return await this.matchService.answerChallenge(id, match, req.user);
  }
}
