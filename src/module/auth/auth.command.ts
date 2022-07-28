import { Command, Option } from 'nestjs-command';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthCommand {
  constructor(private readonly authService: AuthService) {}

  @Command({
    command: 'register:auth',
    describe: 'registers an user',
  })
  async register(
    @Option({
      name: 'username',
      describe: 'the username',
      type: 'string',
      alias: 'u',
      required: true,
    })
    username: string,

    @Option({
      name: 'password',
      describe: 'the password',
      type: 'string',
      alias: 'p',
      required: true,
    })
    password: string,

    @Option({
      name: 'email',
      describe: 'the email',
      type: 'string',
      alias: 'e',
      required: true,
    })
    email: string,
  ) {

    const emailReg =  /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if(emailReg.test(email)){
      throw new HttpException(
        `Email is not valid`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    console.log(
      await this.authService.register({
        username,
        password,
        email,
      }),
    );
  }

  @Command({
    command: 'login:auth',
    describe: 'login as an user',
  })
  async login(
    @Option({
      name: 'username',
      describe: 'the username',
      type: 'string',
      alias: 'u',
      required: true,
    })
    username: string,

    @Option({
      name: 'password',
      describe: 'the password',
      type: 'string',
      alias: 'p',
      required: true,
    })
    password: string,
  ) {
    console.log(
      await this.authService.login({
        username,
        password,
      }),
    );
  }
}
