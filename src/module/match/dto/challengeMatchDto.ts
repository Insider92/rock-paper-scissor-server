import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { AbstractOrmEntity } from 'src/model/abstract.entity';
import { OpponentType } from '../enum/opponentType.enum';
import { Result } from '../enum/result.enum';
import { Status } from '../enum/status.enum';

export class ChallengeMatchDto extends AbstractOrmEntity {
  @ApiProperty({
    description: 'Shows the status of the match',
    enum: Status,
    example: Status.FINISHED,
  })
  @IsEnum(Status)
  status: Status;
  @ApiProperty({
    description: 'Shows type of opponent',
    enum: OpponentType,
    example: OpponentType.HUMAN,
  })
  @IsEnum(OpponentType)
  opponentType: OpponentType;
  @ApiProperty({
    description: 'Shows type of opponent',
    enum: Result,
    example: Result.TBD,
  })
  @IsEnum(Result)
  result: Result;
  @ApiProperty()
  @IsNotEmpty()
  challengerUser: string;
  @ApiProperty()
  challengedUser: string;
  @ApiProperty()
  @IsNotEmpty()
  challengerChoice: string;
}
