import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/share/models/user.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async validateUser(dto: LoginUserDto) {
    let user: User;

    try {
      user = await this.userService.getById(dto.userId);
    } catch (error) {
      throw new ForbiddenException('ユーザーIDまたはパスワードが異なります。');
    }

    const isValid = await bcrypt.compare(dto.password, user.hashedPassword);

    if (!isValid) {
      throw new ForbiddenException('ユーザーIDまたはパスワードが異なります。');
    }

    return user;
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
