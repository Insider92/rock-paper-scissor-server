import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ChoiceDto } from 'src/module/choice/dto/choice.dto';
import { Result } from '../enum/result.enum';

export class FinishedMatchDto {
  @ApiProperty()
  @IsNotEmpty()
  result: Result;

  @ApiProperty()
  @IsNotEmpty()
  challengerChoice: ChoiceDto;

  @ApiProperty()
  challengedChoice: ChoiceDto;
}
