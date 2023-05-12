import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/share/models/user.model';
import { Request } from 'express';
import { Msg } from 'src/share/interfaces/Msg.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() dto: CreateUserDto): Promise<Msg> {
    return this.userService.create(dto);
  }

  @Get(':userId/detail')
  get(@Param('userId') userId: string): Promise<Omit<User, 'hashedPassword'>> {
    return this.userService.getById(userId);
  }
}
