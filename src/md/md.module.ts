import { Module } from '@nestjs/common';
import { MdController } from './md.controller';
import { MdService } from './md.service';

@Module({
  controllers: [MdController],
  providers: [MdService],
})
export class MdModule {}
