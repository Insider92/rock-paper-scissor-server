import { AbstractOrmEntity } from 'src/model/abstract.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';

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
  @BeforeInsert() async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
