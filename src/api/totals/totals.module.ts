import { Module } from '@nestjs/common';
import { TotalsService } from './totals.service';
import { TotalsController } from './totals.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [TotalsService, PrismaService],
  controllers: [TotalsController]
})
export class TotalsModule {}
