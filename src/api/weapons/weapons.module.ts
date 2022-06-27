import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { WeaponsService } from './weapons.service';

@Module({
  providers: [WeaponsService, PrismaService]
})
export class WeaponsModule {}
