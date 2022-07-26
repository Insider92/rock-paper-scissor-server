import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { ChoiceService } from './choice.service';

@Injectable()
export class ChoiceCommand {
  constructor(private readonly choiceService: ChoiceService) {}

  @Command({
    command: 'all:choice',
    describe: 'delievers all choices',
  })
  async getAll() {
    console.log(JSON.stringify(await this.choiceService.getAll(), null, '  '));
  }
}
