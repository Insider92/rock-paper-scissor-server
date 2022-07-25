import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { comparePasswords } from 'src/helper/utils';
import { DeleteResult, Not, Repository, UpdateResult } from 'typeorm';
import { LoginUserDto } from './dto/loginUser.dto';
import { OwnUserDto } from './dto/ownUser.dto';
import { PublicUserDto } from './dto/publicUser.dto';
import { UserDto } from './dto/user.dto';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getAll(): Promise<PublicUserDto[]> {
    return await this.userRepository.find({
      select: {
        id: true,
        username: true,
      },
    });
  }

  async getAllWithoutOwn(user: any): Promise<PublicUserDto[]> {
    return await this.userRepository.find({
      where: {id : Not(user.id) },
      select: {
        id: true,
        username: true,
      },
    });
  }

  async getOwn(user: any): Promise<OwnUserDto> {
    return await this.userRepository.findOne({
      where: { id : user.id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      },
    });
  }

  async getOne(id: string): Promise<UserDto> {
    return await this.userRepository.findOne({
      where: { id: id },
      select: { id: true, username: true },
    });
  }

  async create(user: UserDto): Promise<UserDto> {
    const { username } = user;
    const userAlreadyExists = await this.userRepository.findOne({
      where: { username: username },
    });
    if (userAlreadyExists) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    // need to create user first and save it, so that @BeforeInsert() decorator triggers
    const userToBeSaved: UserEntity = await this.userRepository.create(user);
    return await this.userRepository.save(userToBeSaved);
  }

  async update(id: string, user: UserDto): Promise<UpdateResult> {
    return await this.userRepository.update(id, user);
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.userRepository.delete(id);
  }

  async findByLogin(user: LoginUserDto): Promise<UserDto> {
    const { username, password } = user;
    const existingUser = await this.userRepository.findOne({
      where: { username: username },
    });

    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    const areEqual = await comparePasswords(existingUser.password, password);

    if (!areEqual) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return existingUser;
  }

  async findByUsername(username: string): Promise<UserDto> {
    return await this.userRepository.findOne({ where: { username: username } });
  }
}
