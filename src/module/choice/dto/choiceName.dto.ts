import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsAlphanumeric, IsString } from 'class-validator';
import { AbstractOrmEntity } from 'src/model/abstract.entity';

export class ChoiceNameDto extends AbstractOrmEntity {
  @ApiProperty({
    description: 'Has to be an alphanumeric string',
    example: 'rock',
  })
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  name: string;
}
