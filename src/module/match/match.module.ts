import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChoiceEntity } from '../choice/entity/choice.entity';
import { MatchController } from './controller/match.controller';
import { MatchEntity } from './entity/match.entity';
import { MatchService } from './match.service';

@Module({
    imports: [TypeOrmModule.forFeature([MatchEntity, ChoiceEntity])],
    controllers: [MatchController],
    providers: [MatchService],
  })
export class MatchModule {}
