import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from 'src/module/user/dto/loginUser.dto';
import { UserDto } from 'src/module/user/dto/user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginStatus } from './interface/login-status.interface';
import { RegistrationStatus } from './interface/regisration-status.interface';

@Controller('v1/auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    description: 'Tries to register a new user',
  })
  @ApiResponse({
    status: 400,
    description: 'The registration failed with given error in result body',
  })
  @Post('register')
  public async register(
    @Body() createUserDto: UserDto,
  ): Promise<RegistrationStatus> {
    const result: RegistrationStatus = await this.authService.register(
      createUserDto,
    );

    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }

    return result;
  }

  @ApiOperation({
    description: 'Tries to login with given user',
  })
  @ApiResponse({
    status: 200,
    type: LoginDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 401,
    description: 'User not found',
  })
  @Post('login')
  public async login(@Body() loginUserDto: LoginUserDto): Promise<LoginStatus> {
    return await this.authService.login(loginUserDto);
  }
}
