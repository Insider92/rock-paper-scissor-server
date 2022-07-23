import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChoiceDto } from './dto/choice.dto';
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
}
