import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsAlphanumeric, IsString, IsEmail } from 'class-validator';

export class PublicUserDto {
    @ApiProperty()
    @IsNotEmpty()
    id: string
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsAlphanumeric()
    username: string;
}
