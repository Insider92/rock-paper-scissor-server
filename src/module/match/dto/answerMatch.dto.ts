import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UserEntity } from 'src/module/user/entity/user.entity';

export class AnswerMatchDto {
  @ApiProperty()
  @IsNotEmpty()
  choice: UserEntity;
}
