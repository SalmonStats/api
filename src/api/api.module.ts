import { CacheInterceptor, Module } from '@nestjs/common';
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
import { NicknameAndIconController } from './nickname_and_icon/nickname_and_icon.controller';
import { NicknameAndIconService } from './nickname_and_icon/nickname_and_icon.service';

@Module({
  controllers: [
    ApiController,
    UsersController,
    StatsController,
    NicknameAndIconController,
  ],
  providers: [
    ApiService,
    PrismaService,
    UsersService,
    StatsService,
    NicknameAndIconService,
  ],
  imports: [
    ResultsModule,
    RankingModule,
    UsersModule,
    SchedulesModule,
    StatsModule,
  ],
})
export class ApiModule {}
