import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ResultsModule } from './results/results.module';
import { RankingModule } from './ranking/ranking.module';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { SchedulesModule } from './schedules/schedules.module';
import { UsersService } from './users/users.service';
import { PrismaService } from 'src/prisma.service';
import { StatsController } from './stats/stats.controller';
import { StatsModule } from './stats/stats.module';
import { StatsService } from './stats/stats.service';

@Module({
  controllers: [ApiController, UsersController, StatsController],
  providers: [ApiService, PrismaService, UsersService, StatsService],
  imports: [
    ResultsModule,
    RankingModule,
    UsersModule,
    SchedulesModule,
    StatsModule,
  ],
})
export class ApiModule {}
