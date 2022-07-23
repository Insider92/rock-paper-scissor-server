import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChoiceService } from '../choice.service';
import { ChoiceDto } from '../dto/choice.dto';

@Controller('v1/choice')
@ApiTags('user')
export class ChoiceController {
  constructor(private choiceService: ChoiceService) {}

  @Get()
  @ApiOperation({
    description: 'Delivers an array of choices',
  })
  @ApiResponse({
    status: 200,
    type: ChoiceDto,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async GetAll(): Promise<ChoiceDto[]> {
    return await this.choiceService.getAll();
  }
}
