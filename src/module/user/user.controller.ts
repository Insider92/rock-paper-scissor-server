import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OwnUserDto } from './dto/ownUser.dto';
import { PublicUserDto } from './dto/publicUser.dto';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('v1/user')
@ApiTags('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Delivers an array of all users',
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
  @Get()
  async GetAll(): Promise<PublicUserDto[]> {
    return await this.userService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description:
      'Delivers an array of all users without your own - can be used to search for opponents',
  })
  @ApiResponse({
    status: 200,
    type: PublicUserDto,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Get('/others')
  async GetAllWithoutOwn(@Req() req: any): Promise<PublicUserDto[]> {
    return await this.userService.getAllWithoutOwn(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Delivers your own user',
  })
  @ApiResponse({
    status: 200,
    type: OwnUserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Get('/whoami')
  async GetOwn(@Req() req: any): Promise<OwnUserDto> {
    return await this.userService.getOwn(req.user);
  }
}
