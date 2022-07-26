import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
export class OwnUserDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  @IsNotEmpty()
  createdAt: Date;
  @ApiProperty()
  @IsNotEmpty()
  username: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsNumber()
  points: number;
}
