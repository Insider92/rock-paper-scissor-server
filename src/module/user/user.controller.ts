import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('v1/user')
@ApiTags('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Delivers an array of users',
  })
  @ApiResponse({
    status: 200,
    type: UserDto,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async GetAll(@Req() req: any): Promise<UserDto[]> {
    console.log(req.user);
    return await this.userService.getAll();
  }
}

/**
 *
 * TO-DO: List with all user but not with own
 * Passwort should not be given to other people
 *
 */
