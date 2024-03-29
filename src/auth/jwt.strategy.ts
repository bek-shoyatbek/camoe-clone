import { ExtractJwt, Strategy } from 'passport-jwt';

import { PassportStrategy } from '@nestjs/passport';

import { HttpException, Injectable } from '@nestjs/common';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const { userId } = payload;
    // Check if the user exists in the database
    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new HttpException('Invalid credentials', 401);
    }

    return payload;
  }
}
