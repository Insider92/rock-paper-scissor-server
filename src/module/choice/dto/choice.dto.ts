import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsAlphanumeric, IsString } from 'class-validator';
import { ChoiceEntity } from '../entity/choice.entity';

export class ChoiceDto {
  @ApiProperty({
    description: 'Has to be an alphanumeric string',
    example: 'rock',
  })
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  name: string;
  @IsNotEmpty()
  getsBeatenBy: ChoiceEntity[];
}
