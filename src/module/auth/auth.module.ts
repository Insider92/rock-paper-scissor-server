import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/module/user/user.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './controller/auth.controller';
import * as config from 'config';
import { AuthCommand } from './auth.command';

const authConfig = config.get('auth');

@Module({
  imports: [
    UserModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.register({
      secret: authConfig.jwtSecret,
      signOptions: {
        expiresIn: authConfig.jwtExpiresIn,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthCommand],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
