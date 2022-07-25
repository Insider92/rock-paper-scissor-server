import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ChoiceEntity } from 'src/module/choice/entity/choice.entity';
import { UserEntity } from 'src/module/user/entity/user.entity';

export class ChallengeHumanDto {
  @ApiProperty()
  @IsNotEmpty()
  challengedUser: UserEntity;

  @ApiProperty()
  @IsNotEmpty()
  choice: ChoiceEntity;
}
