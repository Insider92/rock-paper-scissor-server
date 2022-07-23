import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChoiceService } from './choice.service';
import { ChoiceController } from './controller/choice.controller';
import { ChoiceEntity } from './entity/choice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChoiceEntity])],
  controllers: [ChoiceController],
  providers: [ChoiceService],
})
export class ChoiceModule {}
