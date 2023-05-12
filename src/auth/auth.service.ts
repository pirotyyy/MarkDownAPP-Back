import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async validateUser(dto: LoginUserDto) {
    try {
      const user = await this.userService.getById(dto.userId);

      return user;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw new UnauthorizedException('Username or password is incorrect');
      } else {
        console.log(error);
        throw error;
      }
    }
  }

  async login(dto: LoginUserDto) {
    const user = await this.validateUser(dto);

    if (user) {
      const payload = { sub: user.userId, username: user.username };
      const token = await this.jwtService.signAsync(payload);
      return {
        access_token: token,
      };
    }
  }
}
