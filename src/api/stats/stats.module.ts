import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { StatsService } from './stats.service';

@Module({
  providers: [StatsService, PrismaService],
})
export class StatsModule {}
