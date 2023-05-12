import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { MdService } from './md.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { SaveFileDto } from './dto/save-mdFile.dto';
import { GetMdDto } from './dto/get-md.dto';
import { UpdateMdDto } from './dto/update-md.dto';
import { AuthGuard } from '@nestjs/passport';
import { MdInfo } from 'src/share/models/mdInfo.model';
import { Md } from 'src/share/models/md.model';

@UseGuards(AuthGuard('jwt'))
@Controller('md')
export class MdController {
  constructor(private readonly mdService: MdService) {}

  @Post('save')
  async saveFile(@Body() dto: SaveFileDto): Promise<void> {
    return await this.mdService.saveMd(dto);
  }

  @Get(':mdId/detail')
  async getMd(@Param('mdId') mdId: string): Promise<Md> {
    return await this.mdService.getMd(mdId);
  }

  @Get('list')
  async getAllMd(): Promise<MdInfo[]> {
    return await this.mdService.getAllMdInfo();
  }

  @Get('query/:userId')
  async getMdInfoByUserId(@Param('userId') userId: string): Promise<MdInfo[]> {
    return await this.mdService.getMdInfoByUserId(userId);
  }

  @Delete(':mdId')
  async DeleteMd(@Param('mdId') mdId: string): Promise<void> {
    return await this.mdService.deleteMd(mdId);
  }

  @Put(':mdId')
  async UpdateMd(
    @Param('mdId') mdId: string,
    @Body() dto: UpdateMdDto,
  ): Promise<void> {
    return await this.mdService.updateMd(mdId, dto);
  }
}
