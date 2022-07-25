import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsAlphanumeric, IsString, IsEmail, IsNumber, IsOptional } from 'class-validator';

export class UserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  username: string;
  @ApiProperty()
  @IsNotEmpty()
  password: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
