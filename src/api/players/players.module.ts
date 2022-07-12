import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NicknameAndIconService } from '../nickname_and_icon/nickname_and_icon.service';
import { PlayersService } from './players.service';

@Module({
  imports: [HttpModule],
  providers: [PlayersService, PrismaService, NicknameAndIconService],
})
export class PlayersModule {}
