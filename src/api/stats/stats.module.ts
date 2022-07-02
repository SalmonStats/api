import { HttpModule, HttpService } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NicknameAndIconService } from '../nickname_and_icon/nickname_and_icon.service';
import { StatsService } from './stats.service';

@Module({
  imports: [HttpModule],
  providers: [StatsService, PrismaService, NicknameAndIconService],
})
export class StatsModule {}
