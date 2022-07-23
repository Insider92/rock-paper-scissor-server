import { AbstractOrmEntity } from 'src/model/abstract.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

@Entity('choice')
export class ChoiceEntity extends AbstractOrmEntity {
  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  name: string;

  @ManyToMany(() => ChoiceEntity)
  @JoinTable()
  getsBeatenBy: ChoiceEntity[];
}
