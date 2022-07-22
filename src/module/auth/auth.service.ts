import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/module/user/dto/loginUser.dto';
import { UserDto } from 'src/module/user/dto/user.dto';
import { UserService } from 'src/module/user/user.service';
import { LoginStatus } from './interface/login-status.interface';
import { JwtPayload } from './interface/payload.interface';
import { RegistrationStatus } from './interface/regisration-status.interface';
import * as config from 'config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(userDto: UserDto): Promise<RegistrationStatus> {
    let status: RegistrationStatus = {
      success: true,
      message: 'user registered',
    };

    try {
      await this.usersService.create(userDto);
    } catch (err) {
      status = {
        success: false,
        message: err,
      };
    }

    return status;
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginStatus> {
    const user = await this.usersService.findByLogin(loginUserDto);
    const token = this._createToken(user);

    return {
      username: user.username,
      ...token,
    };
  }

  async validateUser(payload: JwtPayload): Promise<UserDto> {
    const { username } = payload;
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  private _createToken({ username }: UserDto): any {
    const { jwtExpiresIn } = config.get('auth');

    const user: JwtPayload = { username };
    const accessToken = this.jwtService.sign(user);
    return {
      jwtExpiresIn,
      accessToken,
    };
  }
}
