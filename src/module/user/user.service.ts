import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { comparePasswords } from 'src/helper/utils';
import { DeleteResult, Not, Repository, UpdateResult } from 'typeorm';
import { Result } from '../match/enum/result.enum';
import { LoginUserDto } from './dto/loginUser.dto';
import { OwnUserDto } from './dto/ownUser.dto';
import { PublicUserDto } from './dto/publicUser.dto';
import { UserDto } from './dto/user.dto';
import { UserEntity } from './entity/user.entity';
import { Points } from './enum/points.enum';

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
        points: true,
      },
    });
  }

  async getAllWithoutOwn(user: any): Promise<PublicUserDto[]> {
    return await this.userRepository.find({
      where: { id: Not(user.id) },
      select: {
        id: true,
        username: true,
        points: true,
      },
    });
  }

  async getOwn(user: any): Promise<OwnUserDto> {
    return await this.userRepository.findOne({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        points: true,
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
    const userToBeCreated = await this.userRepository.create(user);
    return await this.userRepository.save(userToBeCreated);
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

  async updatePoints(
    challengerUserId: string,
    challengedUserId: string,
    result: Result,
  ) {
    switch (result) {
      case Result.CHALLENGER_WIN:
        await this._update(Points.WIN_POINTS, challengerUserId);
        await this._update(Points.LOSE_POINTS, challengedUserId);
        break;
      case Result.CHALLENGED_WIN:
        await this._update(Points.WIN_POINTS, challengedUserId);
        await this._update(Points.LOSE_POINTS, challengerUserId);
        break;
      default:
        break;
    }
  }

  //-------------------------------------------------------------------------------------------------
  // Private Functions
  //-------------------------------------------------------------------------------------------------

  async _update(points: Points, userId: string) {
    const userEntity = await this.userRepository.findOne({
      where: { id: userId },
    });

    const updatedPoints =
      points === Points.LOSE_POINTS
        ? userEntity.points - points
        : userEntity.points + points;
    const toBeUpdatedPoints = updatedPoints < 0 ? 0 : updatedPoints;

    const pointsToBeUpdated = await this.userRepository.create({
      id: userEntity.id,
      points: toBeUpdatedPoints,
    });
    await this.userRepository.save(pointsToBeUpdated);
  }
}
