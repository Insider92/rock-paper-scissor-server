import { Body, Controller, Get, HttpException, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateMatchDto } from '../dto/createMatch.dto';
import { MatchDto } from '../dto/match.dto';
import { MatchService } from '../match.service';

@Controller('v1/match')
@ApiTags('match')
export class MatchController {
  constructor(private matchService: MatchService) {}

  @Get()
  @ApiOperation({
    description: 'Delivers an array of matches',
  })
  @ApiResponse({
    status: 200,
    type: MatchDto,
    isArray: true,
  })
  async GetAll(): Promise<MatchDto[]> {
    return await this.matchService.getAll();
  }

  @Post()
  async Create(@Body() match: CreateMatchDto): Promise<MatchDto> {
    const eventExists = await this.matchService.choiceExists(match);
    if (!eventExists)
      throw new HttpException(
        `There is no valid choice with id ${match.choice}`,
        404,
      );

    // check if user exsitis if given
    // User Auth

    return await this.matchService.createMatch(match);
  }
}
