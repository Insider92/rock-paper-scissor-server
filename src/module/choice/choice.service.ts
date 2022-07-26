import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChoiceDto } from './dto/choice.dto';
import { ChoiceNameDto } from './dto/choiceName.dto';
import { ChoiceEntity } from './entity/choice.entity';

@Injectable()
export class ChoiceService {
  constructor(
    @InjectRepository(ChoiceEntity)
    private readonly choiceRepository: Repository<ChoiceEntity>,
  ) {}

  async getAll(): Promise<ChoiceDto[]> {
    return await this.choiceRepository.find({ relations: ['getsBeatenBy'] });
  }

  async getOne(id: string): Promise<ChoiceNameDto> {
    return await this.choiceRepository.findOne({
      where: { id: id },
    });
  }

  async getOneWithRelations(id: string): Promise<ChoiceDto> {
    return await this.choiceRepository.findOne({
      where: { id: id },
      relations: ['getsBeatenBy'],
    });
  }

  async getRandomChoice(): Promise<string> {
    const choice = await this.choiceRepository
      .createQueryBuilder('choice')
      .select('id')
      .orderBy('RAND()') // Works only in mysql
      .limit(1)
      .execute();
    return choice[0].id;
  }
}
