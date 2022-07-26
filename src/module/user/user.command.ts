import { Command, Option } from 'nestjs-command';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from './user.service';

@Injectable()
export class UserCommand {
  constructor(private readonly userService: UserService) {}

  @Command({
    command: 'all:user',
    describe: 'delievers all users',
  })
  async getAll() {
    console.table(await this.userService.getAll());
  }

  @Command({
    command: 'withoutown:user',
    describe: 'delievers all users without your own',
  })
  async GetAllWithoutOwn(
    @Option({
      name: 'userId',
      describe: 'your userId',
      type: 'string',
      alias: 'u',
      required: true,
    })
    userId: string,
  ) {
    const userObject = { id: userId };
    const user = await this.userService.getOne(userId);
    if (!user) {
      throw new HttpException(
        `There is no valid user with id ${userId}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    console.table(await this.userService.getAllWithoutOwn(userObject));
  }

  @Command({
    command: 'whoami:user',
    describe: 'your own user',
  })
  async GetOwn(
    @Option({
      name: 'userId',
      describe: 'your userId',
      type: 'string',
      alias: 'u',
      required: true,
    })
    userId: string,
  ) {
    const userObject = { id: userId };
    const user = await this.userService.getOne(userId);
    if (!user) {
      throw new HttpException(
        `There is no valid user with id ${userId}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    console.table(await this.userService.getOwn(userObject));
  }
}
