import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ChoiceEntity } from 'src/module/choice/entity/choice.entity';

export class AnswerChallengeDto {
  @ApiProperty()
  @IsNotEmpty()
  choice: ChoiceEntity;
}