import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ChoiceNameDto } from 'src/module/choice/dto/choiceName.dto';
import { Result } from '../enum/result.enum';

export class FinishedMatchDto {
  @ApiProperty()
  @IsNotEmpty()
  result: Result;
  @ApiProperty()
  @IsNotEmpty()
  challengerChoice: ChoiceNameDto;
  @ApiProperty()
  challengedChoice: ChoiceNameDto;
}
