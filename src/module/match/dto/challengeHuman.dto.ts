import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChallengeHumanDto {
  @ApiProperty()
  @IsNotEmpty()
  challengedUser: string;
  @ApiProperty()
  @IsNotEmpty()
  choice: string;
}
