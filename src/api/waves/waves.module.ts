import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { WavesService } from './waves.service';

@Module({
  providers: [WavesService, PrismaService]
})
export class WavesModule {}
