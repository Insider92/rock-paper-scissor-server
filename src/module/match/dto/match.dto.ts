import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { ChoiceEntity } from 'src/module/choice/entity/choice.entity';
import { UserEntity } from 'src/module/user/entity/user.entity';
import { OpponentType } from '../enum/opponentType.enum';
import { Result } from '../enum/result.enum';
import { Status } from '../enum/status.enum';

export class MatchDto {
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
    example: OpponentType.COMPUTER,
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
  challenger: UserEntity;

  @ApiProperty()
  challengedUser: UserEntity;

  @ApiProperty()
  @IsNotEmpty()
  challengerChoice: ChoiceEntity;

  @ApiProperty()
  challengedChoice: ChoiceEntity;
}
