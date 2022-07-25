import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsBoolean()
  success: boolean;
  @ApiProperty()
  @IsString()
  message: string;
}
