import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChoiceModule } from '../choice/choice.module';
import { UserModule } from '../user/user.module';
import { MatchController } from './controller/match.controller';
import { MatchEntity } from './entity/match.entity';
import { MatchService } from './match.service';

@Module({
  imports: [TypeOrmModule.forFeature([MatchEntity]), ChoiceModule, UserModule],
  controllers: [MatchController],
  providers: [MatchService],
})
export class MatchModule {}
