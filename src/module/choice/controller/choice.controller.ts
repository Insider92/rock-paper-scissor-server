import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChoiceService } from '../choice.service';
import { ChoiceDto } from '../dto/choice.dto';

@Controller('v1/choice')
@ApiTags('choice')
export class ChoiceController {
  constructor(private choiceService: ChoiceService) {}

  @ApiOperation({
    description: 'Delivers an array of choices',
  })
  @ApiResponse({
    status: 200,
    type: ChoiceDto,
    isArray: true,
  })
  @Get()
  async GetAll(): Promise<ChoiceDto[]> {
    return await this.choiceService.getAll();
  }
}
