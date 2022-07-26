import { AbstractOrmEntity } from 'src/model/abstract.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';
import * as bcryptjs from 'bcryptjs';

@Entity('user')
export class UserEntity extends AbstractOrmEntity {
  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  username: string;
  @Column({
    type: 'varchar',
    nullable: false,
  })
  password: string;
  @Column({
    type: 'varchar',
    nullable: false,
  })
  email: string;

  @Column({
    type: 'int',
    default: 0,
  })
  points: number;

  @BeforeInsert() async hashPassword() {
    this.password = await bcryptjs.hash(this.password, 10);
  }
}
