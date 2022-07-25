import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChallengeChoiceDto {
  @ApiProperty()
  @IsNotEmpty()
  choice: string;
}
