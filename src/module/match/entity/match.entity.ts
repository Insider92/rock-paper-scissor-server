import { AbstractOrmEntity } from 'src/model/abstract.entity';
import { UserEntity } from 'src/module/user/entity/user.entity';
import { ChoiceEntity } from 'src/module/choice/entity/choice.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Status } from '../enum/status.enum';
import { OpponentType } from '../enum/opponentType.enum';
import { Result } from '../enum/result.enum';

@Entity('match')
export class MatchEntity extends AbstractOrmEntity {
  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ONGOING,
  })
  status: Status;

  @Column({
    type: 'enum',
    enum: OpponentType,
    default: OpponentType.COMPUTER,
  })
  opponentType: OpponentType;

  @Column({
    type: 'enum',
    enum: Result,
    default: Result.TBD,
  })
  result: Result;

  @ManyToOne(() => UserEntity, (challengerUser) => challengerUser.id)
  challenger: UserEntity;

  @ManyToOne(() => UserEntity, (challengedUser) => challengedUser.id)
  challengedUser: UserEntity;

  @ManyToOne(() => ChoiceEntity, (challengerChoice) => challengerChoice.id)
  challengerChoice: ChoiceEntity;

  @ManyToOne(() => ChoiceEntity, (challengedChoice) => challengedChoice.id)
  challengedChoice: ChoiceEntity;
}
