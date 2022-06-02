import { CacheInterceptor, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NicknameAndIconService } from '../nickname_and_icon/nickname_and_icon.service';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';

@Module({
  controllers: [RankingController],
  providers: [RankingService, PrismaService, NicknameAndIconService],
})
export class RankingModule {}
