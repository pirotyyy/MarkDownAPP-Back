import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MdModule } from './md/md.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ImageModule } from './image/image.module';

@Module({
  imports: [MdModule, UserModule, AuthModule, ImageModule],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
